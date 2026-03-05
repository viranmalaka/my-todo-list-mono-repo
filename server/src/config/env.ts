import "dotenv/config";

// TODO: add this
const getRequired = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: process.env.PORT || "5000",
  mongoUri: getRequired("MONGO_URI"),
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  isDev: (process.env.NODE_ENV || "development") === "development",
};
