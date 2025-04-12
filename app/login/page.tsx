"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { checkAuthStatus } from "@/lib/auth/auth-utils";
import { useAuth } from "@/lib/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // 如果是管理員且已經認證，重定向到儀表板
    if (user?.role === "admin" && checkAuthStatus()) {
      router.push("/admin/dashboard");
    }
  }, [router, user]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 md:p-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  );
}
