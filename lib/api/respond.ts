import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { RepoError } from "@/lib/repos/errors";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "HttpError";
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(
  status: number,
  code: string,
  message?: string,
): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code, message: message ?? code } },
    { status },
  );
}

export function route(handler: () => Promise<Response>): Promise<Response> {
  return handler().catch((error: unknown) => {
    if (error instanceof HttpError) {
      return fail(error.status, error.code, error.message);
    }
    if (error instanceof RepoError) {
      const status =
        error.code === "not_found"
          ? 404
          : error.code === "conflict"
            ? 409
            : error.code === "invalid"
              ? 400
              : 503;
      // The adapter's message is written for humans and carries no SQL.
      return fail(status, error.code, error.message);
    }
    if (error instanceof ZodError) {
      return fail(400, "invalid_input", "Some details need another look.");
    }
    console.error("[api] unhandled error:", error);
    return fail(500, "internal", "Something went wrong on our side.");
  });
}

export async function readJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "invalid_json", "Could not read that request.");
  }
  return schema.parse(body);
}
