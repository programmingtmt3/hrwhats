<?php
/**
 * Example settings for public_html/api/contact.php.
 *
 * DO NOT put real values in this file or anywhere in the repository.
 * On the server: copy it to the account home directory — next to public_html,
 * NOT inside it — as `hrwhats-config.php`, then fill it in.
 * See docs/contact-form-setup.md.
 */
return [
    // Cloudflare Turnstile → your widget → "Secret Key".
    'TURNSTILE_SECRET' => '',

    // cPanel → Email Accounts → info@hrwhats.com → Connect Devices.
    'SMTP_HOST' => 'mail.hrwhats.com',
    'SMTP_PORT' => 465,                 // 465 = SSL/TLS, 587 = STARTTLS
    'SMTP_USER' => 'info@hrwhats.com',
    'SMTP_PASS' => '',
    'SMTP_FROM' => 'info@hrwhats.com',  // must be the authenticated mailbox
    'MAIL_TO'   => 'info@hrwhats.com',

    // Optional: allowed request origins (defaults to https://hrwhats.com).
    // 'ALLOWED_ORIGINS' => ['https://hrwhats.com'],

    // Local testing only: write emails to this file instead of sending them
    // (the SMTP_* values can then stay empty). Never set this on the server.
    // 'MAIL_LOG_FILE' => __DIR__ . '/hrwhats-mail-test.log',
];
