/**
 * Single seam for error reporting. Today it writes a redacted line to the
 * console; wiring Sentry or another provider means changing this file only.
 *
 * Intentionally isomorphic (no "server-only") because React error boundaries
 * are client components. Redaction rule: never forward raw payloads that could
 * contain request bodies (passwords, unlock tokens) or signed URLs.
 */

const SECRET_LIKE =
  /((?:password|token|secret|authorization|set-cookie|wishly_unlock_|sig|token)\s*[=:]\s*)[^\s"',&]+/gi;

function redact(value: string): string {
  return value.replace(SECRET_LIKE, "$1[redacted]");
}

export interface ErrorContext {
  where: string;
  digest?: string;
  route?: string;
}

export function reportError(error: unknown, context: ErrorContext): void {
  const name = error instanceof Error ? error.name : "UnknownError";
  const message =
    error instanceof Error ? redact(error.message).slice(0, 300) : "Unknown";

  const line = {
    level: "error",
    at: context.where,
    route: context.route,
    digest: context.digest,
    name,
    message,
    atTime: new Date().toISOString(),
  };

  console.error("[monitoring]", JSON.stringify(line));
}
