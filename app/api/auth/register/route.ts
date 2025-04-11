import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/user-service';

export async function POST(request: NextRequest) {
  try {
    // 解析請求數據
    const { email, username, password, fullName } = await request.json();
    
    // 必填欄位驗證
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: '電子郵件、用戶名和密碼為必填項' }, 
        { status: 400 }
      );
    }
    
    // 檢查電子郵件是否已被使用
    const existingUserByEmail = await userService.getByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: '該電子郵件已被註冊' }, 
        { status: 400 }
      );
    }
    
    // 檢查用戶名是否已被使用
    const existingUserByUsername = await userService.getByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: '該用戶名已被使用' }, 
        { status: 400 }
      );
    }
    
    // 創建新用戶
    const newUser = await userService.create({
      email,
      username,
      password,
      fullName: fullName || null,
      role: 'user',
      isActive: true,
    });
    
    // 從響應中排除密碼
    const { password: _, ...userWithoutPassword } = newUser;
    
    // 返回新用戶數據
    return NextResponse.json({
      user: userWithoutPassword,
      message: '註冊成功'
    }, { status: 201 });
    
  } catch (error) {
    console.error('註冊時發生錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' }, 
      { status: 500 }
    );
  }
}
