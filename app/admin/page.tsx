"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import routes from "@/lib/routes";

/**
 * 管理員根路由頁面
 * 自動重導向到管理員儀表板
 */
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    // 當用戶訪問 /admin 時，自動重導向到 /admin/dashboard
    router.replace(routes.adminDashboard);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to Admin Dashboard...</p>
      </div>
    </div>
  );
}
