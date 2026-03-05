/**
 * Unit tests for the asyncHandler middleware.
 */
import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";

const mockReq = {} as Request;
const mockRes = {} as Response;

describe("asyncHandler", () => {
  it("calls the wrapped handler with req, res, next", async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(fn);

    const next = vi.fn() as NextFunction;
    handler(mockReq, mockRes, next);

    await vi.waitFor(() => expect(fn).toHaveBeenCalledWith(mockReq, mockRes, next));
  });

  it("does NOT call next when the handler resolves successfully", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const next = vi.fn() as NextFunction;
    asyncHandler(fn)(mockReq, mockRes, next);

    // Give the microtask queue time to flush
    await new Promise((r) => setTimeout(r, 0));
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards rejections to next(err)", async () => {
    const error = new Error("async error");
    const fn = vi.fn().mockRejectedValue(error);
    const next = vi.fn() as NextFunction;

    asyncHandler(fn)(mockReq, mockRes, next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });

  it("forwards thrown errors in async context to next(err)", async () => {
    const error = new Error("throw inside async");
    const fn = vi.fn().mockImplementation(async () => {
      throw error;
    });
    const next = vi.fn() as NextFunction;

    asyncHandler(fn)(mockReq, mockRes, next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(error));
  });
});
