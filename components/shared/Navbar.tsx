"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/swr/useCurrentUser";
import useAuthStore from "@/lib/store/useAuthStore";
import { useEffect } from "react";

import Link from "next/link";
import routes from "@/lib/routes";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, mutate } = useCurrentUser();
  const logout = useAuthStore((state) => state.logout);
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

  // 監聽路徑變化，自動檢查用戶狀態
  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const handleLogout = async () => {
    await logout();
    // 登出後直接重新驗證用戶狀態
    await mutate(undefined, { revalidate: true });
    router.push(routes.home);
  };
  return (
    <header className="w-full flex justify-center pt-10">
      <div className="container grid grid-cols-3 items-center">
        <div className="">
          <Avatar>
            <AvatarImage src="/images/avatar.jpg" className="object-cover" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
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
              <NavigationMenuItem className="space-x-4">
                <Link href={routes.blog} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Blog
                  </NavigationMenuLink>
                </Link>
                <Button asChild className="rounded-full">
                  <Link href={routes.contact}>Contact</Link>
                </Button>
                {isLoggedIn && (
                  <Button
                    variant="destructive"
                    className="rounded-full bg-red-600 text-white hover:bg-red-700"
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
