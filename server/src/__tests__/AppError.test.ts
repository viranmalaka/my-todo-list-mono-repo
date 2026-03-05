/**
 * Unit tests for AppError – covers all static factories and constructor behaviour.
 */
import { describe, it, expect } from "vitest";
import { AppError } from "../errors/AppError";

describe("AppError constructor", () => {
  it("sets all properties correctly", () => {
    const err = new AppError("Something went wrong", 400, "BAD_REQUEST", { field: "id" });
    expect(err.message).toBe("Something went wrong");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.meta).toEqual({ field: "id" });
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe("AppError");
  });

  it("defaults isOperational to true", () => {
    const err = new AppError("oops", 500, "INTERNAL_ERROR");
    expect(err.isOperational).toBe(true);
  });

  it("accepts explicit isOperational = false", () => {
    const err = new AppError("crash", 500, "INTERNAL_ERROR", undefined, false);
    expect(err.isOperational).toBe(false);
  });

  it("is an instance of Error", () => {
    const err = new AppError("test", 400, "BAD_REQUEST");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("has a stack trace", () => {
    const err = new AppError("test", 400, "BAD_REQUEST");
    expect(err.stack).toBeDefined();
  });
});

describe("AppError.notFound", () => {
  it("returns 404 NOT_FOUND with default resource name", () => {
    const err = AppError.notFound();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Resource not found");
  });

  it("includes the custom resource name in the message", () => {
    const err = AppError.notFound("Todo");
    expect(err.message).toBe("Todo not found");
  });
});

describe("AppError.badRequest", () => {
  it("returns 400 BAD_REQUEST", () => {
    const err = AppError.badRequest();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Bad request");
  });

  it("forwards custom message and meta", () => {
    const err = AppError.badRequest("ID required", { field: "id" });
    expect(err.message).toBe("ID required");
    expect(err.meta).toEqual({ field: "id" });
  });
});

describe("AppError.unprocessable", () => {
  it("returns 422 UNPROCESSABLE", () => {
    const err = AppError.unprocessable();
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("UNPROCESSABLE");
  });

  it("accepts custom message and meta", () => {
    const err = AppError.unprocessable("Data issue", { hint: "check field" });
    expect(err.message).toBe("Data issue");
    expect(err.meta).toEqual({ hint: "check field" });
  });
});

describe("AppError.duplicateKey", () => {
  it("returns 409 DUPLICATE_KEY without field", () => {
    const err = AppError.duplicateKey();
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("DUPLICATE_KEY");
    expect(err.message).toBe("Duplicate value");
    expect(err.meta).toBeUndefined();
  });

  it("includes the field in message and meta when provided", () => {
    const err = AppError.duplicateKey("email");
    expect(err.message).toBe("email already exists");
    expect(err.meta).toEqual({ field: "email" });
  });
});

describe("AppError.invalidId", () => {
  it("returns 400 INVALID_ID", () => {
    const err = AppError.invalidId();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("INVALID_ID");
    expect(err.message).toBe("Invalid ID format");
  });
});

describe("AppError.internal", () => {
  it("returns 500 INTERNAL_ERROR with isOperational false", () => {
    const err = AppError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.isOperational).toBe(false);
  });

  it("accepts a custom message", () => {
    const err = AppError.internal("DB exploded");
    expect(err.message).toBe("DB exploded");
  });
});
