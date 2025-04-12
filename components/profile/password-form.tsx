"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/context/auth-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
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
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// 密碼表單驗證模式
const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PasswordForm() {
  const { updatePassword, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 表單設置
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange", // Enable real-time validation as user types
  });

  // Check if form values have been modified
  const hasFormChanged = () => {
    const currentValues = form.getValues();
    return (
      currentValues.currentPassword !== "" ||
      currentValues.newPassword !== "" ||
      currentValues.confirmPassword !== ""
    );
  };

  // Reset form to empty values
  const handleReset = () => {
    form.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    toast({
      title: "Changes Reset",
      description: "Form has been reset",
      variant: "default",
    });
  };

  // 處理表單提交
  const onSubmit = async (data: PasswordFormValues) => {
    try {
      setIsSubmitting(true);

      // 使用 auth-context 的 updatePassword 方法
      await updatePassword(data.currentPassword, data.newPassword);

      toast({
        title: "Password Updated Successfully",
        description: "Your password has been successfully updated",
        variant: "success",
      });

      // 重置表單
      form.reset();
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the password",
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
          <Skeleton className="h-7 w-[150px] sm:w-[180px] mb-2" />
          <Skeleton className="h-5 w-[250px] sm:w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-[130px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-[180px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter className="p-4 sm:p-6">
          <Skeleton className="h-10 w-full sm:w-[150px] ml-auto" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Secure your account with a strong password
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Responsive password form layout */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        className={
                          form.formState.errors.currentPassword
                            ? "border-destructive focus-visible:ring-destructive pr-10"
                            : "pr-10"
                        }
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        tabIndex={-1}
                      >
                        <FontAwesomeIcon
                          icon={showCurrentPassword ? faEyeSlash : faEye}
                          className="h-4 w-4"
                        />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className={
                          form.formState.errors.newPassword
                            ? "border-destructive focus-visible:ring-destructive pr-10"
                            : "pr-10"
                        }
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                      >
                        <FontAwesomeIcon
                          icon={showNewPassword ? faEyeSlash : faEye}
                          className="h-4 w-4"
                        />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm New Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        className={
                          form.formState.errors.confirmPassword
                            ? "border-destructive focus-visible:ring-destructive pr-10"
                            : "pr-10"
                        }
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        tabIndex={-1}
                      >
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEyeSlash : faEye}
                          className="h-4 w-4"
                        />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
