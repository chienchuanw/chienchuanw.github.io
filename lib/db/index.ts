import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 檢查環境變數是否存在
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/db_blog";

// 用於查詢的客戶端
const queryClient = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(queryClient, { schema });

export default db;
