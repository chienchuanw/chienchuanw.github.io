"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@/components/ui/use-toast";
import useAuthStore from "@/lib/store/useAuthStore";
import routes from "@/lib/routes";

// 用戶類型定義
interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  role: string;
  isActive: boolean;
}

// 認證上下文類型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { email: string; fullName?: string }) => Promise<User>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// 創建認證上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 組件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 獲取 Zustand store 的狀態設定函數
  const setZustandUser = useAuthStore((state) => state.setUser);
  const setZustandLoggedIn = useAuthStore((state) => state.setLoggedIn);

  // 獲取當前用戶
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // 檢查是否有可能已登入，如果沒有登入記錄，則不發送請求
        const hasAuthStorage =
          typeof window !== "undefined" &&
          localStorage.getItem("auth-storage") !== null;

        // 如果沒有登入記錄，則直接設置為未登入狀態
        if (!hasAuthStorage) {
          setUser(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await fetch(routes.apiAuthMe);

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // 如果沒有登入或會話已過期則返回 null
          setUser(null);
        }
      } catch (err) {
        console.error("獲取當前用戶時出錯:", err);
        setError("無法獲取用戶數據");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // 當 user 狀態改變時，同步更新 Zustand 狀態
  useEffect(() => {
    setZustandUser(user);
    setZustandLoggedIn(!!user);
  }, [user, setZustandUser, setZustandLoggedIn]);

  // 登入函數
  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(routes.apiAuthLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "登入失敗");
      }

      setUser(data.user);

      // 登入成功通知
      toast({
        title: "登入成功",
        description: "歡迎回來！",
        variant: "success",
      });

      // 直接更新 Zustand 狀態以確保立即同步
      setZustandUser(data.user);
      setZustandLoggedIn(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "登入過程中發生錯誤";
      setError(errorMessage);

      // 登入失敗通知
      toast({
        title: "登入失敗",
        description: errorMessage,
        variant: "destructive",
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 登出函數
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(routes.apiAuthLogout, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "登出失敗");
      }

      // 清除用戶狀態
      setUser(null);

      // 直接更新 Zustand 狀態以確保立即同步
      // 這會觸發 Zustand 的訂閱事件，進而觸發所有使用 useAuthStore 的組件重新渲染
      setZustandUser(null);
      setZustandLoggedIn(false);

      // 登出成功通知
      toast({
        title: "登出成功",
        description: "您已安全登出",
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "登出過程中發生錯誤";
      setError(errorMessage);

      // 登出失敗通知
      toast({
        title: "登出失敗",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新個人資料
  const updateProfile = async (data: { email: string; fullName?: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(routes.apiAuthUpdateProfile, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "更新個人資料失敗");
      }

      setUser(result.user);
      return result.user;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "更新個人資料過程中發生錯誤"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新密碼
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(routes.apiAuthUpdatePassword, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "更新密碼失敗");
      }

      return;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "更新密碼過程中發生錯誤"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自定義 Hook 用於在組件中使用認證上下文
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth 必須在 AuthProvider 內部使用");
  }

  return context;
}
