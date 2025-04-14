import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Tags from "@/components/shared/Tags";
import { AuthProvider } from "@/lib/context/auth-context";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "chienchuanw",
  description: "My personal website",
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
        <Providers>
          <AuthProvider>
            <div id="nav-container">
              <Navbar />
            </div>
            <main className="max-w-screen-xl mx-auto px-4 mt-16">
              {children}
            </main>
            <Toaster />
            {/* 移除登入狀態指示燈 */}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
