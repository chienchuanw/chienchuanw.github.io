"use client";

import React, { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const { toast } = useToast();
  const [showTestToast, setShowTestToast] = useState(false);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 md:p-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />

        {/* Toast 測試按鈕 */}
        {showTestToast && (
          <div className="mt-8 flex flex-col gap-2">
            <p className="text-center text-sm text-gray-500">測試 Toast 通知</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "預設通知",
                    description: "這是一個預設樣式的通知",
                  });
                }}
              >
                <FontAwesomeIcon icon={faBell} className="mr-2" />
                預設
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "成功通知",
                    description: "這是一個成功樣式的通知",
                    variant: "success",
                  });
                }}
              >
                <FontAwesomeIcon icon={faBell} className="mr-2" />
                成功
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "錯誤通知",
                    description: "這是一個錯誤樣式的通知",
                    variant: "destructive",
                  });
                }}
              >
                <FontAwesomeIcon icon={faBell} className="mr-2" />
                錯誤
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={() => setShowTestToast(!showTestToast)}
          >
            {showTestToast ? "隱藏測試按鈕" : "顯示測試按鈕"}
          </button>
        </div>
      </div>
    </div>
  );
}
