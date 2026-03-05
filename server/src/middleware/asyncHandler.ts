import { Request, Response, NextFunction } from "express";

/**
 * Wraps async route handlers and forwards any thrown errors to
 * the global error handler, eliminating try/catch boilerplate
 * in every controller.
 */
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
