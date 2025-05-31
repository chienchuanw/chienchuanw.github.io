import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import "../globals.css";
import Navbar from "@/components/shared/Navbar";
import { AuthProvider } from "@/lib/context/auth-context";
import { Providers } from "../providers";
import { Toaster } from "@/components/ui/toaster";
import { locales, getLocaleDirection, type Locale } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: "chienchuanw",
  description: "My personal website",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  // 等待 params
  const { locale } = await params;

  // 驗證語言代碼是否有效
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // 獲取對應語言的訊息
  const messages = await getMessages();

  return (
    <html lang={locale} dir={getLocaleDirection(locale as Locale)}>
      <body className="min-h-screen bg-background font-sans antialiased root-body">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AuthProvider>
              <div id="nav-container">
                <Navbar />
              </div>
              <main className="max-w-screen-xl mx-auto px-4 mt-16">
                {children}
              </main>
              <Toaster />
            </AuthProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// 生成靜態參數
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
