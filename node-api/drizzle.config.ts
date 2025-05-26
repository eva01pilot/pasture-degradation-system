import * as dotenv from "dotenv";
import path from "path";
import { defineConfig } from "drizzle-kit";

// Ensure the root .env is loaded even from subdir
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
