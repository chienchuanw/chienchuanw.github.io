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
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">You are not logged in</p>
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
                <FormLabel>Username (Read-only)</FormLabel>
                <FormControl>
                  <Input {...field} disabled placeholder="Username" />
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
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Last Login Time (Read-only)
              </label>
              <Input value={lastLogin} disabled placeholder="Unknown" />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
