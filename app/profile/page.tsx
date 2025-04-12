"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import routes from "@/lib/routes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/profile-form";
import PasswordForm from "@/components/profile/password-form";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // 處理登出
  const handleLogout = async () => {
    try {
      // 使用 auth-context 的 logout 函數
      await logout();

      // 重定向到首頁
      router.push(routes.home);
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">用戶資料</h1>
          {user && (
            <Button 
              onClick={handleLogout}
              variant="destructive"
              size="sm"
            >
              登出
            </Button>
          )}
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.fullName || user.username}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">個人資料</TabsTrigger>
                <TabsTrigger value="password">修改密碼</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                <ProfileForm />
              </TabsContent>
              
              <TabsContent value="password" className="mt-6">
                <PasswordForm />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg mb-4">您尚未登入</p>
            <Button onClick={() => router.push(routes.login)}>
              前往登入
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
