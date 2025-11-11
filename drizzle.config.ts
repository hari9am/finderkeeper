import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mongodb",
  dbCredentials: {
    url: process.env.MONGO_URI || "mongodb://localhost:27017/finderskeepers",
  },
});
