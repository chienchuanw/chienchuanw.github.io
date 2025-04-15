"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Camera } from "lucide-react";
import Image from "next/image";
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

export default function AvatarUploader({
  initialImage,
  name = "",
  onImageChange,
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
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
  const handleMediaSelect = (mediaUrl: string) => {
    setPreviewImage(mediaUrl);
    onImageChange(mediaUrl);
    setIsMediaGalleryOpen(false);

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
