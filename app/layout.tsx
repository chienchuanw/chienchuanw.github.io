import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "chienchuanw",
  description: "My personal website",
};

// 根 layout - 僅用於包裝 [locale] 路由
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
