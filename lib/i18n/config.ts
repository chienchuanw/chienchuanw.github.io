/**
 * i18n 配置檔案
 * 定義支援的語言和預設語言設定
 */

export const locales = ['en', 'tw'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// 語言顯示名稱對應
export const localeNames: Record<Locale, string> = {
  en: 'English',
  'tw': '繁體中文',
};

// 語言方向設定（未來如果需要支援 RTL 語言）
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  'tw': 'ltr',
};

// 檢查是否為有效的語言代碼
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 獲取語言的顯示名稱
export function getLocaleName(locale: Locale): string {
  return localeNames[locale] || locale;
}

// 獲取語言的方向
export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeDirections[locale] || 'ltr';
}

// 從路徑中提取語言代碼
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return null;
}

// 移除路徑中的語言代碼
export function removeLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

// 為路徑添加語言代碼
export function addLocaleToPathname(pathname: string, locale: Locale): string {
  // 移除現有的語言代碼（如果有）
  const cleanPathname = removeLocaleFromPathname(pathname);

  // 添加新的語言代碼（所有語言都顯示前綴，包括預設語言）
  return `/${locale}${cleanPathname === '/' ? '' : cleanPathname}`;
}
