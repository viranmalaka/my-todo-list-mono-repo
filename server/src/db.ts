import mongoose from "mongoose";
import { config } from "./config/env";

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

export const connectDB = async (retries = MAX_RETRIES): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    if (retries > 0) {
      console.warn(
        `⚠️  MongoDB connection failed. Retrying in ${RETRY_INTERVAL_MS / 1000}s... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      return connectDB(retries - 1);
    }
    console.error("❌ MongoDB connection failed after all retries:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed (SIGINT)");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed (SIGTERM)");
  process.exit(0);
});
