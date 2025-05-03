import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定義用戶類型
export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  role: string;
  isActive: boolean;
}

// 定義授權狀態
interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  // 操作方法
  setUser: (user: User | null) => void;
  setLoggedIn: (status: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // 登出方法
  logout: () => Promise<void>;
}

// 創建 Zustand store
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setLoggedIn: (status) => set({ isLoggedIn: status }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      logout: async () => {
        try {
          set({ isLoading: true });
          const response = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            set({
              user: null,
              isLoggedIn: false,
              error: null,
            });
          } else {
            const data = await response.json();
            set({ error: data.error || "登出失敗" });
          }
        } catch {
          set({ error: "登出時發生錯誤" });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // localStorage 中的 key 名稱
      partialize: (state) => ({
        // 只保存這些狀態到 localStorage
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;
