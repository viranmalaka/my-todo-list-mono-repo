import { Request, Response } from "express";
import { Todo } from "../models/Todo";
import { asyncHandler } from "../middleware/asyncHandler";

export const listTodos = asyncHandler(async (_req: Request, res: Response) => {
  const todos = await Todo.find().sort({ createdAt: -1 }).lean();
  res.json(todos);
});

export const createTodo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body as {
    title: string;
    description?: string;
  };
  const todo = await Todo.create({ title, description });
  res.status(201).json(todo);
});

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
  if (!todo) {
    res.status(404).json({ message: "Todo not found" });
    return;
  }
  res.json(todo);
});

export const toggleDone = asyncHandler(async (req: Request, res: Response) => {
  const todo = await Todo.findById(req.params["id"]);
  if (!todo) {
    res.status(404).json({ message: "Todo not found" });
    return;
  }
  todo.done = !todo.done;
  await todo.save();
  res.json(todo);
});

export const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
  const todo = await Todo.findByIdAndDelete(req.params["id"]);
  if (!todo) {
    res.status(404).json({ message: "Todo not found" });
    return;
  }
  res.status(204).send();
});
