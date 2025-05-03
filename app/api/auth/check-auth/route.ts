import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authService } from '@/lib/services/auth-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 獲取身份驗證令牌
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    // 驗證會話
    const user = await authService.validateSession(authToken);

    if (!user) {
      // 清除無效的 cookie
      cookieStore.delete('auth_token');

      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    // 返回用戶數據和身份驗證狀態
    return NextResponse.json({
      authenticated: true,
      user,
      isAdmin: user.role === 'admin'
    });
  } catch (error) {
    console.error('檢查認證狀態時發生錯誤:', error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: '伺服器錯誤，請稍後再試'
    }, { status: 500 });
  }
}
