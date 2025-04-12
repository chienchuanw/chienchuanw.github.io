"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useCurrentUser } from "@/hooks/swr/useCurrentUser";
import useAuthStore from "@/lib/store/useAuthStore";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

import Link from "next/link";
import routes from "@/lib/routes";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, mutate } = useCurrentUser();
  const { logout } = useAuth();
  const { toast } = useToast();

  // 監聽路徑變化，自動檢查用戶狀態
  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const handleLogout = async () => {
    try {
      await logout();
      // 登出後直接重新驗證用戶狀態
      await mutate(undefined, { revalidate: true });
      router.push(routes.home);
      router.refresh();
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };
  return (
    <header className="w-full flex justify-center pt-10">
      <div className="container grid grid-cols-3 items-center">
        <div>
          {isLoggedIn && (
            <Link href={routes.profile}>
              <Avatar>
                <AvatarImage
                  src="/images/avatar.jpg"
                  className="object-cover"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Link>
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
                    登出
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
