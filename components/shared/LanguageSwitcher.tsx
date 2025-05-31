'use client';

/**
 * 語言切換組件
 * 提供中英文切換功能
 */

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { locales, localeNames, addLocaleToPathname, removeLocaleFromPathname, type Locale } from '@/lib/i18n/config';

export default function LanguageSwitcher() {
  const t = useTranslations('language');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  // 切換語言函數
  const switchLanguage = (newLocale: Locale) => {
    // 如果是相同語言，不做任何操作
    if (newLocale === currentLocale) return;

    // 移除當前路徑中的語言前綴
    const cleanPathname = removeLocaleFromPathname(pathname);
    
    // 添加新的語言前綴
    const newPathname = addLocaleToPathname(cleanPathname, newLocale);
    
    // 導航到新的路徑
    router.push(newPathname);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm px-3 py-2 whitespace-nowrap"
          aria-label={t('switchLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeNames[currentLocale]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={`cursor-pointer ${
              locale === currentLocale 
                ? 'bg-accent text-accent-foreground font-medium' 
                : ''
            }`}
          >
            <span className="flex items-center justify-between w-full">
              {localeNames[locale]}
              {locale === currentLocale && (
                <span className="text-xs text-muted-foreground ml-2">
                  ✓
                </span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
