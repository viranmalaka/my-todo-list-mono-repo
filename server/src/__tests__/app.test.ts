/**
 * Health check endpoint tests.
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("GET /health", () => {
  it("returns 200 with { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns JSON content-type", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});

describe("Unknown routes", () => {
  it("returns 404 for unregistered routes", async () => {
    const res = await request(app).get("/api/v1/nonexistent");
    expect(res.status).toBe(404);
  });
});
