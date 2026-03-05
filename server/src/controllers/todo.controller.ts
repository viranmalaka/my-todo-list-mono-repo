import { Request, Response } from "express";
import { Todo } from "../models/Todo";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppError } from "../errors/AppError";

/**
 * GET /api/todos
 * Returns all todos sorted newest first.
 */
export const listTodos = asyncHandler(async (_req: Request, res: Response) => {
  const todos = await Todo.find().sort({ createdAt: -1 }).lean();
  res.json(todos);
});

/**
 * POST /api/todos
 * Creates a new todo. Body: { title, description? }
 */
export const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body as {
    title: string;
    description?: string;
  };
  const todo = await Todo.create({ title, description });
  res.status(201).json(todo);
});

/**
 * PUT /api/todos/:id
 * Updates title and/or description.
 */
export const updateTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body as {
    title?: string;
    description?: string;
  };
  const todo = await Todo.findByIdAndUpdate(
    req.params["id"],
    {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    },
    { new: true, runValidators: true }
  );
  if (!todo) throw AppError.notFound("Todo");
  res.json(todo);
});

/**
 * PATCH /api/todos/:id/done
 * Toggles the done status.
 */
export const toggleDone = asyncHandler(async (req: Request, res: Response) => {
  const todo = await Todo.findById(req.params["id"]);
  if (!todo) throw AppError.notFound("Todo");
  todo.done = !todo.done;
  await todo.save();
  res.json(todo);
});

/**
 * DELETE /api/todos/:id
 * Deletes a todo. Returns 204 No Content on success.
 */
export const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
  const todo = await Todo.findByIdAndDelete(req.params["id"]);
  if (!todo) throw AppError.notFound("Todo");
  res.status(204).send();
});
