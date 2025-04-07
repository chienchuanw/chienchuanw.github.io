'use client';

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // 使用客戶端對 hydration 進行處理
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // 標記客戶端已掛載
    setIsMounted(true);
    
    // 使用 JavaScript 直接隱藏導航元素
    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
      navContainer.style.display = 'none';
    }
    
    // 組件卸載時清理
    return () => {
      if (navContainer) {
        navContainer.style.display = '';
      }
    };
  }, []);

  // 初始渲染時不顯示任何特定樣式，避免 hydration 不匹配
  return (
    <>
      <div className={isMounted ? "admin-page" : ""}>
        {children}
      </div>
      <Toaster />
    </>
  );
}
