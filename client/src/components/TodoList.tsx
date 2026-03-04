import { useRef, useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGetTodos } from "@/hooks/todo-queries";
import { TodoItem } from "./TodoItem";
import { TodoSkeleton } from "./TodoSkeleton";

export const TodoList = () => {
  const { data: todos, isLoading, isError, error } = useGetTodos();
  const [sortDoneToBottom, setSortDoneToBottom] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  // Sorted list: done items float to bottom when toggle is on
  const sortedTodos = useMemo(() => {
    if (!todos) return [];
    if (!sortDoneToBottom) return todos;
    return [...todos].sort((a, b) => {
      if (a.done === b.done) return 0;
      return a.done ? 1 : -1;
    });
  }, [todos, sortDoneToBottom]);

  const doneCount = useMemo(() => todos?.filter((t) => t.done).length ?? 0, [todos]);
  const totalCount = todos?.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const rowVirtualizer = useVirtualizer({
    count: sortedTodos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 115,
    overscan: 5,
  });

  if (isLoading) return <TodoSkeleton />;

  if (isError) {
    return (
      <div className="p-6 text-center rounded-xl border border-destructive/40 bg-destructive/5">
        <p className="text-destructive font-medium">Failed to load todos</p>
        <p className="text-muted-foreground text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium">No tasks yet</p>
        <p className="text-sm mt-1">Add your first task above to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {doneCount} of {totalCount} completed
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Sort toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">Move done to bottom</span>
        <button
          role="switch"
          aria-checked={sortDoneToBottom}
          onClick={() => setSortDoneToBottom((v) => !v)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${sortDoneToBottom ? "bg-primary" : "bg-input"}`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200
              ${sortDoneToBottom ? "translate-x-4" : "translate-x-0"}`}
          />
        </button>
      </div>

      {/* Virtualised list */}
      <div ref={parentRef} className="overflow-y-auto h-[60vh]">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const todo = sortedTodos[virtualItem.index];
            if (!todo) return null;
            return (
              <div
                key={todo._id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingBottom: "12px",
                  paddingTop: "6px",
                }}
              >
                <TodoItem todo={todo} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
