/**
 * Operational error codes — machine-readable slugs sent in every error response.
 * Add new codes here as the API grows.
 */
export type ErrorCode =
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNPROCESSABLE"
  | "DUPLICATE_KEY"
  | "INVALID_ID"
  | "INTERNAL_ERROR";

/**
 * AppError — the single error class thrown throughout the server.
 *
 * Controllers throw it; asyncHandler forwards it; errorHandler serialises it.
 *
 * @example
 *   throw AppError.notFound("Todo");
 *   throw AppError.badRequest("ID is required", { field: "id" });
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly meta?: Record<string, unknown>;
  /** true = expected/operational; false = programmer error / should never happen */
  readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    meta?: Record<string, unknown>,
    isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.meta = meta;
    this.isOperational = isOperational;

    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Static factories ──────────────────────────────────────────────────────

  static notFound(resource = "Resource"): AppError {
    return new AppError(`${resource} not found`, 404, "NOT_FOUND");
  }

  static badRequest(message = "Bad request", meta?: Record<string, unknown>): AppError {
    return new AppError(message, 400, "BAD_REQUEST", meta);
  }

  static unprocessable(message = "Validation failed", meta?: Record<string, unknown>): AppError {
    return new AppError(message, 422, "UNPROCESSABLE", meta);
  }

  static duplicateKey(field?: string): AppError {
    const message = field ? `${field} already exists` : "Duplicate value";
    return new AppError(message, 409, "DUPLICATE_KEY", field ? { field } : undefined);
  }

  static invalidId(): AppError {
    return new AppError("Invalid ID format", 400, "INVALID_ID");
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError(message, 500, "INTERNAL_ERROR", undefined, false);
  }
}
