import { fail, HttpError, ok, readJson, route } from "@/lib/api/respond";
import { wishRepo } from "@/lib/repos/index";
import { verifyPassword } from "@/lib/security/password";
import {
  attemptKeys,
  clearUnlockFailures,
  clientIp,
  gateUnlock,
  recordUnlockFailure,
} from "@/lib/security/unlock-guard";
import {
  signUnlockToken,
  UNLOCK_TTL_SECONDS,
  unlockCookieName,
} from "@/lib/security/unlock-token";
import { unlockSchema } from "@/lib/validation/unlock";
import { isExpired } from "@/lib/wishes/anonymous";
import { isPublished, isUnlockTimeReached } from "@/lib/wishes/public";

export const runtime = "nodejs";

/**
 * One message for every refusal. The old route distinguished "not found",
 * "wrong password" and "wrong answer", which told a stranger whether a wish id
 * exists at all. A wrong password, an unknown id and a draft now look identical.
 */
const GENERIC_REFUSAL = "That password didn't match. Try again.";

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
    const ip = clientIp(request);

    const gate = await gateUnlock(id, ip);
    if (!gate.allowed) return tooManyTries(gate.retryAfterMs);

    const wish = await wishRepo().getById(id);
    const available =
      wish !== null && isPublished(wish) && !isExpired(wish);

    if (!available) {
      // Spend comparable work and record a failure so an unknown id cannot be
      // probed more cheaply than a real guess.
      await verifyPassword(null, input.password ?? "");
      await recordUnlockFailure(id, ip);
      throw new HttpError(401, "invalid_credentials", GENERIC_REFUSAL);
    }

    if (!isUnlockTimeReached(wish)) {
      throw new HttpError(403, "not_yet", "This wish opens later.");
    }

    const mode = wish.gateMode ?? "password";
    const passwordOk =
      mode === "password" || mode === "both"
        ? await verifyPassword(wish.passwordHash, input.password ?? "")
        : true;
    const answerOk =
      mode === "quiz" || mode === "both"
        ? wish.quizAnswerIndex !== null &&
          input.answerIndex === wish.quizAnswerIndex
        : true;

    if (!passwordOk || !answerOk) {
      // Record the failure but still answer as a wrong password: the cooldown
      // applies to the *next* attempt, which is what "five tries, then a
      // short cooldown" promises on the lock screen.
      await recordUnlockFailure(id, ip);
      throw new HttpError(401, "invalid_credentials", GENERIC_REFUSAL);
    }

    await clearUnlockFailures(gate.keys.length > 0 ? gate.keys : attemptKeys(id, ip));

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
