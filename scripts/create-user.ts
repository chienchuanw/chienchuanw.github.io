import { config } from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';
import bcrypt from 'bcrypt';
import readline from 'readline';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, or } from 'drizzle-orm';

// 載入環境變數
const envPath = join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`載入環境變數從: ${envPath}`);
  config({ path: envPath });
} else {
  console.error(`找不到環境變數檔案: ${envPath}`);
  process.exit(1);
}

// 檢查環境變數
if (!process.env.DATABASE_URL) {
  console.error('環境變數 DATABASE_URL 未設置');
  process.exit(1);
}

// 手動建立資料庫連接
const databaseUrl = process.env.DATABASE_URL;
console.log(`連接到資料庫: ${databaseUrl.split('@')[1] || '(隱藏連接字串)'}`);

const client = postgres(databaseUrl, { max: 1 });

// 載入資料表結構
import { users } from '../lib/db/schema';

// 建立 Drizzle 實例
const db = drizzle(client);

// 建立命令行介面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示函數
const prompt = (question: string): Promise<string> => new Promise((resolve) => rl.question(question, resolve));

// 主函數
async function main() {
  try {
    console.log('=== 創建新用戶 ===');
    
    // 獲取用戶信息
    const email = await prompt('電子郵件: ');
    const username = await prompt('用戶名: ');
    const fullName = await prompt('姓名 (可選，直接按 Enter 跳過): ');
    const password = await prompt('密碼: ');
    const role = await prompt('角色 (admin/user，默認為 user): ') || 'user';
    
    // 確認
    console.log('\n=== 確認信息 ===');
    console.log(`電子郵件: ${email}`);
    console.log(`用戶名: ${username}`);
    console.log(`姓名: ${fullName || '(無)'}`);
    console.log(`密碼: ${password.replace(/./g, '*')}`);
    console.log(`角色: ${role}`);
    
    const confirm = await prompt('\n確認創建此用戶? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('操作已取消');
      return;
    }
    
    // 檢查是否已存在
    const existingUsers = await db.select().from(users).where(
      or(eq(users.email, email), eq(users.username, username))
    );
    
    if (existingUsers.length > 0) {
      for (const user of existingUsers) {
        if (user.email === email) {
          console.error(`錯誤: 電子郵件 "${email}" 已被使用`);
        }
        if (user.username === username) {
          console.error(`錯誤: 用戶名 "${username}" 已被使用`);
        }
      }
      return;
    }
    
    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 創建用戶
    const newUser = await db.insert(users).values({
      email,
      username,
      password: hashedPassword,
      fullName: fullName || null,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    console.log('\n✅ 用戶創建成功!');
    console.log(`用戶 ID: ${newUser[0].id}`);
    console.log(`電子郵件: ${newUser[0].email}`);
    console.log(`用戶名: ${newUser[0].username}`);
    console.log(`角色: ${newUser[0].role}`);
    
  } catch (error) {
    console.error('創建用戶時出錯:', error);
  } finally {
    // 關閉資料庫連接和讀取介面
    rl.close();
    await client.end();
    process.exit(0);
  }
}

// 執行主函數
(async () => {
  try {
    await main();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
