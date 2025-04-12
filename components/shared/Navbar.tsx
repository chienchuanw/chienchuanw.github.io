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
import useAuthStore from "@/lib/store/useAuthStore";

import Link from "next/link";
import routes from "@/lib/routes";

const Navbar = () => {
  const router = useRouter();
  // 直接使用 useAuthStore 來訂閱登入狀態
  const isLoggedInFromStore = useAuthStore((state) => state.isLoggedIn);
  const { isLoggedIn, mutate } = useCurrentUser();
  const { logout } = useAuth();

  // 使用一個狀態來追蹤當前的登入狀態，結合 Zustand 和 SWR 的狀態
  // 這樣可以確保即使在 SWR 重新驗證之前，也能反映最新的登入狀態
  const currentLoggedIn = isLoggedIn || isLoggedInFromStore;

  const handleLogout = async () => {
    try {
      // 使用 auth-context 的 logout 函數
      await logout();

      // 手動重新驗證當前用戶狀態
      await mutate();

      // 重定向到首頁
      router.push(routes.home);

      // 強制刷新頁面以確保狀態更新
      router.refresh();
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  return (
    <header className="w-full flex justify-center pt-10">
      <div className="container grid grid-cols-3 items-center">
        <div>
          {currentLoggedIn && (
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
                {currentLoggedIn && (
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
