/**
 * Domain errors for the repository layer. Adapters raise these; route handlers
 * translate them. Messages are written for humans and never contain SQL,
 * connection strings or driver internals.
 */

export type RepoErrorCode = "not_found" | "conflict" | "invalid" | "unavailable";

export class RepoError extends Error {
  constructor(
    readonly code: RepoErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "RepoError";
  }
}

const MESSAGES: Record<RepoErrorCode, string> = {
  not_found: "That record could not be found.",
  conflict: "That record already exists.",
  invalid: "Some of those values are not allowed.",
  unavailable: "The database is unavailable right now.",
};

/** Translates a driver error and always throws — never returns. */
export function mapPostgresError(error: unknown): never {
  if (error instanceof RepoError) throw error;

  const code = (error as { code?: unknown }).code;
  if (code === "23505") throw new RepoError("conflict", MESSAGES.conflict);
  if (code === "23503") throw new RepoError("not_found", MESSAGES.not_found);
  if (code === "23514") throw new RepoError("invalid", MESSAGES.invalid);

  // 08xxx = connection exception, 57Pxx = admin shutdown, ECONN* = socket.
  if (
    (typeof code === "string" && (code.startsWith("08") || code.startsWith("57P"))) ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT"
  ) {
    throw new RepoError("unavailable", MESSAGES.unavailable);
  }

  // Deliberately swallows the original message: it can contain SQL fragments.
  console.error("[db] unmapped database error:", code ?? "unknown");
  throw new RepoError("unavailable", MESSAGES.unavailable);
}
