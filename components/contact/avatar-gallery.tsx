"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImages,
  faSpinner,
  faTrash,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface Media {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  createdAt: string;
}

interface AvatarGalleryProps {
  onSelect: (mediaUrl: string) => void;
  // If true, don't render the Dialog wrapper (for use in other components)
  noDialog?: boolean;
  // External open state (for use with noDialog)
  isOpen?: boolean;
  // External open state change handler (for use with noDialog)
  onOpenChange?: (open: boolean) => void;
}

export default function AvatarGallery({
  onSelect,
  noDialog = false,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: AvatarGalleryProps) {
  // Use internal state if not provided externally
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external or internal state based on props
  const isOpen = noDialog ? externalIsOpen : internalIsOpen;
  const setIsOpen = noDialog
    ? (open: boolean) => externalOnOpenChange?.(open)
    : setInternalIsOpen;
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const { toast } = useToast();

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all image media for the user
      const response = await fetch("/api/media?type=image");
      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  // For external control, fetch media when component mounts if noDialog is true
  useEffect(() => {
    if (noDialog && externalIsOpen) {
      fetchMedia();
    }
  }, [noDialog, externalIsOpen, fetchMedia]);

  const handleSelect = (url: string) => {
    onSelect(url);
    setIsOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete media");
      }

      // Remove the deleted media from the list
      setMedia(media.filter((item) => item.id !== id));

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  // Render the content with or without Dialog wrapper
  const renderContent = () => (
    <>
      <DialogHeader>
        <DialogTitle>Avatar Gallery</DialogTitle>
      </DialogHeader>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {media.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No images found. Please upload an image first.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {media.map((item) => (
                <Card key={item.id} className="overflow-hidden group relative">
                  <CardContent className="p-0">
                    <div className="relative w-full h-32">
                      <Image
                        src={item.url}
                        alt={item.filename}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSelect(item.url)}
                      >
                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );

  // If noDialog is true, just return the content
  if (noDialog) {
    return renderContent();
  }

  // Otherwise wrap in Dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          <FontAwesomeIcon icon={faImages} className="h-4 w-4 mr-2" />
          Choose Avatar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">{renderContent()}</DialogContent>
    </Dialog>
  );
}