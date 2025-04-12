"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useCurrentUser } from "@/hooks/swr/useCurrentUser";

import Link from "next/link";
import routes from "@/lib/routes";

const Navbar = () => {
  const router = useRouter();
  const { isLoggedIn, mutate } = useCurrentUser();
  const { logout } = useAuth();

  // 不再需要監聽 localStorage 事件，因為我們現在使用 Zustand 來管理狀態

  const handleLogout = async () => {
    try {
      // 使用 Zustand store 的 logout 方法
      // 這會自動觸發 store 變化，進而觸發所有訂閱的組件重新渲染
      await logout();
      
      // 手動重新驗證當前用戶狀態
      await mutate();

      router.push(routes.home);
      router.refresh();
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };
  
  return (
    <header className="w-full flex justify-center pt-10">
      <div className="container grid grid-cols-3 items-center">
        <div>
          {isLoggedIn && (
            <Avatar>
              <Link href={routes.profile}>
                <AvatarImage
                  src="/images/avatar.jpg"
                  className="object-cover"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Link>
            </Avatar>
          )}
        </div>
        <section className="flex justify-center">
          <div className="max-w-[400px]">
            <div>
              <Link
                href={routes.home}
                className="font-title text-4xl font-bold text-center tracking-wide"
              >
                CHIENCHUANW
              </Link>
              <div className="flex justify-between text-xs mx-auto px-1">
                <span>programmer / lighting designer</span>
                <span>from Taipei</span>
              </div>
            </div>
          </div>
        </section>
        <div className="flex justify-end">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Button asChild variant="link" className="rounded-full">
                  <Link href={routes.blog}>Blog</Link>
                </Button>
                <Button asChild variant="link" className="rounded-full">
                  <Link href={routes.contact}>Contact</Link>
                </Button>
                {isLoggedIn && (
                  <Button
                    variant="link"
                    className="text-red-500 font-bold"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
