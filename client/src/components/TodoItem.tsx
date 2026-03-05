import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToggleDone, useDeleteTodo } from "@/hooks/todo-queries";
import { EditTodoDialog } from "./EditTodoDialog";
import type { Todo } from "@/types/todo";

interface Props {
  todo: Todo;
}

export const TodoItem = ({ todo }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const { mutate: toggleDone } = useToggleDone();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

  const formattedDate = new Date(todo.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div
        className={`group flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-200 
          ${todo.done ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5 hover:bg-black/5"}`}
      >
        {/* Checkbox — optimistic toggle */}
        <Checkbox
          id={`todo-${todo._id}`}
          checked={todo.done}
          onCheckedChange={() => toggleDone(todo._id)}
          className="mt-0.5 shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <label
            htmlFor={`todo-${todo._id}`}
            className={`block text-sm font-medium cursor-pointer leading-snug
              ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}
          >
            {todo.title}
          </label>
          {todo.description && (
            <p
              className={`mt-1 text-xs leading-relaxed
                ${todo.done ? "text-muted-foreground/60" : "text-muted-foreground"}`}
            >
              {todo.description}
            </p>
          )}
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {formattedDate}
            </Badge>
            {todo.done && (
              <Badge
                variant="outline"
                className="ml-2 text-xs text-green-600 border-green-200 bg-green-50"
              >
                Done
              </Badge>
            )}
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditOpen(true)}
            aria-label="Edit todo"
            className="h-8 w-8 p-0"
          >
            ✏️
          </Button>

          {/* Delete with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                disabled={isDeleting}
                aria-label="Delete todo"
                className="h-8 w-8 p-0 hover:text-destructive"
              >
                🗑️
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-medium text-foreground">&ldquo;{todo.title}&rdquo;</span>{" "}
                  will be permanently deleted. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteTodo(todo._id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {editOpen && (
        <EditTodoDialog todo={todo} open={editOpen} onClose={() => setEditOpen(false)} />
      )}
    </>
  );
};
