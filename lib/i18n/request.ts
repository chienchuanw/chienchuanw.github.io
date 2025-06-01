/**
 * next-intl 請求處理配置
 * 處理語言檢測和訊息載入
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale } from './config';

// 靜態 import 翻譯檔案
import enMessages from '../../messages/en.json';
import twMessages from '../../messages/tw.json';

export default getRequestConfig(async ({ locale }) => {
  // 使用傳入的 locale 參數，這是由 middleware 處理的
  const currentLocale = (locale as Locale) || defaultLocale;

  // 使用靜態 import 載入翻譯檔案
  const messages = currentLocale === 'tw' ? twMessages : enMessages;

  return {
    locale: currentLocale,
    messages,
  };
});
