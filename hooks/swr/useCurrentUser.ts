import useSWR from 'swr';
import useAuthStore from '@/lib/store/useAuthStore';
import { User } from '@/lib/store/useAuthStore';

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
  
  // 使用 SWR 發起請求並管理數據
  const { data, error, isLoading, mutate } = useSWR<{ user: User }>(
    '/api/auth/me',
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
      dedupingInterval: 60000, // 1分鐘
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

  return {
    user: data?.user || storeUser,
    isLoggedIn: data?.user ? true : isLoggedIn,
    isLoading,
    error,
    mutate, // 暴露 mutate 函數允許手動重新驗證
  };
}
