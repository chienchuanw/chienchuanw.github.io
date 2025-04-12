# 在 Next.js 中使用 Zustand + SWR 實現狀態管理

本文檔將指導你如何在 Next.js 應用程序中結合 Zustand 和 SWR 來實現高效的狀態管理。這種組合非常適合現代 React 應用程序，特別是那些使用 Next.js 的應用程序。

## 目錄

1. [為什麼選擇 Zustand + SWR](#為什麼選擇-zustand--swr)
2. [專案設置](#專案設置)
3. [Zustand 狀態管理](#zustand-狀態管理)
4. [SWR 數據獲取](#swr-數據獲取)
5. [結合 Zustand 和 SWR](#結合-zustand-和-swr)
6. [最佳實踐](#最佳實踐)
7. [範例](#範例)

## 為什麼選擇 Zustand + SWR

### Zustand 的優勢

- **簡潔的 API**：無需樣板代碼，API 簡單直觀
- **輕量級**：體積小，僅有 ~1KB (壓縮後)
- **無需 Provider**：無需在組件樹外包裹 Provider
- **性能優化**：內置中間件系統和優化的重新渲染機制
- **TypeScript 支持**：完全類型安全

### SWR 的優勢

- **自動重新獲取**：當用戶窗口重新獲得焦點時自動刷新數據
- **間隔輪詢**：可設定間隔時間自動獲取最新數據
- **依賴獲取**：數據之間可以建立依賴關係
- **滾動位置恢復**：自動保持 UI 的滾動位置
- **反饋 UI**：在請求完成前自動顯示加載和錯誤狀態

### 結合使用的好處

- Zustand 用於管理客戶端狀態 (UI 狀態、表單狀態等)
- SWR 用於管理服務器狀態 (API 數據獲取和緩存)
- 兩者結合提供了一個完整的狀態管理解決方案，同時保持代碼簡潔和性能優秀

## 專案設置

### 安裝依賴

```bash
npm install zustand swr
# 或者
yarn add zustand swr
# 或者
pnpm add zustand swr
```

### 配置 SWR

在應用程序的入口創建一個 SWR 配置組件：

```tsx
// hooks/swr/swrConfig.tsx
import { SWRConfig as SWRConfigProvider } from 'swr';
import React from 'react';

// 全局默認 SWR 配置
const defaultConfig = {
  fetcher: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error('請求失敗');
      throw error;
    }
    return res.json();
  },
  shouldRetryOnError: false,
  // 其他配置...
};

export function SWRConfig({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfigProvider value={defaultConfig}>
      {children}
    </SWRConfigProvider>
  );
}
```

### 在應用程序中使用 SWR 配置

```tsx
// app/providers.tsx
'use client';

import React from 'react';
import { SWRConfig } from '@/hooks/swr/swrConfig';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig>
      {children}
    </SWRConfig>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Zustand 狀態管理

### 創建基本 Store

```tsx
// lib/store/useCounterStore.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

export default useCounterStore;
```

### 使用 Persist 中間件保存狀態

```tsx
// lib/store/useThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'theme-storage', // localStorage 的 key 名稱
    }
  )
);

export default useThemeStore;
```

### 在組件中使用 Zustand Store

```tsx
'use client';

import React from 'react';
import useCounterStore from '@/lib/store/useCounterStore';
import useThemeStore from '@/lib/store/useThemeStore';

export function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <h1>計數器: {count}</h1>
      <button onClick={increment}>增加</button>
      <button onClick={decrement}>減少</button>
      <button onClick={reset}>重置</button>
      <button onClick={toggleTheme}>
        切換主題 (目前: {isDarkMode ? '暗色' : '亮色'})
      </button>
    </div>
  );
}
```

## SWR 數據獲取

### 創建基本 SWR Hook

```tsx
// hooks/swr/useUser.ts
import useSWR from 'swr';

interface User {
  id: number;
  name: string;
  email: string;
}

export function useUser(id: number) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? `/api/users/${id}` : null
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate, // 用於手動重新驗證
  };
}
```

### 在組件中使用 SWR Hook

```tsx
'use client';

import React from 'react';
import { useUser } from '@/hooks/swr/useUser';

