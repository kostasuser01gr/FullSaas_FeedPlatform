/**
 * Structured application errors.
 * Route handlers catch these and return proper JSON + status codes.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, "BAD_REQUEST", details);
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(401, message, "UNAUTHORIZED");
  }
  static forbidden(message = "Forbidden") {
    return new AppError(403, message, "FORBIDDEN");
  }
  static notFound(resource = "Resource") {
    return new AppError(404, `${resource} not found`, "NOT_FOUND");
  }
  static conflict(message: string) {
    return new AppError(409, message, "CONFLICT");
  }
  static internal(message = "Internal server error") {
    return new AppError(500, message, "INTERNAL_ERROR");
  }
}

/**
 * Convert an AppError (or unknown error) into a NextResponse-ready object.
 */
export function errorToResponse(err: unknown): {
  status: number;
  body: { success: false; error: { code: string; message: string; details?: unknown } };
} {
  if (err instanceof AppError) {
    return {
      status: err.statusCode,
      body: {
        success: false,
        error: {
          code: err.code ?? "ERROR",
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
    };
  }

  console.error("Unhandled error:", err);
  return {
    status: 500,
    body: {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    },
  };
}
