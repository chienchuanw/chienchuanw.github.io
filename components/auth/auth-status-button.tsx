"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useLocale } from 'next-intl';

export function AuthStatusButton() {
  const { user, loading } = useAuth();
  const locale = useLocale();
  const router = useRouter();

  if (loading) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => router.push(user ? `/${locale}/profile` : `/${locale}/login`)}
        className="flex items-center justify-center h-12 px-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
      >
        <div className="w-3 h-3 rounded-full mr-2 bg-green-400 animate-pulse"></div>
        {user ? "已登入" : "未登入"}
      </button>
    </div>
  );
}
