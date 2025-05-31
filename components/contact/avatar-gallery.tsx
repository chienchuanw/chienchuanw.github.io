"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Check, Trash } from "lucide-react";
import MediaUploader from "@/components/admin/media-uploader";

interface Media {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  createdAt: string;
}

interface AvatarGalleryProps {
  onSelect: (mediaUrl: string) => void;
}

export default function AvatarGallery({ onSelect }: AvatarGalleryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const { toast } = useToast();

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      // Fetch all media for the user
      const response = await fetch("/api/media");
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
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchMediaCallback = useCallback(fetchMedia, []);

  useEffect(() => {
    fetchMediaCallback();
  }, [fetchMediaCallback]);

  const handleSelect = (mediaUrl: string) => {
    onSelect(mediaUrl);
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

  const handleUploadComplete = (mediaUrl: string) => {
    // Refresh the media lists
    fetchMedia();
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  const renderMediaItem = (item: Media) => (
    <Card key={item.id} className="overflow-hidden group relative">
      <CardContent className="p-0">
        {isImage(item.mimeType) ? (
          <img
            src={item.url}
            alt={item.filename}
            className="w-full h-32 object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSelect(item.url)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(item.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload New</TabsTrigger>
          <TabsTrigger value="images">Select Existing</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="py-4">
          <MediaUploader
            onUploadComplete={handleUploadComplete}
            enableImageOptimization={true}
          />
        </TabsContent>

        <TabsContent value="images" className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Filter media to only show images */}
              {(() => {
                const imageMedia = media.filter((item) => isImage(item.mimeType));
                return imageMedia.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No images found. Upload an image first.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                    {imageMedia.map(renderMediaItem)}
                  </div>
                );
              })()}
            </>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}