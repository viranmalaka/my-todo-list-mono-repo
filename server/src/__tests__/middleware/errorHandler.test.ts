/**
 * Unit tests for the global error handler middleware.
 *
 * We mock `config` so we can control `isDev` without touching real env vars.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { AppError } from "../../errors/AppError";

// Mock config before importing the handler
vi.mock("../../config/env", () => ({
  config: { isDev: false },
}));

import { errorHandler } from "../../middleware/errorHandler";

/** Minimal mock of Express Response with status/json spies */
function makeRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return {
    res: { status, json } as unknown as Response,
    status,
    json,
    statusJson: { json },
  };
}

const req = {} as Request;
const next = vi.fn() as NextFunction;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("errorHandler – AppError", () => {
  it("responds with the AppError statusCode and body", () => {
    const { res, status } = makeRes();
    const jsonSpy =
      (status.mock.results[0] as { value: { json: ReturnType<typeof vi.fn> } })?.value?.json ??
      vi.fn();

    const err = AppError.notFound("Todo");
    errorHandler(err, req, res, next);

    expect(status).toHaveBeenCalledWith(404);
  });

  it("includes meta in the response body when present", () => {
    const jsonFn = vi.fn();
    const res = {
      status: vi.fn().mockReturnValue({ json: jsonFn }),
      json: vi.fn(),
    } as unknown as Response;

    const err = AppError.badRequest("bad", { field: "id" });
    errorHandler(err, req, res, next);

    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ meta: { field: "id" }, code: "BAD_REQUEST" })
    );
  });

  it("does not include stack in prod (isDev=false)", () => {
    const jsonFn = vi.fn();
    const res = {
      status: vi.fn().mockReturnValue({ json: jsonFn }),
      json: vi.fn(),
    } as unknown as Response;

    const err = AppError.badRequest("bad");
    errorHandler(err, req, res, next);

    const body = jsonFn.mock.calls[0]![0] as Record<string, unknown>;
    expect(body["stack"]).toBeUndefined();
  });
});

describe("errorHandler – Mongoose CastError", () => {
  it("returns 400 INVALID_ID", () => {
    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ json: jsonFn });
    const res = { status: statusFn, json: vi.fn() } as unknown as Response;

    const castError = new MongooseError.CastError("ObjectId", "bad-id", "_id");
    errorHandler(castError, req, res, next);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({ code: "INVALID_ID" }));
  });
});

describe("errorHandler – Mongoose ValidationError", () => {
  it("returns 422 VALIDATION_ERROR with field errors", () => {
    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ json: jsonFn });
    const res = { status: statusFn, json: vi.fn() } as unknown as Response;

    const validationError = new MongooseError.ValidationError();
    const requiredError = new MongooseError.ValidatorError({
      message: "Title is required",
      type: "required",
      path: "title",
      value: "",
    });
    validationError.errors = { title: requiredError };

    errorHandler(validationError, req, res, next);

    expect(statusFn).toHaveBeenCalledWith(422);
    const body = jsonFn.mock.calls[0]![0] as {
      code: string;
      errors: Array<{ field: string; message: string }>;
    };
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "title", message: "Title is required" }),
      ])
    );
  });
});

describe("errorHandler – MongoDB duplicate key (E11000)", () => {
  it("returns 409 DUPLICATE_KEY with field meta when keyValue present", () => {
    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ json: jsonFn });
    const res = { status: statusFn, json: vi.fn() } as unknown as Response;

    const dupError = { code: 11000, keyValue: { email: "a@b.com" } };
    errorHandler(dupError, req, res, next);

    expect(statusFn).toHaveBeenCalledWith(409);
    const body = jsonFn.mock.calls[0]![0] as { code: string; message: string };
    expect(body.code).toBe("DUPLICATE_KEY");
    expect(body.message).toBe("email already exists");
  });

  it("returns 409 DUPLICATE_KEY with generic message when keyValue absent", () => {
    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ json: jsonFn });
    const res = { status: statusFn, json: vi.fn() } as unknown as Response;

    const dupError = { code: 11000 };
    errorHandler(dupError, req, res, next);

    expect(statusFn).toHaveBeenCalledWith(409);
    const body = jsonFn.mock.calls[0]![0] as { code: string; message: string };
    expect(body.code).toBe("DUPLICATE_KEY");
    expect(body.message).toBe("Duplicate value");
  });
});

describe("errorHandler – unhandled errors", () => {
  it("returns 500 INTERNAL_ERROR for unknown errors", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ json: jsonFn });
    const res = { status: statusFn, json: vi.fn() } as unknown as Response;

    errorHandler(new Error("unknown"), req, res, next);

    expect(statusFn).toHaveBeenCalledWith(500);
    const body = jsonFn.mock.calls[0]![0] as { code: string };
    expect(body.code).toBe("INTERNAL_ERROR");
    consoleError.mockRestore();
  });

  it("returns 500 for non-Error primitives", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const jsonFn = vi.fn();
    const statusFn = vi.fn().mockReturnValue({ json: jsonFn });
    const res = { status: statusFn, json: vi.fn() } as unknown as Response;

    errorHandler("just a string error", req, res, next);

    expect(statusFn).toHaveBeenCalledWith(500);
    consoleError.mockRestore();
  });
});
