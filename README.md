# My Todo List

A full-stack, production-ready todo application built as an npm monorepo.

React + Vite on the front end, Node.js + Express + MongoDB on the back end, served through an nginx reverse proxy — all wired together with Docker Compose.

---

## Monorepo Structure

```
type-b-todo-list/
├── client/              # React + Vite SPA  →  client/README.md
├── server/              # Express REST API  →  server/README.md
├── docker-compose.yml   # Full production stack (mongo + server + client)
├── dev-mongo.sh         # Helper: start only MongoDB for local dev
└── package.json         # npm workspaces root
```

---

## Prerequisites

| Requirement    | Version |
| -------------- | ------- |
| Node.js        | 20+     |
| Docker Desktop | latest  |

---

## Quick Start — Full Stack with Docker

> Starts MongoDB, the Express API, and the React app (behind nginx) in one command.

```bash
git clone https://github.com/viranmalaka/my-todo-list-mono-repo.git
cd my-todo-list-mono-repo

docker compose up --build
```

Open **http://localhost** in your browser.

```bash
docker compose down       # stop, keep data
docker compose down -v    # stop and wipe the database volume
```

---

## Development Mode (without Docker)

See the individual READMEs for full per-package setup:

- **[client/README.md](./client/README.md)** — Vite dev server, env vars, component overview
- **[server/README.md](./server/README.md)** — API reference, env vars, running tests

The short version:

```bash
# 1. Start MongoDB only
./dev-mongo.sh

# 2. Copy env file and configure
cp server/.env.example server/.env   # set MONGO_URI=mongodb://localhost:27028/todos

# 3. Install all workspace dependencies
npm install

# 4. Start both dev servers concurrently
npm run dev
```

| Service          | URL                   |
| ---------------- | --------------------- |
| React (Vite HMR) | http://localhost:5173 |
| Express API      | http://localhost:5000 |

---

## Root-level Scripts

| Script                 | Description                                 |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start client + server concurrently          |
| `npm run build`        | Build server (tsc) then client (vite build) |
| `npm run format`       | Prettier across all workspaces              |
| `npm run format:check` | CI format check                             |
