import useSWR from "swr";
import routes from "@/lib/routes";

// 聯絡資訊類型定義
interface ContactInfo {
  id: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  github?: string;
  linkedin?: string;
  skills: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 自定義 fetcher 函數
const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    // 如果獲取失敗，返回 null 而不是拋出錯誤
    return { contactInfo: null };
  }

  return res.json();
};

/**
 * 獲取聯絡資訊的 SWR Hook
 * 用於在各個組件中獲取聯絡頁面資訊，包含頭像 URL
 */
export function useContactInfo() {
  // 使用 SWR 發起請求並管理數據
  const { data, error, isLoading, mutate } = useSWR<{ contactInfo: ContactInfo | null }>(
    routes.apiContact,
    fetcher,
    {
      // 增加緩存時間，減少請求次數
      dedupingInterval: 300000, // 5 分鐘內不重複請求（聯絡資訊變更頻率較低）
      revalidateOnFocus: false, // 禁用窗口聚焦時重新驗證
      revalidateOnReconnect: false, // 禁用重新連線時驗證
      // 發生錯誤時不自動重試
      shouldRetryOnError: false,
      // 當組件首次掛載時執行驗證
      revalidateOnMount: true,
    }
  );

  return {
    contactInfo: data?.contactInfo || null,
    isLoading,
    error,
    mutate, // 暴露 mutate 函數允許手動重新驗證
  };
}

// 導出類型供其他組件使用
export type { ContactInfo };
