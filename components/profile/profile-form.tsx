"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/context/auth-context";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

// 表單驗證模式
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, updateProfile, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  // 表單設置
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
    },
  });

  // 當用戶數據載入時，設置表單預設值
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
      });

      // 嘗試從 localStorage 獲取上次登入時間
      const lastLoginTimestamp = localStorage.getItem("lastLoginTime");
      if (lastLoginTimestamp) {
        const date = new Date(parseInt(lastLoginTimestamp));
        setLastLogin(date.toLocaleString());
      }
    }
  }, [user, form]);

  // 處理表單提交
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);

      // 只允許更新電子郵件和姓名
      const updateData = {
        email: data.email,
        fullName: data.fullName,
      };

      // 使用 auth-context 的 updateProfile 方法
      await updateProfile(updateData);

      toast({
        title: "Update Successful",
        description: "Your profile has been successfully updated",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show skeleton UI while loading
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-[250px] mb-2" />
          <Skeleton className="h-5 w-[350px]" />
        </CardHeader>
        <CardContent className="space-y-6">
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
        <CardFooter>
          <Skeleton className="h-10 w-[120px] ml-auto" />
        </CardFooter>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="text-center py-12">
        <CardContent className="pt-6">
          <p className="text-lg mb-4">You are not logged in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your profile and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 使用 Card 和其他 shadcn/ui 元件更改表單外觀 */}
        {/* 使用結構化的 Card 組件來呈現表單，增加視覺層次和專業感 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 用戶名 (唯讀) */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username (Read-only)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      placeholder="Username"
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 電子郵件 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="your@email.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 姓名 (選填) */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 上次登入時間 (唯讀) */}
            {lastLogin && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Last Login Time (Read-only)
                </Label>
                <Input
                  value={lastLogin}
                  disabled
                  placeholder="Unknown"
                  className="bg-muted"
                />
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
