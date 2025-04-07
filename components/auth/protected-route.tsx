'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthStatus } from '@/lib/auth/auth-utils';
import { useToast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // 檢查是否已認證
    if (!checkAuthStatus()) {
      toast({
        title: "需要登入",
        description: "您需要先登入才能訪問此頁面。",
        variant: "destructive",
      });
      
      // 重定向到登入頁面
      // 使用 Next.js 路由
      router.push('/admin/login');
    }
  }, [router, toast]);

  // 僅在已認證時渲染子元件
  return <>{checkAuthStatus() ? children : null}</>;
}
