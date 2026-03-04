import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTodo } from "@/hooks/todo-queries";
import type { Todo } from "@/types/todo";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
  description: z.string().trim().max(2000, "Max 2000 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  todo: Todo;
  open: boolean;
  onClose: () => void;
}

export const EditTodoDialog = ({ todo, open, onClose }: Props) => {
  const { mutate: updateTodo, isPending } = useUpdateTodo();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: todo.title, description: todo.description ?? "" },
  });

  const onSubmit = (data: FormValues) => {
    updateTodo({ id: todo._id, dto: data }, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Input
              id="edit-title"
              placeholder="Title"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
              disabled={isPending}
            />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Textarea
              id="edit-description"
              placeholder="Description (optional)"
              rows={3}
              {...register("description")}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
