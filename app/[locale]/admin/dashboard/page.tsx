"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth-context";

export default function AdminDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('admin.dashboard');
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // 使用 auth-context 的 logout 函數
      await logout();

      // 登出成功後重定向到首頁
      router.push(`/${locale}`);
    } catch (error) {
      console.error("登出錯誤:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col p-4 md:p-8">
      <header className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? t('loggingOut') : t('logout')}
        </Button>
      </header>

      <main className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('postsManagement')}</CardTitle>
            <CardDescription>{t('postsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push(`/${locale}/admin/posts`)}
            >
              {t('enterPostsManagement')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('commentsManagement')}</CardTitle>
            <CardDescription>{t('commentsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">{t('enterCommentsManagement')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('siteSettings')}</CardTitle>
            <CardDescription>{t('siteSettingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">{t('enterSiteSettings')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('contactSettings')}</CardTitle>
            <CardDescription>{t('contactSettingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push(`/${locale}/admin/contact-settings`)}
            >
              {t('enterContactSettings')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile')}</CardTitle>
            <CardDescription>{t('profileDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push(`/${locale}/admin/profile`)}
            >
              {t('enterProfile')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
