/**
 * Integration tests for the Todo REST API.
 *
 * Each test group maps to one endpoint. We use mongodb-memory-server (wired up
 * in setup.ts) so no real database is required.
 */
import { describe, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = "/api/v1/todos";

/** Quickly create a todo via the API and return the parsed body. */
async function createTodo(
  title: string,
  description?: string
): Promise<{ _id: string; title: string; description?: string; done: boolean }> {
  const res = await request(app)
    .post(BASE)
    .send({ title, ...(description ? { description } : {}) });
  expect(res.status).toBe(201);
  return res.body as { _id: string; title: string; description?: string; done: boolean };
}

// ---------------------------------------------------------------------------
// GET /api/v1/todos
// ---------------------------------------------------------------------------

describe("GET /api/v1/todos", () => {
  it("returns an empty array when no todos exist", async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all todos sorted newest first", async () => {
    await createTodo("First todo");
    await createTodo("Second todo");

    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    // Newest first: "Second todo" should be index 0
    expect((res.body as Array<{ title: string }>)[0]!.title).toBe("Second todo");
    expect((res.body as Array<{ title: string }>)[1]!.title).toBe("First todo");
  });

  it("returns todos with expected fields", async () => {
    await createTodo("Field check", "Some description");
    const res = await request(app).get(BASE);
    const todo = (res.body as Array<Record<string, unknown>>)[0]!;
    expect(todo).toHaveProperty("_id");
    expect(todo).toHaveProperty("title", "Field check");
    expect(todo).toHaveProperty("description", "Some description");
    expect(todo).toHaveProperty("done", false);
    expect(todo).toHaveProperty("createdAt");
    expect(todo).toHaveProperty("updatedAt");
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/todos
// ---------------------------------------------------------------------------

describe("POST /api/v1/todos", () => {
  it("creates a todo with title only", async () => {
    const res = await request(app).post(BASE).send({ title: "Buy milk" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Buy milk");
    expect(res.body.done).toBe(false);
    expect(res.body._id).toBeDefined();
  });

  it("creates a todo with title and description", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ title: "Read book", description: "Chapter 3" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Read book");
    expect(res.body.description).toBe("Chapter 3");
  });

  it("strips extra whitespace from title", async () => {
    const res = await request(app).post(BASE).send({ title: "  Trimmed  " });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Trimmed");
  });

  // Validation failures
  it("returns 422 when title is missing", async () => {
    const res = await request(app).post(BASE).send({});
    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Validation failed");
    const errors = res.body.errors as Array<{ field: string; message: string }>;
    expect(errors.some((e) => e.field === "title")).toBe(true);
  });

  it("returns 422 when title is an empty string", async () => {
    const res = await request(app).post(BASE).send({ title: "" });
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 422 when title is blank whitespace", async () => {
    const res = await request(app).post(BASE).send({ title: "   " });
    expect(res.status).toBe(422);
  });

  it("returns 422 when title exceeds 255 characters", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ title: "a".repeat(256) });
    expect(res.status).toBe(422);
  });

  it("returns 422 when description exceeds 2000 characters", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ title: "Valid title", description: "x".repeat(2001) });
    expect(res.status).toBe(422);
    const errors = res.body.errors as Array<{ field: string }>;
    expect(errors.some((e) => e.field === "description")).toBe(true);
  });

  it("accepts description at exactly 2000 characters", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ title: "Long desc", description: "x".repeat(2000) });
    expect(res.status).toBe(201);
  });

  it("accepts title at exactly 255 characters", async () => {
    const res = await request(app)
      .post(BASE)
      .send({ title: "a".repeat(255) });
    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/v1/todos/:id
// ---------------------------------------------------------------------------

describe("PUT /api/v1/todos/:id", () => {
  it("updates the title of an existing todo", async () => {
    const { _id } = await createTodo("Old title");
    const res = await request(app).put(`${BASE}/${_id}`).send({ title: "New title" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New title");
  });

  it("updates the description of an existing todo", async () => {
    const { _id } = await createTodo("Todo");
    const res = await request(app).put(`${BASE}/${_id}`).send({ description: "Updated desc" });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe("Updated desc");
  });

  it("updates both title and description", async () => {
    const { _id } = await createTodo("Old");
    const res = await request(app)
      .put(`${BASE}/${_id}`)
      .send({ title: "New", description: "Desc" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New");
    expect(res.body.description).toBe("Desc");
  });

  it("returns 404 when todo does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).put(`${BASE}/${fakeId}`).send({ title: "X" });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });

  it("returns 422 when id is not a valid MongoId", async () => {
    const res = await request(app).put(`${BASE}/invalid-id`).send({ title: "X" });
    expect(res.status).toBe(422);
    const errors = res.body.errors as Array<{ field?: string; message: string }>;
    expect(errors.some((e) => e.message === "Invalid todo ID")).toBe(true);
  });

  it("returns 422 when title is an empty string", async () => {
    const { _id } = await createTodo("Valid");
    const res = await request(app).put(`${BASE}/${_id}`).send({ title: "" });
    expect(res.status).toBe(422);
  });

  it("returns 422 when title exceeds 255 characters", async () => {
    const { _id } = await createTodo("Valid");
    const res = await request(app)
      .put(`${BASE}/${_id}`)
      .send({ title: "a".repeat(256) });
    expect(res.status).toBe(422);
  });

  it("returns 422 when description exceeds 2000 characters", async () => {
    const { _id } = await createTodo("Valid");
    const res = await request(app)
      .put(`${BASE}/${_id}`)
      .send({ description: "d".repeat(2001) });
    expect(res.status).toBe(422);
  });

  it("strips extra whitespace from title on update", async () => {
    const { _id } = await createTodo("Original");
    const res = await request(app).put(`${BASE}/${_id}`).send({ title: "  Trimmed  " });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Trimmed");
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/todos/:id/done
// ---------------------------------------------------------------------------

describe("PATCH /api/v1/todos/:id/done", () => {
  it("toggles done from false to true", async () => {
    const { _id } = await createTodo("Toggle me");
    const res = await request(app).patch(`${BASE}/${_id}/done`);
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it("toggles done from true back to false", async () => {
    const { _id } = await createTodo("Toggle twice");
    await request(app).patch(`${BASE}/${_id}/done`); // → true
    const res = await request(app).patch(`${BASE}/${_id}/done`); // → false
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(false);
  });

  it("returns 404 when todo does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).patch(`${BASE}/${fakeId}/done`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });

  it("returns 422 when id is not a valid MongoId", async () => {
    const res = await request(app).patch(`${BASE}/not-an-id/done`);
    expect(res.status).toBe(422);
    const errors = res.body.errors as Array<{ message: string }>;
    expect(errors.some((e) => e.message === "Invalid todo ID")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/todos/:id
// ---------------------------------------------------------------------------

describe("DELETE /api/v1/todos/:id", () => {
  it("deletes an existing todo and returns 204", async () => {
    const { _id } = await createTodo("Delete me");
    const res = await request(app).delete(`${BASE}/${_id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
  });

  it("removes the todo from the list after deletion", async () => {
    const { _id } = await createTodo("Vanish");
    await request(app).delete(`${BASE}/${_id}`);
    const list = await request(app).get(BASE);
    const ids = (list.body as Array<{ _id: string }>).map((t) => t._id);
    expect(ids).not.toContain(_id);
  });

  it("returns 404 when todo does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`${BASE}/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });

  it("returns 422 when id is not a valid MongoId", async () => {
    const res = await request(app).delete(`${BASE}/bad-id`);
    expect(res.status).toBe(422);
    const errors = res.body.errors as Array<{ message: string }>;
    expect(errors.some((e) => e.message === "Invalid todo ID")).toBe(true);
  });
});
