"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom components
import AnimatedBurger from "./AnimatedBurger";

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
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Ref for the mobile menu container
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close the mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    // Add event listener when menu is open
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

            {/* Mobile menu button - shown on small and medium screens (less than 1024px) */}
            <div className="lg:hidden">
              <div className="relative" ref={mobileMenuRef}>
                {/* Custom burger button with animation */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-1.5 rounded-md focus:outline-none"
                  aria-label="Toggle menu"
                >
                  <AnimatedBurger isOpen={isMobileMenuOpen} />
                </button>

                {/* Animated mobile menu */}
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-[200px] rounded-md shadow-lg bg-background border z-50"
                    >
                      <motion.ul
                        className="py-1.5 px-2 space-y-0.5 text-sm"
                        initial="closed"
                        animate="open"
                        variants={{
                          open: {
                            transition: {
                              staggerChildren: 0.05,
                              delayChildren: 0.1,
                            },
                          },
                          closed: {},
                        }}
                      >
                        <motion.li
                          variants={{
                            open: { opacity: 1, y: 0 },
                            closed: { opacity: 0, y: -10 },
                          }}
                        >
                          <Link href={routes.blog}>
                            <span className="block px-2.5 py-1.5 rounded-md hover:bg-accent transition-colors duration-200">
                              Blog
                            </span>
                          </Link>
                        </motion.li>

                        <motion.li
                          variants={{
                            open: { opacity: 1, y: 0 },
                            closed: { opacity: 0, y: -10 },
                          }}
                        >
                          <Link href={routes.contact}>
                            <span className="block px-2.5 py-1.5 rounded-md hover:bg-accent transition-colors duration-200">
                              Contact
                            </span>
                          </Link>
                        </motion.li>

                        {/* Admin options in mobile menu */}
                        {currentLoggedIn && (
                          <>
                            <motion.li
                              className="mt-2 pt-2 border-t"
                              variants={{
                                open: { opacity: 1, y: 0 },
                                closed: { opacity: 0, y: -10 },
                              }}
                            >
                              <span className="block px-2.5 py-1 text-xs font-medium">
                                Admin
                              </span>
                            </motion.li>

                            <motion.li
                              variants={{
                                open: { opacity: 1, y: 0 },
                                closed: { opacity: 0, y: -10 },
                              }}
                            >
                              <Link href={routes.adminDashboard}>
                                <span className="block px-2.5 py-1.5 pl-4 rounded-md hover:bg-accent transition-colors duration-200">
                                  Dashboard
                                </span>
                              </Link>
                            </motion.li>

                            <motion.li
                              variants={{
                                open: { opacity: 1, y: 0 },
                                closed: { opacity: 0, y: -10 },
                              }}
                            >
                              <Link href={routes.adminPosts}>
                                <span className="block px-2.5 py-1.5 pl-4 rounded-md hover:bg-accent transition-colors duration-200">
                                  Post Management
                                </span>
                              </Link>
                            </motion.li>

                            {/* Logout button in mobile menu */}
                            <motion.li
                              className="mt-2 pt-1 border-t"
                              variants={{
                                open: { opacity: 1, y: 0 },
                                closed: { opacity: 0, y: -10 },
                              }}
                            >
                              <button
                                onClick={handleLogout}
                                className="w-full text-left text-red-500 font-medium px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors duration-200"
                              >
                                Logout
                              </button>
                            </motion.li>
                          </>
                        )}
                      </motion.ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
