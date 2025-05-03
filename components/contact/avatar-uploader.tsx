"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import AvatarGallery from "./avatar-gallery";
import Image from "next/image";

interface AvatarUploaderProps {
  initialImage?: string;
  onImageChange: (imageUrl: string | null) => void;
}

export default function AvatarUploader({
  initialImage,
  onImageChange,
}: AvatarUploaderProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialImage || null
  );

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Note: File upload is now handled through the AvatarGallery component

  // Handle image selection from gallery
  const handleSelectImage = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    onImageChange(imageUrl);
  };

  return (
    <div className="space-y-4">
      {previewImage ? (
        <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
          <div className="relative w-full h-full">
            <Image
              src={previewImage}
              alt="Avatar preview"
              fill
              className="object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute bottom-0 right-0"
            onClick={() => {
              setPreviewImage(null);
              onImageChange(null);
            }}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="mx-auto w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
          <FontAwesomeIcon
            icon={faUpload}
            className="h-8 w-8 text-muted-foreground"
          />
        </div>
      )}

      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsGalleryOpen(true)}
        >
          <FontAwesomeIcon icon={faUpload} className="h-4 w-4 mr-2" />
          Choose Avatar
        </Button>
      </div>

      {/* Avatar Gallery Dialog */}
      <AvatarGallery
        noDialog={true}
        isOpen={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelect={handleSelectImage}
      />
    </div>
  );
}