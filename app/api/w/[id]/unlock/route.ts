import { fail, HttpError, ok, readJson, route } from "@/lib/api/respond";
import { wishRepo } from "@/lib/repos/index";
import { verifyPassword } from "@/lib/security/password";
import {
  checkRateLimit,
  clearRateLimit,
  recordFailure,
} from "@/lib/security/rate-limit";
import {
  signUnlockToken,
  UNLOCK_TTL_SECONDS,
  unlockCookieName,
} from "@/lib/security/unlock-token";
import { unlockSchema } from "@/lib/validation/unlock";
import { isPublished, isUnlockTimeReached } from "@/lib/wishes/public";

export const runtime = "nodejs";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

function tooManyTries(retryAfterMs: number) {
  const response = fail(
    429,
    "rate_limited",
    "Too many tries. Wait a moment, then try again.",
  );
  response.headers.set(
    "Retry-After",
    String(Math.max(1, Math.ceil(retryAfterMs / 1000))),
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return route(async () => {
    const { id } = await context.params;
    const input = await readJson(request, unlockSchema);
    const rateKey = `${clientIp(request)}:${id}`;

    const gate = checkRateLimit(rateKey);
    if (!gate.allowed) return tooManyTries(gate.retryAfterMs);

    const wish = await wishRepo().getById(id);

    if (!wish || !isPublished(wish)) {
      await verifyPassword(null, input.password);
      throw new HttpError(404, "not_found", "This wish isn't available.");
    }

    if (!isUnlockTimeReached(wish)) {
      throw new HttpError(403, "not_yet", "This wish opens later.");
    }

    const valid = await verifyPassword(wish.passwordHash, input.password);

    if (!valid) {
      recordFailure(rateKey);
      throw new HttpError(
        401,
        "invalid_password",
        "That password didn't match.",
      );
    }

    clearRateLimit(rateKey);

    const token = await signUnlockToken({
      wishId: wish.wishId,
      passwordVersion: wish.passwordVersion,
    });

    const response = ok({ unlocked: true });
    response.cookies.set({
      name: unlockCookieName(wish.wishId),
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: UNLOCK_TTL_SECONDS,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}
