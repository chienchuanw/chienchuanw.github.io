"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import routes from "@/lib/routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ContactForm from "@/components/contact/contact-form";

export default function AdminContactSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 顯示載入中狀態
  if (loading) {
    return (
      <div className="container px-4 mx-auto sm:px-6 py-6 sm:py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-7 w-[200px] sm:w-[250px] mb-2" />
              <Skeleton className="h-5 w-[280px] sm:w-[350px]" />
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-[180px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 如果未登入，顯示提示並提供登入按鈕
  if (!user) {
    return (
      <div className="container px-4 mx-auto sm:px-6 py-6 sm:py-10">
        <div className="max-w-3xl mx-auto">
          <Card className="text-center py-8 sm:py-12">
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-lg mb-4">You are not logged in</p>
              <Button onClick={() => router.push(routes.login)}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto sm:px-6 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* 頁面標題 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Contact Page Settings</h1>
            <p className="text-muted-foreground">
              Manage the information displayed on your contact page
            </p>
          </div>

          {/* 聯絡頁面設定表單 */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}