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
  adminContactSettings: string;
  adminUsers: string;
  adminSettings: string;

  // API 路徑
  apiAuthLogin: string;
  apiAuthLogout: string;
  apiAuthMe: string;
  apiAuthUpdateProfile: string;
  apiAuthUpdatePassword: string;
  apiAuthCheckAuth: string;

  // 文章 API 路徑
  apiPosts: string;
  apiPostBySlug: string;
  apiPostById: string;

  // 媒體 API 路徑
  apiMedia: string;
  apiMediaById: string;

  // 聯絡頁面 API 路徑
  apiContact: string;
};

const routes: Routes = {
  // 基本頁面
  home: "/",
  contact: "/contact",
  blog: "/blog",

  // 認證相關頁面
  login: "/login",

  // 用戶相關頁面
  profile: "/admin/profile",
  profileEdit: "/admin/profile/edit",

  // 管理員相關頁面
  admin: "/admin",
  adminDashboard: "/admin/dashboard",
  adminPosts: "/admin/posts",
  adminContactSettings: "/admin/contact-settings",
  adminUsers: "/admin/users",
  adminSettings: "/admin/settings",

  // API 路徑
  apiAuthLogin: "/api/auth/login",
  apiAuthLogout: "/api/auth/logout",
  apiAuthMe: "/api/auth/me",
  apiAuthUpdateProfile: "/api/auth/update-profile",
  apiAuthUpdatePassword: "/api/auth/update-password",
  apiAuthCheckAuth: "/api/auth/check-auth",

  // 文章 API 路徑
  apiPosts: "/api/posts",
  apiPostBySlug: "/api/posts/:slug",
  apiPostById: "/api/posts/id/:id",

  // 媒體 API 路徑
  apiMedia: "/api/media",
  apiMediaById: "/api/media/:id",

  // 聯絡頁面 API 路徑
  apiContact: "/api/contact",
};

export default routes;
