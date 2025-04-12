"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { logout } from "@/lib/auth/auth-utils";
import routes from "@/lib/routes";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      logout();
      // 不需要 await，因為 logout 函數不返回 Promise

      // 使用 window.location 而不是 router.push
      // 這會強制頁面完全重新加載，避免狀態不一致的問題
      window.location.href = routes.home;
    } catch (error) {
      console.error("登出錯誤:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">管理員後台</h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "登出中..." : "登出"}
        </Button>
      </header>

      <main className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>文章管理</CardTitle>
            <CardDescription>管理博客文章的發布、編輯和刪除</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push(routes.adminPosts)}
            >
              進入文章管理
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>評論管理</CardTitle>
            <CardDescription>審核和管理用戶評論</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">進入評論管理</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>網站設置</CardTitle>
            <CardDescription>管理網站的全局設置和偏好</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">進入網站設置</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
