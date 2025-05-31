// 用於執行數據庫遷移的腳本
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";
import { join } from "path";
import * as fs from "fs";

// 確保載入環境變數 - 在生產環境中，環境變數由平台提供
const envPath = join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  config({ path: envPath });
  console.log("已載入本地環境變數檔案");
} else if (process.env.NODE_ENV !== "production") {
  console.warn(`找不到環境變數檔案: ${envPath}`);
  console.log("在開發環境中，請確保 .env.local 檔案存在");
} else {
  console.log("生產環境：使用平台提供的環境變數");
}

const runMigrations = async () => {
  // 使用環境變數或預設連接字串
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/db_blog";

  // 用於遷移的客戶端
  const migrationClient = postgres(databaseUrl, { max: 1 });

  try {
    // 創建 drizzle 實例
    const db = drizzle(migrationClient);

    // 執行遷移
    await migrate(db, { migrationsFolder: "lib/db/migrations" });
  } catch (error) {
    console.error("數據庫遷移失敗:", error);
    process.exit(1);
  } finally {
    // 關閉數據庫連接
    await migrationClient.end();
  }
};

// 執行遷移
(async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error("遷移過程中發生錯誤:", error);
    process.exit(1);
  }
})();
