# Server — Express REST API

The back-end workspace of the todo monorepo. A Node.js + Express API backed by MongoDB, written in TypeScript.

---

## Tech Stack

| Technology              | Role                        |
| ----------------------- | --------------------------- |
| Node.js 20 + TypeScript | Runtime + language          |
| Express 4               | HTTP framework              |
| MongoDB 7 + Mongoose 8  | Database + ODM              |
| express-validator       | Request validation          |
| helmet + cors           | Security middleware         |
| morgan                  | HTTP request logging        |
| Vitest + Supertest      | Testing                     |
| mongodb-memory-server   | In-memory MongoDB for tests |

---

## Project Structure

```
src/
├── config/
│   └── env.ts               # Reads and validates env vars (fails fast on missing)
├── controllers/
│   └── todo.controller.ts   # Route handler functions
├── errors/
│   └── AppError.ts          # Single error class + static factories + error codes
├── middleware/
│   ├── asyncHandler.ts      # Wraps async handlers — forwards errors to next()
│   ├── errorHandler.ts      # Global error handler (last middleware in app.ts)
│   └── validate.ts          # Runs express-validator checks, returns 422 on failure
├── models/
│   └── Todo.ts              # Mongoose schema + ITodo interface
├── routes/
│   └── todo.ts              # Router — validation chains + controller wiring
├── __tests__/
│   ├── setup.ts             # beforeAll/afterEach/afterAll hooks (mongo-memory-server)
│   ├── app.test.ts          # Health check + unknown routes
│   ├── AppError.test.ts     # Unit tests for all AppError factories
│   ├── todo.routes.test.ts  # Integration tests for all 5 CRUD endpoints
│   └── middleware/
│       ├── asyncHandler.test.ts
│       ├── errorHandler.test.ts
│       └── validate.test.ts
├── app.ts                   # Express app — middleware stack + route mounting
├── db.ts                    # MongoDB connection with retry logic
└── server.ts                # Entry point — connectDB() then app.listen()
```

---

## Architectural Decisions

**`AppError` + global error handler** — All intentional errors are thrown as `AppError` instances with a machine-readable `code`. The global `errorHandler` also catches Mongoose `CastError`, `ValidationError`, and duplicate-key errors, serialising them into a consistent response shape so clients never receive raw stack traces.

**`asyncHandler` wrapper** — Eliminates `try/catch` boilerplate in every controller. Any thrown error (or rejected promise) is forwarded to Express's `next(err)`.

**Fail-fast env config** — `config/env.ts` throws immediately on startup if a required variable is missing, rather than failing silently at runtime.

**Retry logic on DB connect** — `db.ts` retries the MongoDB connection up to 5 times with a 3-second interval before exiting, which handles race conditions in Docker Compose startup order.

---

## REST API Reference

Base path: `/api/v1/todos`

| Method   | Path        | Description                     | Body                       | Success          |
| -------- | ----------- | ------------------------------- | -------------------------- | ---------------- |
| `GET`    | `/`         | List all todos, newest first    | —                          | `200 Todo[]`     |
| `POST`   | `/`         | Create a new todo               | `{ title, description? }`  | `201 Todo`       |
| `PUT`    | `/:id`      | Update title and/or description | `{ title?, description? }` | `200 Todo`       |
| `PATCH`  | `/:id/done` | Toggle the `done` flag          | —                          | `200 Todo`       |
| `DELETE` | `/:id`      | Delete a todo                   | —                          | `204 No Content` |

### Todo object

```jsonc
{
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Buy milk",
  "description": "Full-fat, 2 litres", // optional
  "done": false,
  "createdAt": "2024-09-23T10:00:00.000Z",
  "updatedAt": "2024-09-23T10:00:00.000Z",
}
```

### Validation rules

| Field         | Rule                                                     |
| ------------- | -------------------------------------------------------- |
| `title`       | Required on POST · 1–255 characters · whitespace-trimmed |
| `description` | Optional · max 2000 characters                           |
| `:id`         | Must be a valid MongoDB ObjectId                         |

### Error response shape

```jsonc
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    // present for 422 responses
    { "field": "title", "message": "Title is required" },
  ],
}
```

Error codes: `NOT_FOUND` · `BAD_REQUEST` · `VALIDATION_ERROR` · `UNPROCESSABLE` · `DUPLICATE_KEY` · `INVALID_ID` · `INTERNAL_ERROR`

---

## Environment Variables

Copy `.env.example` → `.env` and fill in the values.

| Variable        | Default                 | Required | Description                                                |
| --------------- | ----------------------- | -------- | ---------------------------------------------------------- |
| `PORT`          | `5000`                  | No       | Port the server listens on                                 |
| `MONGO_URI`     | —                       | **Yes**  | MongoDB connection string                                  |
| `NODE_ENV`      | `development`           | No       | Enables dev-only features (detailed errors, CORS wildcard) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | No       | Allowed CORS origin in production                          |

---

## Local Development

From the **monorepo root** (starts both client + server):

```bash
npm run dev
```

Or server only:

```bash
npm run dev -w server
```

The API listens at **http://localhost:5000**.

For local MongoDB, use the helper script at the monorepo root:

```bash
./dev-mongo.sh          # start on port 27028
./dev-mongo.sh stop     # stop (data preserved)
./dev-mongo.sh reset    # stop + wipe volume
```

---

## Running Tests

Tests use `mongodb-memory-server` — no running database required.

```bash
npm test -w server               # run all tests once
npm run test:watch -w server     # watch mode
npm run test:coverage -w server  # with coverage report (threshold: 90%)
```

### Test coverage areas

| File                              | Covers                                                         |
| --------------------------------- | -------------------------------------------------------------- |
| `todo.routes.test.ts`             | All 5 endpoints — happy paths, validation, 404s                |
| `app.test.ts`                     | Health check, unknown routes                                   |
| `AppError.test.ts`                | All static factory methods + constructor                       |
| `middleware/errorHandler.test.ts` | AppError, CastError, ValidationError, E11000, unhandled errors |
| `middleware/validate.test.ts`     | Pass-through, validation failure, non-field errors             |
| `middleware/asyncHandler.test.ts` | Resolve, reject, thrown errors                                 |
