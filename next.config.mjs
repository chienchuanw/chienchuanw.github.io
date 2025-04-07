/** @type {import('next').NextConfig} */
const nextConfig = {
  // 僅在生產環境中使用靜態輸出
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  // 確保靜態資源正確加載
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
