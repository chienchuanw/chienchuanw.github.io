"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { checkAuthStatus } from "@/lib/auth/auth-utils";
import routes from "@/lib/routes";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  // 使用客戶端對 hydration 進行處理
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // 標記客戶端已掛載
    setIsMounted(true);

    // 使用 JavaScript 直接隱藏導航元素
    const navContainer = document.getElementById("nav-container");
    if (navContainer) {
      navContainer.style.display = "none";
    }

    // 檢查用戶是否為管理員且已登入
    if (!user || user.role !== "admin" || !checkAuthStatus()) {
      // 如果不是管理員或未登入，重定向到登入頁面
      router.push(routes.login);
    }

    // 組件卸載時清理
    return () => {
      if (navContainer) {
        navContainer.style.display = "";
      }
    };
  }, [router, user]);

  // 初始渲染時不顯示任何特定樣式，避免 hydration 不匹配
  return (
    <>
      <div className={isMounted ? "admin-page" : ""}>{children}</div>
    </>
  );
}
