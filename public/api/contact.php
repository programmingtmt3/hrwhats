<?php
/**
 * HRwhats contact form endpoint.
 *
 * Deployed as public_html/api/contact.php (copied from public/ by `next build`).
 * Secrets live OUTSIDE the web root in ~/hrwhats-config.php (see
 * config/hrwhats-config.example.php and docs/contact-form-setup.md).
 *
 * Always answers JSON: { "ok": true } or { "ok": false, "error": "<code>" }.
 * Never shows PHP errors to visitors; errors go to ~/hrwhats-contact.log.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// public_html/api/contact.php → account home directory (outside the web root).
$home = dirname(__DIR__, 2);
ini_set('error_log', $home . '/hrwhats-contact.log');

// Keep in sync with CONTACT_LIMITS in src/lib/contact-submit.ts.
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
const MAX_BODY_BYTES = 32768;
const RATE_LIMIT = 5;          // messages…
const RATE_WINDOW = 600;       // …per 10 minutes, per IP
const DEFAULT_ORIGINS = ['https://hrwhats.com'];

function respond(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(int $status, string $code, string $logMessage = ''): void
{
    if ($logMessage !== '') {
        error_log('[hrwhats-contact] ' . $logMessage);
    }
    respond($status, ['ok' => false, 'error' => $code]);
}

function textLength(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : (int) preg_match_all('/./us', $value);
}

set_exception_handler(static function (Throwable $e): void {
    fail(500, 'server_error', 'Uncaught ' . get_class($e) . ': ' . $e->getMessage());
});

// ---------- Method ----------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fail(405, 'method_not_allowed');
}

// ---------- Configuration (outside public_html) ----------
$configPath = $home . '/hrwhats-config.php';
if (!is_file($configPath)) {
    fail(500, 'server_error', "Config file not found: $configPath");
}
$config = require $configPath;
$requiredKeys = ['TURNSTILE_SECRET', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'MAIL_TO'];
if (!is_array($config)) {
    fail(500, 'server_error', 'Config file must return an array');
}
foreach ($requiredKeys as $key) {
    if (!array_key_exists($key, $config) || $config[$key] === '' || $config[$key] === null) {
        // MAIL_LOG_FILE (local testing) replaces the SMTP settings.
        if (str_starts_with($key, 'SMTP_') && !empty($config['MAIL_LOG_FILE'])) {
            continue;
        }
        fail(500, 'server_error', "Missing config value: $key");
    }
}

// ---------- Origin ----------
$allowedOrigins = $config['ALLOWED_ORIGINS'] ?? DEFAULT_ORIGINS;
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, $allowedOrigins, true)) {
    fail(403, 'forbidden', 'Rejected origin: ' . ($origin === '' ? '(none)' : $origin));
}

// ---------- Body ----------
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    fail(413, 'too_large');
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    fail(400, 'invalid_request');
}
$field = static fn (string $key): string => is_string($data[$key] ?? null) ? trim($data[$key]) : '';

$name = $field('name');
$email = $field('email');
$subject = $field('subject');
$message = $field('message');
$honeypot = $field('website');
$token = $field('token');
$ip = $_SERVER['REMOTE_ADDR'] ?? '';

// ---------- Honeypot: pretend success, send nothing ----------
if ($honeypot !== '') {
    error_log('[hrwhats-contact] Honeypot filled, ignored. IP: ' . $ip);
    respond(200, ['ok' => true]);
}

// ---------- Validation ----------
$invalid = [];
if ($name === '' || textLength($name) > MAX_NAME || preg_match('/[\r\n]/', $name)) {
    $invalid[] = 'name';
}
if ($email === '' || strlen($email) > MAX_EMAIL || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $invalid[] = 'email';
}
if ($subject === '' || textLength($subject) > MAX_SUBJECT || preg_match('/[\r\n]/', $subject)) {
    $invalid[] = 'subject';
}
if (textLength($message) > MAX_MESSAGE) {
    $invalid[] = 'message';
}
if ($token === '') {
    $invalid[] = 'token';
}
if ($invalid) {
    respond(400, ['ok' => false, 'error' => 'invalid_fields', 'fields' => $invalid]);
}

// ---------- Rate limit (file per IP, outside the web root) ----------
function isRateLimited(string $dir, string $ip): bool
{
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        error_log('[hrwhats-contact] Cannot create rate-limit dir: ' . $dir);
        return false; // fail open rather than block everyone
    }
    $handle = @fopen($dir . '/' . sha1($ip) . '.json', 'c+');
    if ($handle === false) {
        return false;
    }
    flock($handle, LOCK_EX);
    $now = time();
    $hits = json_decode(stream_get_contents($handle) ?: '[]', true);
    $hits = array_values(array_filter(is_array($hits) ? $hits : [], static fn ($t) => is_int($t) && $t > $now - RATE_WINDOW));
    $limited = count($hits) >= RATE_LIMIT;
    if (!$limited) {
        $hits[] = $now;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($hits));
    }
    flock($handle, LOCK_UN);
    fclose($handle);
    return $limited;
}

if (isRateLimited($home . '/hrwhats-contact-ratelimit', $ip)) {
    fail(429, 'rate_limited', 'Rate limit hit. IP: ' . $ip);
}

// ---------- Cloudflare Turnstile ----------
function verifyTurnstile(string $secret, string $token, string $ip): ?array
{
    $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    $payload = http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $ip]);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
    } else {
        $response = @file_get_contents($url, false, stream_context_create(['http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
            'timeout' => 10,
        ]]));
    }
    if (!is_string($response)) {
        return null;
    }
    $result = json_decode($response, true);
    return is_array($result) ? $result : null;
}

$verification = verifyTurnstile((string) $config['TURNSTILE_SECRET'], $token, $ip);
if ($verification === null) {
    fail(502, 'captcha_unavailable', 'Turnstile siteverify request failed');
}
if (($verification['success'] ?? false) !== true) {
    fail(403, 'captcha_failed', 'Turnstile rejected: ' . implode(',', $verification['error-codes'] ?? []));
}

// ---------- Email ----------
$sentAt = (new DateTimeImmutable('now', new DateTimeZone('Asia/Riyadh')))->format('Y-m-d H:i:s');
$mailSubject = 'رسالة جديدة من موقع HRwhats: ' . $subject;
$mailBody = implode("\n", [
    'الاسم: ' . $name,
    'البريد الإلكتروني: ' . $email,
    'الموضوع: ' . $subject,
    '',
    'الرسالة:',
    $message === '' ? '(بدون رسالة)' : $message,
    '',
    '---',
    'تاريخ الإرسال: ' . $sentAt . ' (توقيت الرياض)',
    'IP: ' . $ip,
]);

// Local testing only: write the email to a file instead of sending it.
if (!empty($config['MAIL_LOG_FILE'])) {
    $entry = "To: {$config['MAIL_TO']}\nReply-To: $name <$email>\nSubject: $mailSubject\n\n$mailBody\n\n=====\n";
    if (file_put_contents((string) $config['MAIL_LOG_FILE'], $entry, FILE_APPEND | LOCK_EX) === false) {
        fail(500, 'mail_failed', 'Cannot write MAIL_LOG_FILE');
    }
    respond(200, ['ok' => true]);
}

require __DIR__ . '/_lib/Exception.php';
require __DIR__ . '/_lib/PHPMailer.php';
require __DIR__ . '/_lib/SMTP.php';

$mail = new PHPMailer(true);
try {
    $port = (int) $config['SMTP_PORT'];
    $mail->isSMTP();
    $mail->Host = (string) $config['SMTP_HOST'];
    $mail->Port = $port;
    $mail->SMTPAuth = true;
    $mail->Username = (string) $config['SMTP_USER'];
    $mail->Password = (string) $config['SMTP_PASS'];
    $mail->SMTPSecure = $config['SMTP_SECURE'] ?? ($port === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS);
    $mail->Timeout = 15;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;

    $mail->setFrom((string) $config['SMTP_FROM'], 'HRwhats');
    $mail->addAddress((string) $config['MAIL_TO']);
    $mail->addReplyTo($email, $name);
    $mail->Subject = $mailSubject;
    $mail->isHTML(false);
    $mail->Body = $mailBody;
    $mail->send();
} catch (MailException $e) {
    fail(502, 'mail_failed', 'PHPMailer: ' . $mail->ErrorInfo);
}

respond(200, ['ok' => true]);
