/**
 * Unit tests for the validate middleware.
 */
import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { vi as vitestVi } from "vitest";
import { validate } from "../../middleware/validate";

vi.mock("express-validator", async (importOriginal) => {
  const actual = await importOriginal<typeof import("express-validator")>();
  return { ...actual, validationResult: vi.fn() };
});

const mockValidationResult = vitestVi.mocked(validationResult);

function makeRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  // Attach json directly to status return value for chaining
  (res as unknown as Record<string, unknown>)["statusRef"] = { json };
  return { res, status, json };
}

describe("validate middleware", () => {
  it("calls next() when there are no validation errors", () => {
    mockValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as unknown as ReturnType<typeof validationResult>);

    const req = {} as Request;
    const { res } = makeRes();
    const next = vi.fn() as NextFunction;

    validate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 422 with error details when validation fails", () => {
    const fakeErrors = [{ type: "field", path: "title", msg: "Title is required" }];
    mockValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => fakeErrors,
    } as unknown as ReturnType<typeof validationResult>);

    const req = {} as Request;
    const jsonSpy = vi.fn();
    const statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });
    const res = { status: statusSpy } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validate(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(422);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation failed",
        errors: [{ field: "title", message: "Title is required" }],
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("maps non-field errors to field=undefined", () => {
    const fakeErrors = [{ type: "unknown", msg: "Something wrong" }];
    mockValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => fakeErrors,
    } as unknown as ReturnType<typeof validationResult>);

    const req = {} as Request;
    const jsonSpy = vi.fn();
    const statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });
    const res = { status: statusSpy } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validate(req, res, next);

    const body = jsonSpy.mock.calls[0]![0] as { errors: Array<{ field?: string }> };
    expect(body.errors[0]!.field).toBeUndefined();
  });
});
