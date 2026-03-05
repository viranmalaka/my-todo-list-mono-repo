import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { AppError } from "../errors/AppError";
import { config } from "../config/env";

/**
 * Consistent error response shape sent to clients.
 */
interface ErrorResponse {
  code: string;
  message: string;
  errors?: { field?: string; message: string }[];
  meta?: Record<string, unknown>;
  stack?: string;
}

/**
 * Global error handler — must be registered last in app.ts.
 *
 * Handles:
 *  - AppError (operational, thrown from controllers)
 *  - Mongoose CastError     → 400 INVALID_ID
 *  - Mongoose ValidationError → 422 VALIDATION_ERROR
 *  - Mongoose duplicate key  → 409 DUPLICATE_KEY
 *  - Anything else           → 500 INTERNAL_ERROR
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // ── 1. Our own operational errors ─────────────────────────────────────────
  if (err instanceof AppError) {
    const body: ErrorResponse = {
      code: err.code,
      message: err.message,
      ...(err.meta && { meta: err.meta }),
      ...(config.isDev && { stack: err.stack }),
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // ── 2. Mongoose – invalid ObjectId ────────────────────────────────────────
  if (err instanceof MongooseError.CastError) {
    res
      .status(400)
      .json({ code: "INVALID_ID", message: "Invalid ID format" } satisfies ErrorResponse);
    return;
  }

  // ── 3. Mongoose – schema validation ───────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(422).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors,
    } satisfies ErrorResponse);
    return;
  }

  // ── 4. MongoDB – duplicate key (E11000) ───────────────────────────────────
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : undefined;
    res.status(409).json({
      code: "DUPLICATE_KEY",
      message: field ? `${field} already exists` : "Duplicate value",
      ...(field && { meta: { field } }),
    } satisfies ErrorResponse);
    return;
  }

  // ── 5. Unhandled / programmer errors ──────────────────────────────────────
  console.error("[Unhandled Error]", err);
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    ...(config.isDev && {
      stack: err instanceof Error ? err.stack : String(err),
    }),
  } satisfies ErrorResponse);
};
