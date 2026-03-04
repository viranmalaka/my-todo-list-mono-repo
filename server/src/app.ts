import express from "express";

const app = express();

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

export default app;
