/**
 * Serialize unknown errors for client/server logs.
 * Plain `{ error }` often prints as `{}` because Error.message/stack are non-enumerable,
 * and Next.js server-action failures may only expose a digest on the client.
 */
export type SerializedError = {
  name: string;
  message: string;
  stack?: string;
  digest?: string;
  cause?: string;
  supabase?: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };
  rawType: string;
};

export function serializeError(error: unknown): SerializedError {
  if (error == null) {
    return {
      name: "UnknownError",
      message: "null or undefined error",
      rawType: String(error),
    };
  }

  if (typeof error === "string") {
    return {
      name: "StringError",
      message: error,
      rawType: "string",
    };
  }

  if (error instanceof Error) {
    const withDigest = error as Error & { digest?: string };
    const cause =
      error.cause instanceof Error
        ? error.cause.message
        : error.cause != null
          ? String(error.cause)
          : undefined;

    return {
      name: error.name || "Error",
      message: error.message || "(empty Error.message)",
      stack: error.stack,
      digest:
        typeof withDigest.digest === "string" ? withDigest.digest : undefined,
      cause,
      rawType: "Error",
    };
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message =
      typeof record.message === "string"
        ? record.message
        : typeof record.error === "string"
          ? record.error
          : "(no message on error object)";

    const supabase =
      typeof record.code === "string" ||
      typeof record.details === "string" ||
      typeof record.hint === "string"
        ? {
            message: typeof record.message === "string" ? record.message : undefined,
            code: typeof record.code === "string" ? record.code : undefined,
            details:
              typeof record.details === "string" ? record.details : undefined,
            hint: typeof record.hint === "string" ? record.hint : undefined,
          }
        : undefined;

    return {
      name: typeof record.name === "string" ? record.name : "ObjectError",
      message,
      stack: typeof record.stack === "string" ? record.stack : undefined,
      digest: typeof record.digest === "string" ? record.digest : undefined,
      supabase,
      rawType: "object",
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
    rawType: typeof error,
  };
}

export function logError(
  label: string,
  error: unknown,
  context?: Record<string, unknown>,
): SerializedError {
  const serialized = serializeError(error);
  console.error(label, {
    ...context,
    error: serialized,
  });
  return serialized;
}
