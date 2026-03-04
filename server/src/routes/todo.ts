import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate";
import {
  listTodos,
  createTodo,
  updateTodo,
  toggleDone,
  deleteTodo,
} from "../controllers/todo.controller";

const router = Router();

// GET /api/todos
router.get("/", listTodos);

// POST /api/todos
router.post(
  "/",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 255 })
      .withMessage("Title must be 255 characters or fewer"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Description must be 2000 characters or fewer"),
  ],
  validate,
  createTodo
);

// PUT /api/todos/:id
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid todo ID"),
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty")
      .isLength({ max: 255 })
      .withMessage("Title must be 255 characters or fewer"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Description must be 2000 characters or fewer"),
  ],
  validate,
  updateTodo
);

// PATCH /api/todos/:id/done
router.patch(
  "/:id/done",
  [param("id").isMongoId().withMessage("Invalid todo ID")],
  validate,
  toggleDone
);

// DELETE /api/todos/:id
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid todo ID")],
  validate,
  deleteTodo
);

export default router;
