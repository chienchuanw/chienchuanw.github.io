import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 檢查環境變數是否存在
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL 環境變數未設置');
}

// 用於查詢的客戶端
const queryClient = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(queryClient, { schema });

export default db;
