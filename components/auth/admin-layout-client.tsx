'use client';

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 使用 JavaScript 直接隱藏導航元素
    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
      navContainer.style.display = 'none';
    }
    
    // 組件卸載時清理，雖然無需，但為了完整性而添加
    return () => {
      if (navContainer) {
        navContainer.style.display = '';
      }
    };
  }, []);

  return (
    <>
      <div className="admin-page">
        {children}
      </div>
      <Toaster />
    </>
  );
}
