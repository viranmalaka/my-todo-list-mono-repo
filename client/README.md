# Client — React + Vite SPA

The front-end workspace of the todo monorepo. Built with React 18, TypeScript, and Vite. Styled with Tailwind CSS v4 via shadcn/ui components.

---

## Tech Stack

| Technology            | Role                                         |
| --------------------- | -------------------------------------------- |
| React 18 + TypeScript | UI framework                                 |
| Vite                  | Build tool + dev server (HMR)                |
| Tailwind CSS v4       | Utility-first styling                        |
| shadcn/ui             | Pre-built accessible component primitives    |
| TanStack Query v5     | Server state, caching, and mutations         |
| TanStack Virtualizer  | Performant list rendering for large datasets |
| React Hook Form + Zod | Client-side form validation                  |
| Axios                 | HTTP client                                  |

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (Button, Checkbox, …)
│   ├── TodoForm.tsx     # Add-todo form with Zod validation
│   ├── TodoItem.tsx     # Single todo row — toggle, edit, delete
│   ├── TodoList.tsx     # Virtualised list + progress bar + sort toggle
│   ├── EditTodoDialog.tsx
│   ├── TodoSkeleton.tsx # Loading skeleton
│   └── ErrorBoundary.tsx
├── context/
│   └── NewTodoContext.tsx  # Tracks last-created ID for entrance animation
├── hooks/
│   └── todo-queries.ts  # TanStack Query hooks (useGetTodos, useCreateTodo, …)
├── service/
│   └── TodoService.ts   # Axios API calls
├── types/
│   └── todo.ts          # Shared TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css            # Tailwind + custom keyframe animations
```

---

## Key Design Decisions

**Virtualised list** — `useVirtualizer` from TanStack renders only the rows in the viewport. This keeps performance smooth regardless of how many todos exist.

**Optimistic updates** — `useToggleDone` and `useDeleteTodo` update the local TanStack Query cache immediately in `onMutate`, giving instant feedback. On server error the snapshot is restored automatically.

**Single nginx reverse proxy** — In the Docker build, `VITE_API_URL` is intentionally left empty. The browser uses relative `/api/*` paths which nginx proxies to the server container. This means the same build artifact works in any environment.

---

## Environment Variables

Create a `.env.local` file in `client/` for local development overrides.

| Variable       | Default      | Description                                                                                                                                                    |
| -------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | `""` (empty) | API base URL. Empty = relative paths (correct for Docker/nginx). Set to `http://localhost:5000` only if running the client standalone without the nginx proxy. |

---

## Local Development

From the **monorepo root**:

```bash
npm run dev -w client    # Vite dev server only
# or
npm run dev              # client + server together (recommended)
```

The dev server starts at **http://localhost:5173**.

---

## Production Build (Docker)

The `Dockerfile` uses a two-stage build:

1. **Builder** — installs deps and runs `vite build` → outputs to `dist/`
2. **Serve** — copies `dist/` into an nginx image; `nginx.conf` proxies `/api/*` to the server

```bash
docker compose up --build   # from the monorepo root
```
