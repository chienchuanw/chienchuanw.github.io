"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface BannerUploaderProps {
  postId?: number;
  initialImage?: string;
  onImageChange: (imageUrl: string | null) => void;
}

export default function BannerUploader({
  postId,
  initialImage,
  onImageChange,
}: BannerUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialImage || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update preview when initialImage changes
  useEffect(() => {
    if (initialImage) {
      setPreviewImage(initialImage);
    }
  }, [initialImage]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (postId) {
        formData.append("postId", postId.toString());
      }

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      toast({
        title: "Banner Uploaded",
        description: "Banner image has been uploaded successfully",
      });

      // Set the preview image and call the callback
      if (data.media && data.media.url) {
        setPreviewImage(data.media.url);
        onImageChange(data.media.url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card
      className={`border-2 ${
        dragActive ? "border-primary border-dashed" : "border-border"
      }`}
    >
      <CardContent className="p-4">
        {previewImage ? (
          <div className="relative">
            <div className="aspect-[16/9] relative overflow-hidden rounded-md">
              <Image
                src={previewImage}
                alt="Banner preview"
                fill
                className="object-cover"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full h-8 w-8"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-6 text-center aspect-[16/9] bg-muted/30"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 mb-2 text-muted-foreground" />
                <h3 className="text-lg font-medium">Upload Banner Image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop an image here or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Select Image
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Recommended size: 1600 x 900 pixels (16:9 ratio)
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
