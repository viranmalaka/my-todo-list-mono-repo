import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">My Todo List</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Stay organised, get things done
              </p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <TodoForm />

          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Your tasks
            </h2>
            <ErrorBoundary>
              <TodoList />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Global toast notifications */}
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
