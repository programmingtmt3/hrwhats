/**
 * The only place that knows how the contact form is delivered. Today: a PHP
 * endpoint on the same host (public/api/contact.php). Swap the target here.
 */

/** Keep in sync with the MAX_* constants in public/api/contact.php. */
export const CONTACT_LIMITS = { name: 100, email: 254, subject: 200, message: 5000 } as const;

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot: must stay empty. */
  website: string;
  /** Cloudflare Turnstile response token. */
  token: string;
};

export async function submitContact(endpoint: string, payload: ContactPayload): Promise<boolean> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });
    const result: unknown = await response.json().catch(() => null);
    return response.ok && typeof result === "object" && result !== null && (result as { ok?: unknown }).ok === true;
  } catch {
    return false;
  }
}
