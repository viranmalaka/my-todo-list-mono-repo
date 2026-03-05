import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Todo, CreateTodoDto, UpdateTodoDto } from "../types/todo";
import { TodoService } from "@/service/TodoService";

const TODOS_KEY = ["todos"] as const;

export const useGetTodos = () =>
  useQuery({
    queryKey: TODOS_KEY,
    queryFn: TodoService.getAll,
    staleTime: 30_000,
  });

export const useCreateTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTodoDto) => TodoService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useUpdateTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTodoDto }) => TodoService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
    onError: (err: Error) => toast.error(err.message),
  });
};

/**
 * Optimistic update: flip done immediately in the cache.
 * Rolls back automatically if the server call fails.
 */
export const useToggleDone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TodoService.toggleDone(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const previous = qc.getQueryData<Todo[]>(TODOS_KEY);
      qc.setQueryData<Todo[]>(TODOS_KEY, (old = []) =>
        old.map((t) => (t._id === id ? { ...t, done: !t.done } : t))
      );
      return { previous };
    },
    onError: (_err: Error, _id, ctx) => {
      qc.setQueryData(TODOS_KEY, ctx?.previous);
      toast.error("Failed to update todo. Changes reverted.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
};

export const useDeleteTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TodoService.delete(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const previous = qc.getQueryData<Todo[]>(TODOS_KEY);
      qc.setQueryData<Todo[]>(TODOS_KEY, (old = []) => old.filter((t) => t._id !== id));
      return { previous };
    },
    onError: (_err: Error, _id, ctx) => {
      qc.setQueryData(TODOS_KEY, ctx?.previous);
      toast.error("Failed to delete todo. Changes reverted.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
};
