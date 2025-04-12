import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 解析請求數據
    const body = await request.json();
    console.log('Login request body:', body);
    
    const { identifier, password } = body;
    
    // 必填欄位驗證
    if (!identifier || !password) {
      return NextResponse.json(
        { error: '用戶名/電子郵件和密碼為必填項' }, 
        { status: 400 }
      );
    }
    
    // 嘗試登入
    const result = await authService.login(identifier, password);
    
    if (!result) {
      return NextResponse.json(
        { error: '無效的用戶名/電子郵件或密碼' }, 
        { status: 401 }
      );
    }
    
    // 設置 HTTP-only 安全 cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7天，與會話有效期一致
      path: '/',
    });
    
    // 返回用戶數據（不包含密碼）
    return NextResponse.json({ 
      user: result.user,
      message: '登入成功'
    });
    
  } catch (error) {
    console.error('登入時發生錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' }, 
      { status: 500 }
    );
  }
}
