type Routes = {
  // 基本頁面
  home: string;
  contact: string;
  blog: string;

  // 認證相關頁面
  login: string;

  // 用戶相關頁面
  profile: string;
  profileEdit: string;

  // 管理員相關頁面
  admin: string;
  adminDashboard: string;
  adminPosts: string;
  adminUsers: string;
  adminSettings: string;

  // API 路徑
  apiAuthLogin: string;
  apiAuthLogout: string;
  apiAuthMe: string;
  apiAuthUpdateProfile: string;
  apiAuthUpdatePassword: string;
  apiAuthCheckAuth: string;
};

const routes: Routes = {
  // 基本頁面
  home: "/",
  contact: "/contact",
  blog: "/blog",

  // 認證相關頁面
  login: "/login",

  // 用戶相關頁面
  profile: "/profile",
  profileEdit: "/profile/edit",

  // 管理員相關頁面
  admin: "/admin",
  adminDashboard: "/admin/dashboard",
  adminPosts: "/admin/posts",
  adminUsers: "/admin/users",
  adminSettings: "/admin/settings",

  // API 路徑
  apiAuthLogin: "/api/auth/login",
  apiAuthLogout: "/api/auth/logout",
  apiAuthMe: "/api/auth/me",
  apiAuthUpdateProfile: "/api/auth/update-profile",
  apiAuthUpdatePassword: "/api/auth/update-password",
  apiAuthCheckAuth: "/api/auth/check-auth",
};

export default routes;
