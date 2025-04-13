// 用於執行數據庫遷移的腳本
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";
import { join } from "path";
import * as fs from "fs";

// 確保載入環境變數
const envPath = join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  console.log(`載入環境變數從: ${envPath}`);
  config({ path: envPath });
} else {
  console.error(`找不到環境變數檔案: ${envPath}`);
  process.exit(1);
}

const runMigrations = async () => {
  // 使用環境變數或預設連接字串
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/db_blog";

  // 顯示連接資訊（隱藏敏感資訊）
  const connectionInfo = databaseUrl.includes("@")
    ? databaseUrl.split("@")[1]
    : "(隱藏連接字串)";
  console.log(`連接到資料庫: ${connectionInfo}`);

  // 用於遷移的客戶端
  const migrationClient = postgres(databaseUrl, { max: 1 });

  try {
    console.log("開始執行數據庫遷移...");

    // 創建 drizzle 實例
    const db = drizzle(migrationClient);

    // 執行遷移
    await migrate(db, { migrationsFolder: "lib/db/migrations" });

    console.log("數據庫遷移成功完成！");
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
