"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import routes from "@/lib/routes";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到新的聯絡頁面設定路徑
    router.replace(routes.adminContactSettings);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to Contact Settings...</p>
    </div>
  );
}