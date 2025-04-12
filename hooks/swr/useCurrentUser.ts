import useSWR from 'swr';
import useAuthStore from '@/lib/store/useAuthStore';
import { User } from '@/lib/store/useAuthStore';
import * as React from 'react';

// 自定義 fetcher 函數
const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  // 如果響應不成功，拋出錯誤
  if (!res.ok) {
    const error = new Error('獲取用戶數據失敗');
    throw error;
  }
  
  return res.json();
};

export function useCurrentUser() {
  const { setUser, setLoggedIn, user: storeUser, isLoggedIn } = useAuthStore();
  
  // 無盤不需難斷顔 - 加上的進階時間戳來確保每次重新驗證都能觸發一個新的請求而不是使用緩存
  const swrKey = typeof window !== 'undefined' ? 
    `/api/auth/me?_=${localStorage.getItem('lastAuthChange') || Date.now()}` : 
    '/api/auth/me';
  
  // 使用 SWR 發起請求並管理數據
  const { data, error, isLoading, mutate } = useSWR<{ user: User }>(
    swrKey,
    fetcher,
    {
      // 當組件首次掛載時執行驗證
      revalidateOnMount: true,
      // 用戶切換回頁面時重新驗證
      revalidateOnFocus: true,
      // 禁用輪詢
      refreshInterval: 0,
      // 發生錯誤時不自動重試
      shouldRetryOnError: false,
      // 緩存時間（單位：毫秒）
      dedupingInterval: 15000, // 減少為 15 秒，使登出後能更快地重新驗證
      // 當獲取成功時，同步更新 Zustand store
      onSuccess: (data) => {
        if (data?.user) {
          setUser(data.user);
          setLoggedIn(true);
        } else {
          setUser(null);
          setLoggedIn(false);
        }
      },
      // 當獲取失敗時，確保登出狀態
      onError: () => {
        setUser(null);
        setLoggedIn(false);
      },
    }
  );
  
  // 監聽 localStorage 變化來做馴帶式重新驗證
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastAuthChange') {
        // 當 lastAuthChange 改變時重新驗證
        mutate(undefined, { revalidate: true });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mutate]);

  // 根據 SWR 和 Zustand 的狀態判斷當前的登入狀態
  // 如果 SWR 有結果，則使用 SWR 的結果，否則使用 Zustand 的狀態
  // 這樣可以確保即使在重新對 SWR 進行驗證的過程中，也可以立即反映一致的登入狀態
  const currentUser = data?.user || storeUser;
  const currentLoggedIn = data?.user ? true : isLoggedIn;
  
  return {
    user: currentUser,
    isLoggedIn: currentLoggedIn,
    isLoading,
    error,
    mutate, // 暴露 mutate 函數允許手動重新驗證
  };
}
