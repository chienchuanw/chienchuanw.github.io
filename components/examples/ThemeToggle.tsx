'use client';

import React, { useEffect } from 'react';
import useUIStore from '@/lib/store/useUIStore';
import { Button } from '@/components/ui/button';
import { SunIcon, MoonIcon } from 'lucide-react';

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useUIStore();

  // 監聽主題變更並應用到 HTML 元素
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    // 保存用戶偏好到 localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  // 初始化主題（檢查系統偏好）
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // 如果用戶有保存的偏好，使用它
    // 否則，使用系統偏好
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      useUIStore.getState().setDarkMode(true);
    }
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? '切換到亮色模式' : '切換到暗色模式'}
    >
      {isDarkMode ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </Button>
  );
}