export function UserProfile({ userId }: { userId: number }) {
  const { user, isLoading, isError } = useUser(userId);

  if (isLoading) return <div>載入中...</div>;
  if (isError) return <div>發生錯誤</div>;
  if (!user) return <div>未找到用戶</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

## 結合 Zustand 和 SWR

### 使用 SWR 獲取數據並更新 Zustand Store

```tsx
// hooks/swr/useUserWithStore.ts
import useSWR from 'swr';
import useUserStore from '@/lib/store/useUserStore';

interface User {
  id: number;
  name: string;
  email: string;
}

export function useUserWithStore(id: number) {
  const { setUser, setLoading, setError } = useUserStore();
  
  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? `/api/users/${id}` : null,
    {
      onSuccess: (data) => {
        if (data) {
          setUser(data);
        }
        setLoading(false);
      },
      onError: (err) => {
        setError(err.message);
        setLoading(false);
      },
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
```

### Zustand Store 定義

```tsx
// lib/store/useUserStore.ts
import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useUserStore;
```

### 在組件中使用結合的 Hook 和 Store

```tsx
'use client';

import React, { useEffect } from 'react';
import { useUserWithStore } from '@/hooks/swr/useUserWithStore';
import useUserStore from '@/lib/store/useUserStore';

export function UserProfileWithStore({ userId }: { userId: number }) {
  const { user, isLoading, error } = useUserStore();
  const { mutate } = useUserWithStore(userId);

  // 刷新數據的函數
  const refreshUser = () => {
    mutate();
  };

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error}</div>;
  if (!user) return <div>未找到用戶</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <button onClick={refreshUser}>刷新</button>
    </div>
  );
}
```

## 最佳實踐

### 1. 區分客戶端和服務器端狀態

- **客戶端狀態**：UI 狀態、表單狀態、主題偏好等 → 使用 Zustand
- **服務器狀態**：API 數據、用戶信息、內容等 → 使用 SWR

### 2. 使用 Persist 中間件持久化重要狀態

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // 狀態和方法
    }),
    {
      name: 'storage-key',
      partialize: (state) => ({ 
        // 只持久化某些字段
        user: state.user,
        preferences: state.preferences 
      }),
    }
  )
);
```

### 3. 使用 SWR 的條件獲取

```tsx
// 條件獲取 - 只有在 id 存在時才發起請求
const { data } = useSWR(id ? `/api/users/${id}` : null);

// 依賴獲取 - 只有在有 user 數據後才獲取 posts
const { data: user } = useSWR('/api/user');
const { data: posts } = useSWR(() => (user ? `/api/posts?userId=${user.id}` : null));
```

### 4. 使用 Zustand 的選擇器避免不必要的重新渲染

```tsx
// 使用選擇器只訂閱需要的狀態
function UserGreeting() {
  // 只有 user.name 變化時組件才會重新渲染
  const userName = useUserStore((state) => state.user?.name);
  
  return <div>Hello, {userName || 'Guest'}</div>;
}
```

### 5. 使用模塊化的狀態管理

將狀態按領域或功能區分成多個 Store，而不是使用單一的全局 Store：

```
/lib/store/
  ├── useAuthStore.ts    # 認證相關狀態
  ├── useCartStore.ts    # 購物車狀態
  ├── useUIStore.ts      # UI 相關狀態
  └── useUserStore.ts    # 用戶信息狀態
```

## 範例

本項目包含了多個範例，展示了如何在實際應用中使用 Zustand + SWR：

- `lib/store/useAuthStore.ts` - 用戶認證狀態管理
- `lib/store/useBlogStore.ts` - 部落格文章狀態管理
- `lib/store/useUIStore.ts` - UI 狀態管理（主題、通知等）
- `hooks/swr/useCurrentUser.ts` - 獲取當前用戶信息
- `hooks/swr/usePosts.ts` - 獲取部落格文章
- `app/examples/page.tsx` - 範例頁面展示以上所有功能

你可以訪問 `/examples` 路徑查看這些範例的實際運作。

## 結論

通過結合 Zustand 和 SWR，你可以創建一個強大而靈活的狀態管理系統，專為現代 React 和 Next.js 應用程序設計。Zustand 處理客戶端狀態，SWR 處理服務器端數據獲取和緩存。這種組合既輕量又高效，提供了良好的開發體驗。

### 資源

- [Zustand 官方文檔](https://github.com/pmndrs/zustand)
- [SWR 官方文檔](https://swr.vercel.app/zh-CN)
- [Next.js 文檔](https://nextjs.org/docs)
