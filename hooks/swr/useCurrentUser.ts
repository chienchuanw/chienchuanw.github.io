import useSWR from "swr";
import useAuthStore from "@/lib/store/useAuthStore";
import { User } from "@/lib/store/useAuthStore";
import * as React from "react";
import routes from "@/lib/routes";

// 自定義 fetcher 函數
const fetcher = async (url: string) => {
  const res = await fetch(url);

  // 如果是 401 錯誤，表示未登入，我們可以静默處理
  if (res.status === 401) {
    // 返回空的用戶數據，而不是拋出錯誤
    return { user: null };
  }

  // 其他錯誤仍然拋出
  if (!res.ok) {
    const error = new Error("獲取用戶數據失敗");
    throw error;
  }

  return res.json();
};

export function useCurrentUser() {
  const { setUser, setLoggedIn, user: storeUser, isLoggedIn } = useAuthStore();

  // 使用固定的 SWR 鍵值，避免過多的請求
  // 只在需要重新驗證時才使用 mutate 函數
  const swrKey = routes.apiAuthMe;

  // 檢查是否已登入，如果已知未登入，則不發起請求
  // 這會減少不必要的 401 請求
  const shouldFetch =
    typeof window !== "undefined" &&
    (isLoggedIn || localStorage.getItem("auth-storage") !== null);

  // 使用 SWR 發起請求並管理數據
  const { data, error, isLoading, mutate } = useSWR<{ user: User }>(
    // 只在應該發起請求時才提供 URL，否則返回 null 以避免請求
    shouldFetch ? swrKey : null,
    fetcher,
    {
      // 當組件首次掛載時執行驗證，但只在可能已登入時
      revalidateOnMount: shouldFetch,
      // 用戶切換回頁面時重新驗證，但限制频率
      revalidateOnFocus: shouldFetch,
      focusThrottleInterval: 30000, // 增加為 30 秒，進一步減少請求
      // 禁用輪詢
      refreshInterval: 0,
      // 發生錯誤時不自動重試
      shouldRetryOnError: false,
      // 緩存時間（單位：毫秒）
      dedupingInterval: 60000, // 增加為 60 秒，進一步減少請求次數
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
      // 注意：由於我們在 fetcher 中已經處理了 401 錯誤，
      // 所以這裡只會處理其他錯誤
      onError: (err) => {
        console.error("獲取用戶數據錯誤:", err);
        setUser(null);
        setLoggedIn(false);
      },
    }
  );

  // 監聽 Zustand auth store 的變化
  React.useEffect(() => {
    // 創建一個訂閱函數，當 auth store 登出時重新驗證
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      // 當登入狀態從 true 變為 false 時，重新驗證
      if (prevState.isLoggedIn && !state.isLoggedIn) {
        // 立即重新驗證，不等待下一個渲染周期
        mutate(undefined, { revalidate: true });
      }
      // 當登入狀態從 false 變為 true 時，也重新驗證
      if (!prevState.isLoggedIn && state.isLoggedIn) {
        mutate(undefined, { revalidate: true });
      }
    });

    return () => {
      unsubscribe();
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
