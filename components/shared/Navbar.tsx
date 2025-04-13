"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

// shadcn/ui components
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// auth related hooks
import { useAuth } from "@/lib/context/auth-context";
import { useCurrentUser } from "@/hooks/swr/useCurrentUser";
import useAuthStore from "@/lib/store/useAuthStore";

// routes
import routes from "@/lib/routes";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const router = useRouter();
  // 直接使用 useAuthStore 來訂閱登入狀態
  // 註釋：使用 Zustand store 來獲取登入狀態，以便在客戶端渲染時有即時的狀態
  const isLoggedInFromStore = useAuthStore((state) => state.isLoggedIn);
  const { isLoggedIn, mutate } = useCurrentUser();
  const { logout } = useAuth();

  // 使用一個狀態來追蹤當前的登入狀態，結合 Zustand 和 SWR 的狀態
  // 註釋：這樣可以確保即使在 SWR 重新驗證之前，也能反映最新的登入狀態
  const currentLoggedIn = isLoggedIn || isLoggedInFromStore;

  const handleLogout = async () => {
    try {
      // 註釋：使用 auth-context 的 logout 函數進行登出操作
      await logout();

      // 註釋：手動重新驗證當前用戶狀態，確保 UI 更新
      await mutate();

      // 註釋：登出成功後重定向到首頁
      router.push(routes.home);
    } catch (error) {
      console.error("登出失敗:", error);
    }
  };

  return (
    <header className="w-full flex justify-center pt-6 lg:pt-10">
      <div className="container px-4 lg:px-0">
        {/*
          註釋：使用不同的網格配置來適應不同螢幕尺寸
          - 小和中等螢幕：兩欄布局（logo + 漢堡選單）
          - 大螢幕：三欄布局
        */}
        <div className="grid grid-cols-2 lg:grid-cols-12 items-center">
          {/* 左側頭像 - 僅在大螢幕和登入時顯示 */}
          <div className="hidden lg:block lg:col-span-3">
            {currentLoggedIn && (
              <Avatar className="cursor-pointer">
                <Link href={routes.profile}>
                  <AvatarImage
                    src="/images/avatar.jpg"
                    className="object-cover"
                    alt="User avatar"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Link>
              </Avatar>
            )}
          </div>

          {/* 中間 Logo - 在所有尺寸下居中 */}
          <section className="flex lg:col-span-6 md:justify-center">
            <div className="max-w-[400px]">
              <div>
                <Link
                  href={routes.home}
                  className="font-title text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide"
                >
                  CHIENCHUANW
                </Link>
                <div className="flex justify-between text-[10px] md:text-xs mx-auto px-1">
                  <span>programmer / lighting designer</span>
                  <span className="hidden sm:inline">from Taipei</span>
                </div>
              </div>
            </div>
          </section>

          {/* 右側導航 - 大螢幕版與中小螢幕版 */}
          <div className="flex justify-end items-center lg:col-span-3">
            {/*
              註釋：大螢幕導航菜單 - 僅在 1024px 以上顯示
            */}
            <div className="hidden lg:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href={routes.blog} legacyBehavior passHref>
                      <NavigationMenuLink className="px-4 py-2 hover:text-primary">
                        Blog
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link href={routes.contact} legacyBehavior passHref>
                      <NavigationMenuLink className="px-4 py-2 hover:text-primary">
                        Contact
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {/* Admin 選單與子選單 */}
                  {currentLoggedIn && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="px-4 py-2">
                        Admin
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4">
                          <li className="row-span-1">
                            <Link
                              href={routes.adminDashboard}
                              legacyBehavior
                              passHref
                            >
                              <NavigationMenuLink
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                )}
                              >
                                <div className="text-sm font-medium leading-none">
                                  Dashboard
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  查看網站總覽和數據統計
                                </p>
                              </NavigationMenuLink>
                            </Link>
                          </li>
                          <li className="row-span-1">
                            <Link
                              href={routes.adminPosts}
                              legacyBehavior
                              passHref
                            >
                              <NavigationMenuLink
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                )}
                              >
                                <div className="text-sm font-medium leading-none">
                                  Post Management
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  管理和編輯部落格文章
                                </p>
                              </NavigationMenuLink>
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )}

                  {/* 登出按鈕 */}
                  {currentLoggedIn && (
                    <NavigationMenuItem>
                      <Button
                        variant="ghost"
                        className="text-red-500 font-medium hover:text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* 漢堡選單按鈕 - 在小和中等螢幕顯示 (小於 1024px) */}
            <div className="lg:hidden">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    {/* Custom hamburger button without dropdown arrow */}
                    <NavigationMenuTrigger
                      className="p-2 h-8 w-8 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent"
                      hideArrow={true}
                    >
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Menu</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-2 p-4">
                        <li>
                          <Link href={routes.blog} legacyBehavior passHref>
                            <NavigationMenuLink
                              className={cn(
                                "block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              Blog
                            </NavigationMenuLink>
                          </Link>
                        </li>
                        <li>
                          <Link href={routes.contact} legacyBehavior passHref>
                            <NavigationMenuLink
                              className={cn(
                                "block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              Contact
                            </NavigationMenuLink>
                          </Link>
                        </li>

                        {/* 漢堡選單中的 Admin 選項 */}
                        {currentLoggedIn && (
                          <>
                            <li className="mt-2 font-medium border-t pt-2">
                              Admin
                            </li>
                            <li>
                              <Link
                                href={routes.adminDashboard}
                                legacyBehavior
                                passHref
                              >
                                <NavigationMenuLink
                                  className={cn(
                                    "block select-none rounded-md p-2 pl-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  )}
                                >
                                  Dashboard
                                </NavigationMenuLink>
                              </Link>
                            </li>
                            <li>
                              <Link
                                href={routes.adminPosts}
                                legacyBehavior
                                passHref
                              >
                                <NavigationMenuLink
                                  className={cn(
                                    "block select-none rounded-md p-2 pl-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  )}
                                >
                                  Post Management
                                </NavigationMenuLink>
                              </Link>
                            </li>

                            {/* 漢堡選單中的登出按鈕 */}
                            <li className="mt-2">
                              <button
                                onClick={handleLogout}
                                className="w-full text-left text-red-500 font-medium p-2 rounded-md hover:bg-red-50"
                              >
                                Logout
                              </button>
                            </li>
                          </>
                        )}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
