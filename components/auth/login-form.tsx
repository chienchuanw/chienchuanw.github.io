"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useTranslations, useLocale } from 'next-intl';

type LoginFormValues = {
  identifier: string;
  password: string;
};

export function LoginForm() {
  const t = useTranslations('auth.login');
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 表單驗證模式 - 使用翻譯的錯誤訊息
  const loginSchema = z.object({
    identifier: z.string().min(1, t('identifierRequired')),
    password: z.string().min(6, t('passwordMinLength')),
  });

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

      // 使用 auth-context 中的 login 函數進行登入
      // 這會自動更新 Zustand 狀態並顯示成功的 toast
      await login(data.identifier, data.password);

      // 登入成功後，使用 Next.js 路由器進行導航
      // 不需要重新整理頁面，提供更流暢的用戶體驗
      router.push(`/${locale}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t('error');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('subtitle')}
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
            {t('identifier')}
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="identifier"
            placeholder={t('identifierPlaceholder')}
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
              {t('password')}
            </label>
            <a className="text-sm text-blue-500 hover:text-blue-700" href="#">
              {t('forgotPassword')}
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
          {isLoading ? t('loggingIn') : t('loginButton')}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-500">
        {t('noAccount')}
      </div>
    </div>
  );
}
