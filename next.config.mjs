/** @type {import('next').NextConfig} */
const nextConfig = {
  // 圖片優化設定
  images: {
    unoptimized: false,
    domains: ['localhost'], // 如果有外部圖片來源，請加入域名
  },

  // 輸出設定 - 適用於靜態部署
  output: 'standalone',

  // 實驗性功能
  experimental: {
    serverComponentsExternalPackages: ['pg', 'postgres'],
  },
};

export default nextConfig;
