"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import routes from "@/lib/routes";

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

      // 強制刷新頁面以確保狀態更新
      router.refresh();
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  const [lastLogin, setLastLogin] = useState<string | null>(null);

  // 從 localStorage 獲取上次登入時間
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastLoginTimestamp = localStorage.getItem("lastLoginTime");
      if (lastLoginTimestamp) {
        const date = new Date(parseInt(lastLoginTimestamp));
        setLastLogin(date.toLocaleString());
      }
    }
  }, []);

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
        <h1 className="text-3xl font-bold mb-6">用戶資料</h1>

        {user ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
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

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="font-medium mb-2">帳戶信息</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">
                      用戶名
                    </dt>
                    <dd className="mt-1">{user.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">
                      電子郵件
                    </dt>
                    <dd className="mt-1">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">
                      姓名
                    </dt>
                    <dd className="mt-1">{user.fullName || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">
                      角色
                    </dt>
                    <dd className="mt-1">{user.role}</dd>
                  </div>
                  {lastLogin && (
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">
                        最近一次登入時間
                      </dt>
                      <dd className="mt-1">{lastLogin}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => router.push(routes.profileEdit)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg mb-4">您尚未登入</p>
            {/* 移除前往登入按鈕 */}
          </div>
        )}
      </div>
    </div>
  );
}
