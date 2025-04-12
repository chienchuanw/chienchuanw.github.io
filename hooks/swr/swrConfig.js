'use client';

import { SWRConfig as SWRConfigProvider } from 'swr';
import React from 'react';
import useUIStore from '@/lib/store/useUIStore';

// 調試中間件，僅用於開發環境
function middleware(useSWRNext) {
  return (key, fetcher, config) => {
    // 在開發環境中，添加日誌
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log('SWR Request:', key);
    }

    // 調用原始的 useSWR hook
    return useSWRNext(key, fetcher, config);
  };
}

// 全局 SWR 配置組件
export function SWRConfig({ children }) {
  const addToast = useUIStore((state) => state.addToast);

  // 全局默認 SWR 配置
  const defaultConfig = {
    // 全局 fetcher 配置
    fetcher: async (url) => {
      const res = await fetch(url);

      // 如果響應不成功，拋出錯誤
      if (!res.ok) {
        const error = new Error('請求失敗');
        const data = await res.json().catch(() => ({}));

        // 將 API 返回的錯誤訊息附加到錯誤對象上
        error.message = data.error || '請求失敗';
        throw error;
      }

      return res.json();
    },

    // 全局重試配置
    shouldRetryOnError: false,

    // 全局錯誤處理
    onError: (error) => {
      console.error('SWR 全局錯誤:', error);
    },

    // 開發環境啟用 SWR 調試
    ...(!process.env.NODE_ENV || process.env.NODE_ENV === 'development'
      ? {
        use: [middleware],
      }
      : {}),
  };

  // 創建自訂配置
  const customConfig = {
    ...defaultConfig,
    onError: (error) => {
      // 調用默認錯誤處理
      defaultConfig.onError(error);

      // 顯示錯誤通知
      addToast(error.message || '發生錯誤', 'error');
    },
  };

  return (
    <SWRConfigProvider value={customConfig}>
      {children}
    </SWRConfigProvider>
  );
}
