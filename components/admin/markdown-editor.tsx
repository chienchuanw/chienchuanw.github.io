"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MediaGallery from "./media-gallery";
import MediaUploader from "./media-uploader";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faCircleInfo } from "@fortawesome/free-solid-svg-icons";

// Dynamically import MD editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

// Dynamically import MD preview component
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

  // Dark mode detection
  const [darkMode] = useState<"dark" | "light">(() => {
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
                <DialogHeader>
                  <DialogTitle>Media Gallery</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="upload">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload New</TabsTrigger>
                    {postId && (
                      <TabsTrigger value="post">Post Media</TabsTrigger>
                    )}
                    <TabsTrigger value="all">All Media</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="py-4">
                    <MediaUploader
                      postId={postId}
                      onUploadComplete={(url: string) => {
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
                  </TabsContent>

                  {postId && (
                    <TabsContent value="post" className="py-4">
                      <MediaGallery
                        postId={postId}
                        onSelect={(url) => {
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
                    </TabsContent>
                  )}

                  <TabsContent value="all" className="py-4">
                    <MediaGallery
                      onSelect={(url) => {
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
                  </TabsContent>
                </Tabs>
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
  const [darkMode] = useState<"dark" | "light">(() => {
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
