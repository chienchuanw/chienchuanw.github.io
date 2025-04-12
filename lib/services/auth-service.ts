import { eq } from 'drizzle-orm';
import db from '../db';
import { sessions, users, NewSession, Session } from '../db/schema';
import { userService } from './user-service';
import crypto from 'crypto';

export const authService = {
  /**
   * 用戶登入
   */
  async login(email: string, password: string): Promise<{ user: any; token: string } | null> {
    // 根據電子郵件獲取用戶
    const user = await userService.getByEmail(email);
    if (!user) return null;
    
    // 驗證密碼
    const isValid = await userService.validatePassword(user, password);
    if (!isValid) return null;
    
    // 生成會話令牌
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 會話有效期7天
    
    // 創建會話
    const sessionData: NewSession = {
      userId: user.id,
      token,
      expires: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.insert(sessions).values(sessionData);
    
    // 移除用戶密碼後返回
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  },
  
  /**
   * 根據令牌驗證用戶會話
   */
  async validateSession(token: string): Promise<any | null> {
    // 獲取會話信息
    const [session] = await db.select()
      .from(sessions)
      .where(eq(sessions.token, token));
      
    if (!session) return null;
    
    // 檢查會話是否過期
    if (new Date() > session.expires) {
      // 自動刪除過期會話
      await db.delete(sessions).where(eq(sessions.id, session.id));
      return null;
    }
    
    // 獲取用戶信息
    const user = await db.select()
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token));
      
    if (!user || user.length === 0) return null;
    
    // 移除用戶密碼後返回
    const { password: _, ...userWithoutPassword } = user[0].users;
    return userWithoutPassword;
  },
  
  /**
   * 登出用戶
   */
  async logout(token: string): Promise<boolean> {
    const result = await db.delete(sessions)
      .where(eq(sessions.token, token))
      .returning({ id: sessions.id });
      
    return result.length > 0;
  }
};
