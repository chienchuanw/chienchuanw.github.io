import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 獲取身份驗證令牌
    const authToken = cookies().get('auth_token')?.value;
    
    if (authToken) {
      // 刪除會話
      await authService.logout(authToken);
      
      // 刪除 cookie
      cookies().delete('auth_token');
    }
    
    return NextResponse.json({ message: '登出成功' });
  } catch (error) {
    console.error('登出時發生錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' }, 
      { status: 500 }
    );
  }
}
