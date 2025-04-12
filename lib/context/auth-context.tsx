"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@/components/ui/use-toast";

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
  register: (userData: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { email: string; fullName?: string }) => Promise<User>;
}

// 創建認證上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 組件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 獲取當前用戶
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
      // 保存登入時間到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastLoginTime', Date.now().toString());
      }
        } else {
          // 如果沒有登入或會話已過期則返回 null
          setUser(null);
        }
      } catch (err) {
        console.error("獲取當前用戶時出錯:", err);
        setError("無法獲取用戶數據");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // 登入函數
  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    console.log('嘗試登入，識別碼:', identifier);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      console.log('登入響應狀態:', response.status);
      const data = await response.json();
      console.log('登入響應數據:', data);

      if (!response.ok) {
        throw new Error(data.error || "登入失敗");
      }

      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登入過程中發生錯誤");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 註冊函數 (已停用)
  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) => {
    setLoading(false);
    setError("註冊功能已被停用，請聯絡管理員創建帳戶");
    throw new Error("註冊功能已被停用，請聯絡管理員創建帳戶");
  };

  // 登出函數
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "登出失敗");
      }

      // 清除用戶狀態
      setUser(null);
      
      // 登出成功通知
      toast({
        title: "登出成功",
        description: "您已安全登出",
        variant: "success",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "登出過程中發生錯誤";
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
      const response = await fetch("/api/auth/update-profile", {
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
      setError(err instanceof Error ? err.message : "更新個人資料過程中發生錯誤");
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
        register,
        logout,
        updateProfile,
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
