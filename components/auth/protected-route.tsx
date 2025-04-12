"use client";

import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthStatus } from "@/lib/auth/auth-utils";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 使用客戶端對 hydration 進行處理
  useEffect(() => {
    // 檢查是否已認證
    const authStatus = checkAuthStatus();
    setIsAuthenticated(authStatus);

    if (!authStatus) {
      toast({
        title: "需要登入",
        description: "您需要先登入才能訪問此頁面。",
        variant: "destructive",
      });

      // 重定向到登入頁面
      router.push("/login");
    }

    // 添加類名以隱藏導航元素
    document.body.classList.add("admin-route");

    return () => {
      // 清理工作
      document.body.classList.remove("admin-route");
    };
  }, [router, toast]);

  // 初始渲染時返回 null，避免 hydration 不匹配
  if (isAuthenticated === null) {
    return null;
  }

  // 僅在已認證時渲染子元件
  return <>{isAuthenticated ? children : null}</>;
}
