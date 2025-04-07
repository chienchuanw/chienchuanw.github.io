'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { authenticate, setAuthStatus } from '@/lib/auth/auth-utils';
import { Eye, EyeOff } from 'lucide-react';

// 定義登入表單的驗證規則
const loginSchema = z.object({
  username: z.string().min(1, { message: '請輸入使用者名稱' }),
  password: z.string().min(1, { message: '請輸入密碼' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化表單
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // 處理表單提交
  function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    
    // 模擬網絡延遲
    setTimeout(() => {
      const { username, password } = data;
      const isAuthenticated = authenticate(username, password);
      
      if (isAuthenticated) {
        // 設置認證狀態
        setAuthStatus(true);
        
        toast({
          title: "登入成功",
          description: "歡迎回來，管理員。",
        });
        
        // 登入成功後重定向到管理後台
        // 使用 Next.js 路由
        router.push('/admin/dashboard');
      } else {
        toast({
          title: "登入失敗",
          description: "使用者名稱或密碼錯誤。",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>管理員登入</CardTitle>
        <CardDescription>
          請輸入您的管理員憑證以進入後台。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>使用者名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="輸入使用者名稱" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密碼</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="輸入密碼"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登入中..." : "登入"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
