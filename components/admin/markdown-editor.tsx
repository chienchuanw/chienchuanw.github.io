'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// 動態導入 MD 編輯器以避免 SSR 問題
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

// 動態導入 MD 預覽組件
const MDPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  preview?: 'edit' | 'preview' | 'live';
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 400,
  preview = 'live',
}: MarkdownEditorProps) {
  // 使用數據 URL 作為本地圖片預覽
  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  // 自定義工具欄命令 - 圖片上傳
  const imageUploadCommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': '上傳圖片' },
    icon: (
      <svg viewBox="0 0 24 24" width="12" height="12">
        <path
          fill="currentColor"
          d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
        />
      </svg>
    ),
    execute: (state: { text: string; selection: any }, api: { replaceSelection: (text: string) => void }) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.click();

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const imageUrl = await handleImageUpload(file);
          api.replaceSelection(`![${file.name}](${imageUrl})`);
        }
      };
    },
  };

  // 暗色模式
  const [darkMode, setDarkMode] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  return (
    <div data-color-mode={darkMode} className="w-full">
      <MDEditor
        value={value}
        onChange={(val = '') => onChange(val)}
        height={height}
        preview={preview}
        extraCommands={[imageUploadCommand]}
        previewOptions={{
          rehypePlugins: [],
          remarkPlugins: [],
        }}
      />
    </div>
  );
}

// 純展示 Markdown 內容的元件
export function MarkdownPreview({ content }: { content: string }) {
  const [darkMode, setDarkMode] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  return (
    <div data-color-mode={darkMode} className="w-full">
      <MDPreview source={content} />
    </div>
  );
}
