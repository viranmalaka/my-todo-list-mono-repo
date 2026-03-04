import "dotenv/config";

export const config = {
  port: process.env.PORT || "5000",
  mongoUri: process.env.MONGO_URI || "",
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  isDev: (process.env.NODE_ENV || "development") === "development",
};
