import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTodo } from "@/hooks/todo-queries";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
  description: z.string().trim().max(2000, "Max 2000 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

export const TodoForm = () => {
  const { mutate: createTodo, isPending } = useCreateTodo();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    createTodo(data, { onSuccess: () => reset() });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4"
    >
      <h2 className="text-lg font-semibold text-foreground">Add a new task</h2>

      <div className="space-y-1">
        <Input
          id="todo-title"
          placeholder="What needs to be done?"
          {...register("title")}
          className={errors.title ? "border-destructive" : ""}
          disabled={isPending}
        />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <Textarea
          id="todo-description"
          placeholder="Add a description (optional)"
          rows={2}
          {...register("description")}
          disabled={isPending}
        />
        {errors.description && (
          <p className="text-destructive text-sm">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Adding…" : "Add Task"}
      </Button>
    </form>
  );
};
