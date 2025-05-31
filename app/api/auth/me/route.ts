import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 獲取身份驗證令牌
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: '未授權' }, 
        { status: 401 }
      );
    }
    
    // 驗證會話
    const user = await authService.validateSession(authToken);
    
    if (!user) {
      // 清除無效的 cookie
      const cookieStore = await cookies();
      cookieStore.delete('auth_token');
      
      return NextResponse.json(
        { error: '會話已過期' }, 
        { status: 401 }
      );
    }
    
    // 返回用戶數據
    return NextResponse.json({ user });
  } catch (error) {
    console.error('獲取用戶信息時發生錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' }, 
      { status: 500 }
    );
  }
}
