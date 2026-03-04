/**
 * Global test setup – uses mongodb-memory-server so no real MongoDB instance
 * is needed. Vitest picks this file up via vitest.config.ts > setupFiles.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterEach, afterAll } from "vitest";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  // Overwrite the env var so config/env.ts picks it up
  process.env["MONGO_URI"] = uri;
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Wipe all collections between tests so each test starts fresh
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]!.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
