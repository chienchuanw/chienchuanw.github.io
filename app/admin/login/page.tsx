'use client';
// 從特定路徑開始所有路徑導航

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
// Toaster 已在 layout 中引入
import { checkAuthStatus } from '@/lib/auth/auth-utils';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 如果已經認證，重定向到儀表板
    if (checkAuthStatus()) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">管理員後台</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            請使用您的管理員憑證登入
          </p>
        </div>
        
        <LoginForm />
      </div>
      {/* Toaster 已在 layout 中引入 */}
    </div>
  );
}
