"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MediaGallery from "./media-gallery";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faCircleInfo } from "@fortawesome/free-solid-svg-icons";

// Dynamically import MD editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

// Dynamically import ReactMarkdown for preview
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

// Import remark-gfm plugin for GitHub Flavored Markdown
const remarkGfm = dynamic(
  () => import("remark-gfm").then((mod) => mod.default),
  { ssr: false }
);

// Helper function to detect strikethrough text
const processStrikethrough = (text: string) => {
  // Match text between ~~ and ~~ (strikethrough in markdown)
  const strikethroughRegex = /~~([^~]+)~~/g;
  return text.replace(strikethroughRegex, "<del>$1</del>");
};

// Helper function to detect code blocks
const processCodeBlocks = (text: string) => {
  // Match code blocks with backticks
  const codeBlockRegex = /```([a-z]*)?\n([\s\S]*?)```/g;
  return text.replace(codeBlockRegex, (_match, language, code) => {
    const lang = language || "";
    // Return a placeholder that will be replaced with the actual syntax highlighter component
    return `<div data-syntax-highlight="true" data-language="${lang}">${code}</div>`;
  });
};

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
  // We've removed the handleImageUpload function as it's no longer needed

  // Insert media content into the editor
  const handleMediaSelect = (
    mediaUrl: string,
    api?: { replaceSelection: (text: string) => void }
  ) => {
    // Determine media type based on URL
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
      // Insert directly at the current position in the editor
      onChange(value + "\n" + markdownText + "\n");
    }
  };

  // Helper function to validate and fix markdown syntax
  const validateMarkdown = (text: string): string => {
    // Fix empty image sources: ![]() -> []()
    return text.replace(/!\[(.*?)\]\(\s*\)/g, "[$1]()");
  };

  // We've removed the custom toolbar commands (imageUploadCommand and mediaGalleryCommand)
  // to simplify the editor interface and rely on the Insert Media button below

  // State for dialog open/close
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use a ref to track if we're in the browser
  const isBrowser = useRef(false);
  // Default to light mode for SSR
  const [darkMode, setDarkMode] = useState<"dark" | "light">("light");

  // Only update dark mode after component mounts to avoid hydration mismatch
  useEffect(() => {
    isBrowser.current = true;
    // Check for dark mode preference
    const isDarkMode = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(isDarkMode ? "dark" : "light");

    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div
      data-color-mode={isBrowser.current ? darkMode : "light"}
      className="w-full"
    >
      <div className="space-y-2">
        <MDEditor
          value={value}
          onChange={(val = "") => onChange(validateMarkdown(val))}
          height={height}
          preview={preview}
          extraCommands={[]}
          previewOptions={{
            rehypePlugins: [],
            remarkPlugins: [],
          }}
        />
        <div className="flex justify-between items-center">
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="h-4 w-4 text-muted-foreground"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-muted text-muted-foreground">
                <div className="text-xs">
                  <span className="font-medium">Markdown Tips:</span>
                  <br />
                  Use{" "}
                  <code className="bg-background px-1 rounded">
                    [text](url)
                  </code>{" "}
                  for links
                  <br />
                  Use{" "}
                  <code className="bg-background px-1 rounded">
                    ![alt](image_url)
                  </code>{" "}
                  for images
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div>
            {/* Media Gallery Dialog */}
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                // Reset the editor API reference when the dialog is closed
                if (!open) {
                  delete (
                    window as {
                      __mdEditorApi?: {
                        replaceSelection: (text: string) => void;
                      };
                    }
                  ).__mdEditorApi;
                }
              }}
              // The Dialog component automatically handles Escape key and outside clicks
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open the dialog
                    setIsDialogOpen(true);

                    // Store the current editor API for use after media selection
                    const editorElement = document.querySelector(
                      ".w-md-editor-text-input"
                    );
                    if (editorElement) {
                      // Store the editor's selection API in a global variable
                      // so it can be accessed after media selection
                      (
                        window as {
                          __mdEditorApi?: {
                            replaceSelection: (text: string) => void;
                          };
                        }
                      ).__mdEditorApi = {
                        replaceSelection: (text: string) => {
                          // Get the current selection
                          const textarea = editorElement as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const currentValue = textarea.value;

                          // Insert the text at the cursor position
                          const newValue =
                            currentValue.substring(0, start) +
                            text +
                            currentValue.substring(end);
                          onChange(validateMarkdown(newValue));

                          // Set the cursor position after the inserted text
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + text.length,
                              start + text.length
                            );
                          }, 0);
                        },
                      };
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faImage} className="h-4 w-4 mr-2" />
                  Insert Media
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <MediaGallery
                  postId={postId}
                  noDialog={true}
                  isOpen={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  onSelect={(url: string) => {
                    // Get the editor API if it exists (for cursor position insertion)
                    const api = (
                      window as {
                        __mdEditorApi?: {
                          replaceSelection: (text: string) => void;
                        };
                      }
                    ).__mdEditorApi;

                    if (api) {
                      // Insert at cursor position if API is available
                      handleMediaSelect(url, api);
                      // Close the dialog after insertion
                      setIsDialogOpen(false);
                    } else {
                      // Otherwise insert at the end
                      handleMediaSelect(url);
                      // Close the dialog
                      setIsDialogOpen(false);
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for displaying Markdown content without editing capabilities
export function MarkdownPreview({ content }: { content: string }) {
  // Use a ref to track if we're in the browser
  const isBrowser = useRef(false);
  // Default to light mode for SSR
  const [darkMode, setDarkMode] = useState<"dark" | "light">("light");

  // Only update dark mode after component mounts to avoid hydration mismatch
  useEffect(() => {
    isBrowser.current = true;
    // Check for dark mode preference
    const isDarkMode = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(isDarkMode ? "dark" : "light");

    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div
      data-color-mode={isBrowser.current ? darkMode : "light"}
      className={`w-full prose markdown-body ${
        isBrowser.current && darkMode === "dark" ? "dark-mode" : ""
      }`}
    >
      <ReactMarkdown
        // @ts-expect-error - Type issues with remarkPlugins
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom rendering for images
          img: ({ ...props }) => {
            return (
              <span className="inline-block relative">
                <Image
                  src={props.src || ""}
                  alt={props.alt || ""}
                  className="max-w-full h-auto rounded-md"
                  width={800}
                  height={600}
                  style={{ width: "100%", height: "auto" }}
                />
              </span>
            );
          },
          // Custom rendering for links
          a: ({ ...props }) => {
            return (
              <a
                href={props.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {props.children}
              </a>
            );
          },
          // Custom rendering for code blocks
          // @ts-expect-error - Type issues with react-markdown components
          code: ({ className, children, inline, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && (inline || false);

            if (isInline) {
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Use SyntaxHighlighter for code blocks
            const language = match ? match[1] : "";
            return (
              <SyntaxHighlighter
                language={language}
                style={tomorrow}
                className="rounded-md overflow-auto my-4 text-sm"
                customStyle={{
                  padding: "1rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.85rem",
                  lineHeight: "1.5",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
          // Handle HTML in markdown, including videos and strikethrough
          p: ({ children, ...props }) => {
            // Check if the paragraph contains a video element
            const childrenArray = React.Children.toArray(children);
            const hasVideo = childrenArray.some(
              (child) => typeof child === "string" && child.includes("<video")
            );

            // Check if the paragraph contains strikethrough text
            const hasStrikethrough = childrenArray.some(
              (child) => typeof child === "string" && child.includes("~~")
            );

            // Check if the paragraph contains code blocks
            const hasCodeBlock = childrenArray.some(
              (child) => typeof child === "string" && child.includes("```")
            );

            if (hasVideo) {
              // Extract video HTML and render it
              const videoHtml = childrenArray
                .map((child) => (typeof child === "string" ? child : ""))
                .join("");
              return <div dangerouslySetInnerHTML={{ __html: videoHtml }} />;
            }

            if (hasCodeBlock) {
              // Process code blocks
              const processedHtml = childrenArray
                .map((child) => {
                  if (typeof child === "string") {
                    return processCodeBlocks(child);
                  }
                  return "";
                })
                .join("");

              // Create a temporary div to parse the HTML
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = processedHtml;

              // Find all syntax highlight placeholders
              const syntaxHighlightElements = tempDiv.querySelectorAll(
                '[data-syntax-highlight="true"]'
              );

              if (syntaxHighlightElements.length > 0) {
                // If we have syntax highlight elements, render them with SyntaxHighlighter
                return (
                  <>
                    {Array.from(syntaxHighlightElements).map(
                      (element, index) => {
                        const language =
                          element.getAttribute("data-language") || "";
                        const code = element.textContent || "";

                        return (
                          <SyntaxHighlighter
                            key={index}
                            language={language}
                            style={tomorrow}
                            className="rounded-md overflow-auto my-4 text-sm"
                            customStyle={{
                              padding: "1rem",
                              borderRadius: "0.375rem",
                              fontSize: "0.875rem", // 14px
                              lineHeight: "1.5",
                            }}
                          >
                            {code.trim()}
                          </SyntaxHighlighter>
                        );
                      }
                    )}
                  </>
                );
              }

              // Fallback to the original approach
              return (
                <div
                  {...props}
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              );
            }

            if (hasStrikethrough) {
              // Process strikethrough text
              const processedHtml = childrenArray
                .map((child) => {
                  if (typeof child === "string") {
                    return processStrikethrough(child);
                  }
                  return "";
                })
                .join("");
              return (
                <p
                  {...props}
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              );
            }

            return <p {...props}>{children}</p>;
          },
          // Add explicit support for del (strikethrough)
          del: ({ children }) => {
            return <del className="line-through">{children}</del>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
