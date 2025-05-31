// 用於執行數據庫遷移的腳本
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";
import { join } from "path";
import * as fs from "fs";

// 確保載入環境變數 - 支援多種環境
const loadEnvironmentVariables = () => {
  // 在本地開發環境載入 .env.local
  const envPath = join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    config({ path: envPath });
    console.log("✅ 已載入本地環境變數檔案");
  } else {
    // 在生產環境（如 Zeabur）中，環境變數由平台提供
    console.log("ℹ️  使用平台提供的環境變數");
  }
};

const runMigrations = async () => {
  // 載入環境變數
  loadEnvironmentVariables();

  // 檢查必要的環境變數
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ 錯誤：找不到 DATABASE_URL 環境變數");
    console.log("💡 請確保在 Zeabur 控制台中設定了 DATABASE_URL");
    console.log("📋 格式範例：postgresql://username:password@host:port/database");
    process.exit(1);
  }

  console.log("🚀 開始執行資料庫遷移...");
  // 隱藏密碼的安全顯示
  const safeUrl = databaseUrl.replace(/:[^:@]*@/, ':****@');
  console.log("🔗 資料庫連線:", safeUrl);

  // 用於遷移的客戶端
  const migrationClient = postgres(databaseUrl, { max: 1 });

  try {
    // 創建 drizzle 實例
    const db = drizzle(migrationClient);

    // 執行遷移
    console.log("📁 遷移檔案路徑: lib/db/migrations");
    await migrate(db, { migrationsFolder: "lib/db/migrations" });
    console.log("✅ 資料庫遷移成功完成！");
  } catch (error) {
    console.error("❌ 資料庫遷移失敗:", error);

    // 提供更詳細的錯誤資訊
    if (error instanceof Error) {
      console.error("錯誤詳情:", error.message);
      if (error.message.includes("ENOTFOUND") || error.message.includes("connection")) {
        console.log("💡 可能的解決方案：");
        console.log("   1. 檢查資料庫連線字串是否正確");
        console.log("   2. 確認資料庫服務是否正在運行");
        console.log("   3. 檢查網路連線");
      }
    }

    process.exit(1);
  } finally {
    // 關閉數據庫連接
    await migrationClient.end();
    console.log("🔌 資料庫連線已關閉");
  }
};

// 執行遷移
(async () => {
  try {
    console.log("🎯 開始資料庫遷移程序...");
    await runMigrations();
    console.log("🎉 遷移程序完成！");
  } catch (error) {
    console.error("💥 遷移過程中發生未預期的錯誤:", error);
    process.exit(1);
  }
})();
