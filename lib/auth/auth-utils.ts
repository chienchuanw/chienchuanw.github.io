// 這個文件包含身份驗證相關的實用功能

// 簡單的身份驗證檢查 - 在實際應用中應使用更安全的方法
export function authenticate(username: string, password: string): boolean {
  // 在生產環境應使用環境變數或安全的認證系統
  // 這裡僅作為示例
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "admin";

  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// 設置身份驗證狀態
export function setAuthStatus(isAuthenticated: boolean): void {
  if (typeof window !== "undefined") {
    if (isAuthenticated) {
      // 在實際應用中，你應該使用更安全的方法如HTTP-only cookies
      // 這裡使用localStorage只是為了示例
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("authTimestamp", Date.now().toString());
    } else {
      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("authTimestamp");
    }
  }
}

// 檢查身份驗證狀態
export function checkAuthStatus(): boolean {
  if (typeof window !== "undefined") {
    const isAuthenticated =
      localStorage.getItem("adminAuthenticated") === "true";
    const timestamp = localStorage.getItem("authTimestamp");

    if (isAuthenticated && timestamp) {
      // 身份驗證有效期為2小時
      const expiryTime = 2 * 60 * 60 * 1000; // 2小時（毫秒）
      const currentTime = Date.now();
      const authTime = parseInt(timestamp, 10);

      if (currentTime - authTime > expiryTime) {
        // 身份驗證已過期
        setAuthStatus(false);
        return false;
      }

      return true;
    }
  }

  return false;
}

// 登出
export function logout(): void {
  setAuthStatus(false);
}
