import { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;

  // Mongoose CastError — invalid ObjectId
  if (err.name === "CastError") {
    res.status(400).json({ message: "Invalid ID format" });
    return;
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    res.status(422).json({ message: err.message });
    return;
  }

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(config.isDev && { stack: err.stack }),
  });
};
