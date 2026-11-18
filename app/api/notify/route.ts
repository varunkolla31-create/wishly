import { fail, ok, readJson, route } from "@/lib/api/respond";
import { notifyRepo } from "@/lib/repos/notify";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { clientIp, hashIp } from "@/lib/security/unlock-guard";
import { z } from "zod";

export const runtime = "nodejs";

const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  // The UI must send this only when the box is checked; consent is explicit.
  consent: z.literal(true),
  source: z.string().trim().max(40).default("pricing"),
});

export function POST(request: Request) {
  return route(async () => {
    const gate = consumeRateLimit(
      `notify:${hashIp(clientIp(request))}`,
      LIMIT,
      WINDOW_MS,
    );
    if (!gate.allowed) {
      const response = fail(
        429,
        "rate_limited",
        "That's a few too many. Try again in a few minutes.",
      );
      response.headers.set(
        "Retry-After",
        String(Math.max(1, Math.ceil(gate.retryAfterMs / 1000))),
      );
      return response;
    }

    const input = await readJson(request, schema);
    const result = await notifyRepo().add(input.email, input.source);

    // Identical response whether or not the address was already present, so the
    // endpoint cannot be used to check who has signed up.
    return ok({ subscribed: true, alreadySubscribed: !result.created });
  });
}
