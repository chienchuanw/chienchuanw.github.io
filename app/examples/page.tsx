"use client";

import React, { useEffect, useState } from "react";

// 強制動態渲染，避免靜態生成問題
export const dynamic = 'force-dynamic';

import { AuthExample } from "@/components/examples/AuthExample";
import { BlogPostsExample } from "@/components/examples/BlogPostsExample";
import { ThemeToggle } from "@/components/examples/ThemeToggle";
import useUIStore from "@/lib/store/useUIStore";

export default function ExamplesPage() {
  const [mounted, setMounted] = useState(false);
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const toasts = useUIStore((state) => state.toasts);
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  // 確保組件只在客戶端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToast = (type: "success" | "error" | "info" | "warning") => {
    const messages = {
      success: "Operation successful!",
      error: "An error occurred!",
      info: "This is an information message",
      warning: "Attention! This is a warning",
    };

    addToast(messages[type], type);
  };

  return (
    <div className={`p-6 ${isDarkMode ? "dark" : ""}`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Zustand + SWR Examples
          </h1>
          <ThemeToggle />
        </header>

        <div className="grid gap-8">
          {/* 通知示例 */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Notification System (Zustand)
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleAddToast("success")}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Success Notification
              </button>
              <button
                onClick={() => handleAddToast("error")}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Error Notification
              </button>
              <button
                onClick={() => handleAddToast("info")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Info Notification
              </button>
              <button
                onClick={() => handleAddToast("warning")}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Warning Notification
              </button>
            </div>

            {/* Display all notifications */}
            {toasts.length > 0 && (
              <div className="space-y-2">
                {toasts.map((toast) => (
                  <div
                    key={toast.id}
                    className={`p-3 rounded-md flex justify-between items-start ${
                      toast.type === "success"
                        ? "bg-green-100 text-green-800"
                        : toast.type === "error"
                        ? "bg-red-100 text-red-800"
                        : toast.type === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <span>{toast.message}</span>
                    <button
                      onClick={() => removeToast(toast.id)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Authentication example */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              User Authentication (Zustand + SWR)
            </h2>
            <AuthExample />
          </section>

          {/* Blog posts example */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Blog Posts (Zustand + SWR)
            </h2>
            <BlogPostsExample />
          </section>
        </div>
      </div>
    </div>
  );
}
