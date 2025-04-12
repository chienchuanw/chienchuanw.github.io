"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/context/auth-context";
import { formatTaiwanDate } from "@/lib/utils";
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
  displayName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, updateProfile, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [originalValues, setOriginalValues] =
    useState<ProfileFormValues | null>(null);

  // 表單設置
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      displayName: "",
    },
  });

  // 當用戶數據載入時，設置表單預設值
  useEffect(() => {
    if (user) {
      const initialValues = {
        username: user.username,
        email: user.email,
        displayName: user.displayName || "",
      };

      // Set form values
      form.reset(initialValues);

      // Store original values for reset functionality
      setOriginalValues(initialValues);

      // 嘗試從 localStorage 獲取上次登入時間
      const lastLoginTimestamp = localStorage.getItem("lastLoginTime");
      if (lastLoginTimestamp) {
        // Format the date in Taiwan timezone
        setLastLogin(formatTaiwanDate(parseInt(lastLoginTimestamp)));
      }
    }
  }, [user, form]);

  // Check if form values have been modified
  const hasFormChanged = () => {
    if (!originalValues) return false;

    const currentValues = form.getValues();
    return (
      currentValues.email !== originalValues.email ||
      currentValues.displayName !== originalValues.displayName
    );
  };

  // Reset form to original values
  const handleReset = () => {
    if (originalValues) {
      form.reset(originalValues);

      toast({
        title: "Changes Reset",
        description: "Form has been reset to original values",
        variant: "default",
      });
    }
  };

  // 處理表單提交
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);

      // 只允許更新電子郵件和姓名
      const updateData = {
        email: data.email,
        displayName: data.displayName,
      };

      // 使用 auth-context 的 updateProfile 方法
      await updateProfile(updateData);

      // Update original values after successful update
      setOriginalValues({
        ...originalValues!,
        email: data.email,
        displayName: data.displayName,
      });

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
        <CardFooter className="p-4 sm:p-6">
          <Skeleton className="h-10 w-full sm:w-[120px] ml-auto" />
        </CardFooter>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="text-center py-8 sm:py-12">
        <CardContent className="pt-4 sm:pt-6">
          <p className="text-lg mb-4">You are not logged in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your profile and preferences</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Responsive form layout */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Username (Read-only) */}
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

            {/* Email */}
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

            {/* Full Name (Optional) */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Login Time (Read-only) */}
            {lastLogin && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Last Login Time (Read-only)
                </Label>
                <Input
                  value={lastLogin}
                  disabled
                  placeholder="Unknown"
                  className="bg-muted text-sm overflow-x-auto"
                />
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4 sm:p-6">
        {hasFormChanged() && (
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        )}
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
