'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from '@/components/auth/protected-route';
import { logout } from '@/lib/auth/auth-utils';
// Toaster 已在 layout 中引入
import { useToast } from '@/components/ui/use-toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // 模擬網絡延遲
    setTimeout(() => {
      logout();
      toast({
        title: "已登出",
        description: "您已成功登出管理員後台。",
      });
      // 使用 Next.js 路由
      router.push('/admin/login');
      setIsLoggingOut(false);
    }, 500);
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col p-4 md:p-8">
        <header className="flex items-center justify-between mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">管理員後台</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "登出中..." : "登出"}
          </Button>
        </header>
        
        <main className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>文章管理</CardTitle>
              <CardDescription>
                管理博客文章的發布、編輯和刪除
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push('/admin/posts')}>進入文章管理</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>評論管理</CardTitle>
              <CardDescription>
                審核和管理用戶評論
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">進入評論管理</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>網站設置</CardTitle>
              <CardDescription>
                管理網站的全局設置和偏好
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">進入網站設置</Button>
            </CardContent>
          </Card>
        </main>
      </div>
      {/* Toaster 已在 layout 中引入 */}
    </ProtectedRoute>
  );
}
