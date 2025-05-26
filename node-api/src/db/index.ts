import { drizzle } from "drizzle-orm/node-postgres";

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Required if using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
export const db = drizzle(process.env.DATABASE_URL!);
