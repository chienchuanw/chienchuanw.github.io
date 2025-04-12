"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/swr/useCurrentUser";
import useAuthStore from "@/lib/store/useAuthStore";
import { Button } from "@/components/ui/button";
import routes from "@/lib/routes";

export function AuthExample() {
  const router = useRouter();
  const { user, isLoading, error, mutate } = useCurrentUser();
  const logout = useAuthStore((state) => state.logout);

  // 處理登出
  const handleLogout = async () => {
    await logout();
    // 登出後重新驗證用戶狀態
    mutate();
  };

  // 如果正在加載
  if (isLoading) {
    return (
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        載入用戶資料中...
      </div>
    );
  }

  // 如果發生錯誤
  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg text-red-800 dark:text-red-100">
        發生錯誤：{error.message}
      </div>
    );
  }

  // 如果用戶未登入
  if (!user) {
    return (
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <p>您尚未登入</p>
        <Button className="mt-2" onClick={() => router.push(routes.login)}>
          前往登入
        </Button>
      </div>
    );
  }

  // 如果用戶已登入
  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <h3 className="text-lg font-medium">已登入用戶</h3>
      <div className="mt-2">
        <p>用戶名：{user.username}</p>
        <p>電子郵件：{user.email}</p>
        <p>角色：{user.role}</p>
        {user.fullName && <p>全名：{user.fullName}</p>}
      </div>
      <Button variant="destructive" className="mt-4" onClick={handleLogout}>
        登出
      </Button>
    </div>
  );
}
