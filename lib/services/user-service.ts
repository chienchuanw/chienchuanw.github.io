import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import db from '../db';
import { users, NewUser, User } from '../db/schema';

export const userService = {
  /**
   * 根據電子郵件獲取用戶
   */
  async getByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  },

  /**
   * 根據用戶名獲取用戶
   */
  async getByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  },

  /**
   * 創建新用戶
   */
  async create(userData: Omit<NewUser, 'createdAt' | 'updatedAt'>): Promise<User> {
    // 加密密碼
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 插入用戶到數據庫
    const result = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning();
    
    return result[0];
  },

  /**
   * 驗證用戶密碼
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  },

  /**
   * 更新用戶信息
   */
  async update(id: number, userData: Partial<Omit<NewUser, 'createdAt' | 'updatedAt'>>): Promise<User> {
    // 如果提供了新密碼，則加密
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const result = await db.update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
      
    return result[0];
  },

  /**
   * 刪除用戶
   */
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
      
    return result.length > 0;
  }
};
