import app from "./app";
import { connectDB } from "./db";
import { config } from "./config/env";

const start = async (): Promise<void> => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port} [${config.nodeEnv}]`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
