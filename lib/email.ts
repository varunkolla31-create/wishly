import "server-only";
import { env } from "@/lib/env";

/**
 * Outbound mail.
 *
 * No provider is a hard dependency of this app, so this is intentionally a thin
 * adapter: when RESEND_API_KEY and EMAIL_FROM are set it posts to Resend, and
 * otherwise it logs that mail was skipped. Nothing is faked — a caller can ask
 * `mailConfigured()` first and adapt its copy.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export function mailConfigured(): boolean {
  const config = env();
  return Boolean(config.RESEND_API_KEY && config.EMAIL_FROM);
}

export type EmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "failed" };

export async function sendEmail(
  message: EmailMessage,
): Promise<EmailResult> {
  const config = env();
  if (!config.RESEND_API_KEY || !config.EMAIL_FROM) {
    // Never log the address or the body; this is a configuration gap, not data.
    console.info("[email] skipped: no mail provider configured");
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.EMAIL_FROM,
        to: message.to,
        subject: message.subject,
        text: message.text,
      }),
    });

    if (!response.ok) {
      console.error(`[email] provider responded ${response.status}`);
      return { sent: false, reason: "failed" };
    }

    return { sent: true };
  } catch {
    console.error("[email] request failed");
    return { sent: false, reason: "failed" };
  }
}
