"use client";

import React, { useState } from "react";
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

// 密碼表單驗證模式
const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "密碼至少需要6個字符"),
    newPassword: z.string().min(6, "密碼至少需要6個字符"),
    confirmPassword: z.string().min(6, "密碼至少需要6個字符"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "新密碼與確認密碼不匹配",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PasswordForm() {
  const { updatePassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表單設置
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // 處理表單提交
  const onSubmit = async (data: PasswordFormValues) => {
    try {
      setIsSubmitting(true);

      // 使用 auth-context 的 updatePassword 方法
      await updatePassword(data.currentPassword, data.newPassword);

      toast({
        title: "密碼更新成功",
        description: "您的密碼已成功更新",
        variant: "success",
      });

      // 重置表單
      form.reset();
    } catch (error) {
      toast({
        title: "更新失敗",
        description:
          error instanceof Error ? error.message : "更新密碼時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 當前密碼 */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>當前密碼</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="輸入當前密碼"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 新密碼 */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新密碼</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="輸入新密碼" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 確認新密碼 */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>確認新密碼</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="再次輸入新密碼"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "更新中..." : "更新密碼"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
