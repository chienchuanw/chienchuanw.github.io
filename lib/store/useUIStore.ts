import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定義 UI 狀態
interface UIState {
  isDarkMode: boolean;
  sidebarOpen: boolean;
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
  
  // 操作方法
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

// 創建 Zustand store
const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      sidebarOpen: false,
      toasts: [],
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      
      addToast: (message, type) => set((state) => ({
        toasts: [
          ...state.toasts,
          {
            id: Date.now().toString(),
            message,
            type,
          },
        ],
      })),
      
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      })),
    }),
    {
      name: 'ui-storage', // localStorage 中的 key 名稱
      partialize: (state) => ({ 
        // 只保存這些狀態到 localStorage
        isDarkMode: state.isDarkMode
      }),
    }
  )
);

export default useUIStore;
