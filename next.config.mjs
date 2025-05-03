/** @type {import('next').NextConfig} */
const nextConfig = {
  // 不使用靜態輸出，因為我們有動態API路由
  // output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // 確保靜態資源正確加載
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
