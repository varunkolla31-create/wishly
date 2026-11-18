import "server-only";
import { siteUrl } from "@/lib/config-public";
import { mailConfigured, sendEmail } from "@/lib/email";
import type { Wish } from "@/lib/repos/types";

/**
 * Sender notifications.
 *
 * Deliberately minimal and consistent with what the privacy page says: the only
 * thing recorded about the receiver is a single boolean open event, and the
 * only outbound message is a one-off note to the sender. There is no open
 * tracking, no read receipt, no per-visit history.
 */

/**
 * Told once, the first time a wish is opened. Requires the sender's address on
 * the wish; anonymous creators never provide one, so this is a no-op for them.
 */
export async function notifyWishOpened(wish: Wish): Promise<void> {
  const to = wish.ownerEmail?.trim();
  if (!to) return;
  if (!mailConfigured()) return;

  await sendEmail({
    to,
    subject: "Your wish was opened",
    text:
      `Someone just opened the wish you made for ${
        wish.receiverName || "them"
      }.\n\n` +
      `You can see it here: ${siteUrl()}/dashboard\n\n` +
      "That is the only thing we track about opening a wish — a single yes/no, " +
      "not who opened it or how often.",
  });
}

/** True when the sender can be told at all. */
export function canNotifySender(): boolean {
  return mailConfigured();
}
