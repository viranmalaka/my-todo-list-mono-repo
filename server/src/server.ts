import app from "./app";

const start = async (): Promise<void> => {
  app.listen("4000", () => {
    console.log(`🚀 Server running on http://localhost:4000`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
