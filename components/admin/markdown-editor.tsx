"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MediaGallery from "./media-gallery";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faVideo, faFileAlt } from "@fortawesome/free-solid-svg-icons";

// 動態導入 MD 編輯器以避免 SSR 問題
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

// 動態導入 MD 預覽組件
const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  preview?: "edit" | "preview" | "live";
  postId?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 400,
  preview = "live",
  postId,
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

  // 插入媒體內容
  const handleMediaSelect = (
    mediaUrl: string,
    api?: { replaceSelection: (text: string) => void }
  ) => {
    // 根據 URL 判斷媒體類型
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(mediaUrl);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);
    const isPdf = /\.pdf$/i.test(mediaUrl);

    let markdownText = "";

    if (isImage) {
      markdownText = `![Image](${mediaUrl})`;
    } else if (isVideo) {
      markdownText = `<video controls width="100%" src="${mediaUrl}"></video>`;
    } else if (isPdf) {
      markdownText = `[PDF Document](${mediaUrl})`;
    } else {
      markdownText = `[File](${mediaUrl})`;
    }

    if (api) {
      api.replaceSelection(markdownText);
    } else {
      // 直接插入到編輯器的當前位置
      onChange(value + "\n" + markdownText + "\n");
    }
  };

  // 自定義工具欄命令 - 圖片上傳
  const imageUploadCommand = {
    name: "image-upload",
    keyCommand: "image-upload",
    buttonProps: { "aria-label": "上傳圖片" },
    icon: (
      <svg viewBox="0 0 24 24" width="12" height="12">
        <path
          fill="currentColor"
          d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
        />
      </svg>
    ),
    execute: (
      state: { text: string; selection: any },
      api: { replaceSelection: (text: string) => void }
    ) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // 使用本地預覽作為臨時顯示
          const imageUrl = await handleImageUpload(file);
          api.replaceSelection(`![${file.name}](${imageUrl})`);

          // 如果有 postId，則上傳到服務器
          if (postId) {
            try {
              const formData = new FormData();
              formData.append("file", file);
              formData.append("postId", postId.toString());

              const response = await fetch("/api/media", {
                method: "POST",
                body: formData,
              });

              if (response.ok) {
                const data = await response.json();
                // 替換臨時 URL 為服務器 URL
                const serverUrl = data.media.url;
                const currentContent = value;
                onChange(currentContent.replace(imageUrl, serverUrl));
              }
            } catch (error) {
              console.error("Error uploading image:", error);
            }
          }
        }
      };
    },
  };

  // 自定義工具欄命令 - 媒體庫
  const mediaGalleryCommand = {
    name: "media-gallery",
    keyCommand: "media-gallery",
    buttonProps: { "aria-label": "媒體庫" },
    icon: <FontAwesomeIcon icon={faImage} />,
    execute: (
      state: { text: string; selection: any },
      api: { replaceSelection: (text: string) => void }
    ) => {
      // 在選擇媒體後插入到編輯器
      const mediaGalleryButton = document.getElementById(
        "media-gallery-button"
      );
      if (mediaGalleryButton) {
        mediaGalleryButton.click();
        // 將 api 存儲起來，以便在選擇媒體後使用
        (window as any).__mdEditorApi = api;
      }
    },
  };

  // 暗色模式
  const [darkMode, setDarkMode] = useState<any>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  return (
    <div data-color-mode={darkMode} className="w-full">
      <div className="space-y-2">
        <MDEditor
          value={value}
          onChange={(val = "") => onChange(val)}
          height={height}
          preview={preview}
          extraCommands={[imageUploadCommand, mediaGalleryCommand]}
          previewOptions={{
            rehypePlugins: [],
            remarkPlugins: [],
          }}
        />
        <div className="flex justify-end">
          <span id="media-gallery-button" className="hidden">
            <MediaGallery
              postId={postId}
              onSelect={(url) => {
                const api = (window as any).__mdEditorApi;
                if (api) {
                  handleMediaSelect(url, api);
                  delete (window as any).__mdEditorApi;
                } else {
                  handleMediaSelect(url);
                }
              }}
            />
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const button = document.getElementById("media-gallery-button");
              if (button) {
                const clickEvent = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });
                button.dispatchEvent(clickEvent);
              }
            }}
          >
            <FontAwesomeIcon icon={faImage} className="h-4 w-4 mr-2" />
            Insert Media
          </Button>
        </div>
      </div>
    </div>
  );
}

// 純展示 Markdown 內容的元件
export function MarkdownPreview({ content }: { content: string }) {
  const [darkMode, setDarkMode] = useState<any>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  return (
    <div data-color-mode={darkMode} className="w-full">
      <MDPreview source={content} />
    </div>
  );
}
