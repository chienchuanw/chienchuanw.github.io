/**
 * next-intl 請求處理配置
 * 處理語言檢測和訊息載入
 */

import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { defaultLocale, isValidLocale, type Locale } from './config';

// 靜態 import 翻譯檔案
import enMessages from '../../messages/en.json';
import twMessages from '../../messages/tw.json';

export default getRequestConfig(async () => {
  // 從 headers 或 URL 中獲取語言設定
  let locale: Locale = defaultLocale;
  
  try {
    // 嘗試從 headers 中獲取語言設定
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';

    // 從路徑中提取語言代碼
    const pathSegments = pathname.split('/');
    const potentialLocale = pathSegments[1];

    if (potentialLocale && isValidLocale(potentialLocale)) {
      locale = potentialLocale;
    } else {
      // 如果路徑中沒有語言代碼，嘗試從 Accept-Language header 中獲取
      const acceptLanguage = headersList.get('accept-language');
      if (acceptLanguage) {
        // 簡單的語言檢測邏輯
        if (acceptLanguage.includes('zh-TW') || acceptLanguage.includes('zh-Hant')) {
          locale = 'tw';
        } else if (acceptLanguage.includes('zh')) {
          locale = 'tw'; // 預設使用繁體中文
        }
      }
    }
  } catch (error) {
    console.warn('Failed to detect locale from headers:', error);
    locale = defaultLocale;
  }

  // 使用靜態 import 載入翻譯檔案
  const messages = locale === 'tw' ? twMessages : enMessages;

  return {
    locale,
    messages,
  };
});
