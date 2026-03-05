import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Runs express-validator checks and short-circuits with a 422
 * if any validation rules failed. Keeps controllers clean.
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.type === "field" ? e.path : undefined,
        message: e.msg,
      })),
    });
    return;
  }
  next();
};
