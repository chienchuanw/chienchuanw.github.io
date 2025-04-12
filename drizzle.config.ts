import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// 載入 .env.local 檔案
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 環境變數未設置");
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
