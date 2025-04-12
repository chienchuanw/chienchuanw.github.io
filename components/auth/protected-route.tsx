"use client";

import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import routes from "@/lib/routes";
import useAuthStore from "@/lib/store/useAuthStore";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasShownToast, setHasShownToast] = useState(false);

  // 使用 Zustand 的身份驗證狀態
  useEffect(() => {
    // 設置身份驗證狀態
    setIsAuthenticated(isLoggedIn);

    // 只在未登入且尚未顯示過 toast 時顯示提示
    if (!isLoggedIn && !hasShownToast) {
      toast({
        title: "需要登入",
        description: "您需要先登入才能訪問此頁面。",
        variant: "destructive",
      });

      setHasShownToast(true);

      // 重定向到登入頁面
      router.push(routes.login);
    }

    // 添加類名以隱藏導航元素
    document.body.classList.add("admin-route");

    return () => {
      // 清理工作
      document.body.classList.remove("admin-route");
    };
  }, [router, toast, isLoggedIn, hasShownToast]);

  // 初始渲染時返回 null，避免 hydration 不匹配
  if (isAuthenticated === null) {
    return null;
  }

  // 僅在已認證時渲染子元件
  return <>{isAuthenticated ? children : null}</>;
}
