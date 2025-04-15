"use client";

import React from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import routes from "@/lib/routes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/profile/profile-form";
import PasswordForm from "@/components/profile/password-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 顯示載入中狀態
  if (loading) {
    return (
      <div className="container px-4 mx-auto sm:px-6 py-6 sm:py-10">
        <div className="max-w-3xl mx-auto">
          {/* 用戶資訊卡片骨架 */}
          <Card className="mb-6">
            <CardContent className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 p-4 sm:p-6">
              <Skeleton className="h-16 w-16 rounded-full mb-3 sm:mb-0" />
              <div className="space-y-2 text-center sm:text-left">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </CardContent>
          </Card>

          {/* Tab 骨架 */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />

            {/* Tab content skeleton */}
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
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-muted-foreground">
              Manage your account information and password
            </p>
          </div>

          {/* 用戶資訊卡片 */}
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 p-4 sm:p-6 text-center sm:text-left">
              <Avatar className="h-16 w-16 mb-3 sm:mb-0">
                <AvatarFallback className="text-2xl font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.displayName || user.username}
                </h2>
                <p className="text-muted-foreground break-all">
                  {user.email}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 標籤頁 */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="text-xs sm:text-sm">
                Profile
              </TabsTrigger>
              <TabsTrigger value="password" className="text-xs sm:text-sm">
                Change Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4 sm:mt-6">
              <ProfileForm />
            </TabsContent>

            <TabsContent value="password" className="mt-4 sm:mt-6">
              <PasswordForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}