import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Tags from "@/components/shared/Tags";

export const metadata: Metadata = {
  title: "shadcn blog",
  description: "a blog use Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 使用動態判斷當前路徑的方式處理（客戶端會做 hydration）
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased root-body">
        <div id="nav-container" data-hide-on-admin="true">
          <Navbar />
          <Tags />
        </div>
        <main>{children}</main>
      </body>
    </html>
  );
}
