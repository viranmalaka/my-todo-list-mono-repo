import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import todoRouter from "./routes/todo";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Security & logging middleware
// In dev, disable helmet's cross-origin policy so Vite dev server can reach the API
app.use(
  helmet({
    crossOriginResourcePolicy: config.isDev ? false : { policy: "same-origin" },
  })
);
app.use(
  cors({
    // In dev, reflect the request origin (works for any localhost port).
    // In production, restrict to the configured CLIENT_ORIGIN.
    origin: config.isDev ? true : config.clientOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(morgan(config.isDev ? "dev" : "combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api/todos", todoRouter);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
