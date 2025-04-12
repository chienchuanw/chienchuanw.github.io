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
import { toast } from "@/components/ui/use-toast";

// 表單驗證模式
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "用戶名至少需要3個字符")
    .max(50, "用戶名不能超過50個字符"),
  email: z.string().email("請輸入有效的電子郵件地址"),
  fullName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, updateProfile } = useAuth();
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
        title: "更新成功",
        description: "您的個人資料已成功更新",
      });
    } catch (error) {
      toast({
        title: "更新失敗",
        description:
          error instanceof Error ? error.message : "更新個人資料時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">您尚未登入</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 用戶名 (唯讀) */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>用戶名 (唯讀)</FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder="用戶名" />
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
                <FormLabel>電子郵件</FormLabel>
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
                <FormLabel>姓名 (選填)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="您的姓名" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 上次登入時間 (唯讀) */}
          {lastLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                最近一次登入時間 (唯讀)
              </label>
              <Input value={lastLogin} disabled placeholder="未知" />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "儲存中..." : "儲存變更"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
