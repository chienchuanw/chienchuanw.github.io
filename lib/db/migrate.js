// 用於執行數據庫遷移的腳本
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');

// 確保載入環境變數
require('dotenv').config({ path: '.env.local' });

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 環境變數未設置');
  }

  // 用於遷移的客戶端
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    console.log('開始執行數據庫遷移...');
    
    // 創建 drizzle 實例
    const db = drizzle(migrationClient);
    
    // 執行遷移
    await migrate(db, { migrationsFolder: 'lib/db/migrations' });
    
    console.log('數據庫遷移成功完成！');
  } catch (error) {
    console.error('數據庫遷移失敗:', error);
    process.exit(1);
  } finally {
    // 關閉數據庫連接
    await migrationClient.end();
  }
};

// 執行遷移
runMigrations();
