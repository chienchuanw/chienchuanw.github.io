import { NextRequest, NextResponse } from 'next/server';

// 需要身份驗證的路徑
const AUTH_PATHS = [
  '/admin',
  '/profile',
];

// 不需要驗證的認證相關路徑
const PUBLIC_AUTH_PATHS = [
  '/login',
  // 移除 '/register' 路徑，使其不可公開訪問
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 檢查是否為需要身份驗證的路徑
  const isAuthPath = AUTH_PATHS.some(path => pathname.startsWith(path));
  const isPublicAuthPath = PUBLIC_AUTH_PATHS.some(path => pathname.startsWith(path));
  
  // 獲取身份驗證令牌
  const authToken = request.cookies.get('auth_token')?.value;
  
  // 如果是需要身份驗證的路徑但沒有令牌，重定向到登入頁面
  if (isAuthPath && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 如果已登入且嘗試訪問公共認證頁面，重定向到首頁
  if (isPublicAuthPath && authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 阻止訪問註冊頁面，重定向到登入頁面
  if (pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 其他情況正常處理
  return NextResponse.next();
}

// 配置匹配的路徑
export const config = {
  matcher: [
    // 需要身份驗證的路徑
    '/admin/:path*',
    '/profile/:path*',
    // 公共認證頁面
    '/login',
    '/register', // 保留以便重定向
  ],
};
