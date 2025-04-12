import useSWR from "swr";
import useBlogStore from "@/lib/store/useBlogStore";
import { Post } from "@/lib/store/useBlogStore";

// 自定義 fetcher 函數
const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("獲取文章失敗");
    throw error;
  }

  return res.json();
};

export function usePosts(page = 1, limit = 10) {
  const { setPosts, setLoading, setError } = useBlogStore();

  // 使用 SWR 發起請求並管理數據
  const { data, error, isLoading, mutate } = useSWR<{
    posts: Post[];
    total: number;
  }>(`/api/posts?page=${page}&limit=${limit}`, fetcher, {
    // 增加緩存時間，減少請求次數
    dedupingInterval: 60000, // 60 秒內不重複請求
    revalidateOnFocus: false, // 禁用窗口聚焦時重新驗證

    // 當獲取成功時，同步更新 Zustand store
    onSuccess: (data) => {
      if (data?.posts) {
        setPosts(data.posts);
      }
      setLoading(false);
    },
    // 當獲取失敗時，更新錯誤狀態
    onError: (err) => {
      setError(err.message);
      setLoading(false);
    },
    // 開始獲取時，設置加載狀態
    onLoadingSlow: () => {
      setLoading(true);
    },
  });

  return {
    posts: data?.posts || [],
    totalPosts: data?.total || 0,
    isLoading,
    error,
    mutate, // 暴露 mutate 函數允許手動重新獲取
  };
}

export function usePost(slug: string) {
  const { selectPost, setLoading, setError } = useBlogStore();

  // 使用 SWR 發起請求並管理數據
  const { data, error, isLoading, mutate } = useSWR<{ post: Post }>(
    slug ? `/api/posts/${slug}` : null,
    fetcher,
    {
      // 增加緩存時間，減少請求次數
      dedupingInterval: 60000, // 60 秒內不重複請求
      revalidateOnFocus: false, // 禁用窗口聚焦時重新驗證

      // 當獲取成功時，同步更新 Zustand store
      onSuccess: (data) => {
        if (data?.post) {
          selectPost(data.post);
        }
        setLoading(false);
      },
      // 當獲取失敗時，更新錯誤狀態
      onError: (err) => {
        setError(err.message);
        setLoading(false);
      },
      // 開始獲取時，設置加載狀態
      onLoadingSlow: () => {
        setLoading(true);
      },
    }
  );

  return {
    post: data?.post,
    isLoading,
    error,
    mutate,
  };
}
