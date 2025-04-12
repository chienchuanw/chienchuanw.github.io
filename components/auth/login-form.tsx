"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import routes from "@/lib/routes";

// 表單驗證模式
const loginSchema = z.object({
  identifier: z.string().min(1, "請輸入電子郵件或用戶名"),
  password: z.string().min(6, "密碼至少需要6個字符"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      await login(data.identifier, data.password);

      // 取得用戶信息
      const response = await fetch("/api/auth/me");
      const userData = await response.json();

      if (response.ok && userData?.user) {
        // 根據用戶角色選擇重定向目標
        if (userData.user.role === 'admin') {
          // 管理員導向到儀表板
          router.push('/admin/dashboard');
        } else {
          // 普通用戶導向到首頁
          router.push(routes.home);
        }
        router.refresh();
      } else {
        // 預設導向到首頁
        router.push(routes.home);
        router.refresh();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "登入失敗，請稍後再試";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">登入</h1>
        <p className="text-gray-500 dark:text-gray-400">
          輸入您的信息以登入您的帳戶
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="identifier"
          >
            電子郵件或用戶名
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="identifier"
            placeholder="name@example.com 或 username"
            type="text"
            disabled={isLoading}
            {...register("identifier")}
          />
          {errors.identifier && (
            <p className="text-sm text-red-500">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="password"
            >
              密碼
            </label>
            <a
              className="text-sm text-blue-500 hover:text-blue-700"
              href="/forgot-password"
            >
              忘記密碼?
            </a>
          </div>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="password"
            type="password"
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "登入中..." : "登入"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-500">
        需要帳戶? 請與管理員聯絡以創建新帳戶。
      </div>
    </div>
  );
}
