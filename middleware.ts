import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import routes from "@/lib/routes";
import { locales, defaultLocale, getLocaleFromPathname, removeLocaleFromPathname } from '@/lib/i18n/config';

// 需要身份驗證的路徑
// 使用 routes 對象中的路徑
// 添加 admin 路徑，使其需要登入才能訪問
const AUTH_PATHS = [routes.profile, routes.admin];

// 不需要驗證的認證相關路徑
const PUBLIC_AUTH_PATHS = [
  routes.login,
  // 移除 '/register' 路徑，使其不可公開訪問
];

// 建立 i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // 所有語言都顯示前綴，避免重定向循環
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 檢查是否為 API 路由或靜態資源，如果是則跳過處理
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 添加自定義 header 以便在 request.ts 中使用
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 優先處理 i18n 路由 - 這會處理根路徑的語言重定向
  const intlResponse = intlMiddleware(request);

  // 如果 intlMiddleware 返回重定向（例如 / -> /en），直接返回
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // 獲取當前語言和清理後的路徑
  const currentLocale = getLocaleFromPathname(pathname);
  const cleanPathname = removeLocaleFromPathname(pathname);

  // 檢查是否為需要身份驗證的路徑（使用清理後的路徑）
  const isAuthPath = AUTH_PATHS.some((path) => cleanPathname.startsWith(path));
  const isPublicAuthPath = PUBLIC_AUTH_PATHS.some((path) =>
    cleanPathname.startsWith(path)
  );

  // 獲取身份驗證令牌
  const authToken = request.cookies.get("auth_token")?.value;

  // 如果是需要身份驗證的路徑但沒有令牌，重定向到登入頁面
  if (isAuthPath && !authToken) {
    const loginUrl = new URL(routes.login, request.url);
    // 保持當前語言
    if (currentLocale && currentLocale !== defaultLocale) {
      loginUrl.pathname = `/${currentLocale}${routes.login}`;
    }
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登入且嘗試訪問公共認證頁面，重定向到首頁
  if (isPublicAuthPath && authToken) {
    const referer = request.headers.get("referer");
    const isFormSubmission =
      request.method === "POST" || (referer && referer.includes(routes.login));

    if (!isFormSubmission) {
      const homeUrl = new URL(routes.home, request.url);
      // 保持當前語言
      if (currentLocale && currentLocale !== defaultLocale) {
        homeUrl.pathname = `/${currentLocale}${routes.home}`;
      }
      return NextResponse.redirect(homeUrl);
    }
  }

  // 阻止訪問註冊頁面，重定向到登入頁面
  if (cleanPathname.startsWith("/register")) {
    const loginUrl = new URL(routes.login, request.url);
    if (currentLocale && currentLocale !== defaultLocale) {
      loginUrl.pathname = `/${currentLocale}${routes.login}`;
    }
    return NextResponse.redirect(loginUrl);
  }

  // 正常處理，添加自定義 headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// 配置匹配的路徑
export const config = {
  matcher: [
    // 匹配所有路徑，除了 API 路由和靜態資源
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
