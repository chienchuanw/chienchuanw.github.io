// 根頁面 - 由 middleware 處理重定向到預設語言
// 這個頁面實際上不會被渲染，因為 middleware 會重定向到 /en
export default function RootPage() {
  return null;
}
