"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { X, Camera } from "lucide-react";
import { mutate } from "swr";
import routes from "@/lib/routes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AvatarGallery from "./avatar-gallery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarUploaderProps {
  initialImage?: string;
  name?: string;
  onImageChange: (imageUrl: string) => void;
}

// 圖片最佳化設定
const IMAGE_CONFIG = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.8,
  format: 'image/jpeg' as const,
};

/**
 * 圖片壓縮和調整大小函數
 * 將圖片調整為指定尺寸並壓縮以提升載入效能
 */
export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      // 計算新的尺寸，保持比例
      let { width, height } = img;
      const maxWidth = IMAGE_CONFIG.maxWidth;
      const maxHeight = IMAGE_CONFIG.maxHeight;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // 設定 canvas 尺寸
      canvas.width = width;
      canvas.height = height;

      // 繪製圖片到 canvas
      ctx?.drawImage(img, 0, 0, width, height);

      // 轉換為 blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: IMAGE_CONFIG.format,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('圖片壓縮失敗'));
          }
        },
        IMAGE_CONFIG.format,
        IMAGE_CONFIG.quality
      );
    };

    img.onerror = () => reject(new Error('圖片載入失敗'));
    img.src = URL.createObjectURL(file);
  });
};

export default function AvatarUploader({
  initialImage,
  name = "",
  onImageChange,
}: AvatarUploaderProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialImage || null
  );
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const { toast } = useToast();

  // Update preview when initialImage changes
  useEffect(() => {
    if (initialImage) {
      setPreviewImage(initialImage);
    }
  }, [initialImage]);

  // Handle media selection from the gallery
  const handleMediaSelect = async (mediaUrl: string) => {
    setPreviewImage(mediaUrl);
    onImageChange(mediaUrl);
    setIsMediaGalleryOpen(false);

    // 即時更新：觸發所有使用 contact API 的 SWR hook 重新驗證
    // 註釋：這會讓 Navbar 和其他使用聯絡資訊的組件立即更新頭像
    await mutate(routes.apiContact);

    toast({
      title: "Avatar Updated",
      description: "Your avatar has been updated successfully",
      variant: "success",
    });
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-2 border-border">
          {previewImage ? (
            <AvatarImage src={previewImage} alt="Avatar preview" />
          ) : (
            <AvatarFallback className="text-3xl">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>

        <Dialog open={isMediaGalleryOpen} onOpenChange={setIsMediaGalleryOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select or Upload Avatar</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <AvatarGallery onSelect={handleMediaSelect} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {previewImage && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {
            setPreviewImage(null);
            onImageChange("");
          }}
        >
          <X className="h-3 w-3" />
          <span>Remove Avatar</span>
        </Button>
      )}
    </div>
  );
}
