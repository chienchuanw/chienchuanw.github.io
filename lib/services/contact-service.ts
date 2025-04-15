import { eq } from 'drizzle-orm';
import db from '../db';
import { contactInfo, ContactInfo, NewContactInfo } from '../db/schema';

export const contactService = {
  /**
   * 獲取聯絡頁面資訊
   * 通常只會有一筆資料，所以直接返回第一筆
   */
  async getContactInfo(): Promise<ContactInfo | undefined> {
    const result = await db.select().from(contactInfo);
    return result[0];
  },

  /**
   * 更新聯絡頁面資訊
   */
  async updateContactInfo(id: number, data: Partial<Omit<NewContactInfo, 'createdAt' | 'updatedAt'>>): Promise<ContactInfo> {
    const result = await db.update(contactInfo)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contactInfo.id, id))
      .returning();
      
    return result[0];
  },

  /**
   * 創建聯絡頁面資訊（如果不存在）
   */
  async createContactInfo(data: Omit<NewContactInfo, 'createdAt' | 'updatedAt'>): Promise<ContactInfo> {
    const result = await db.insert(contactInfo)
      .values({
        ...data,
      })
      .returning();
      
    return result[0];
  },
};