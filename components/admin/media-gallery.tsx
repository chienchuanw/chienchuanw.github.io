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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImages,
  faSpinner,
  faTrash,
  faCheck,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import MediaUploader from "./media-uploader";

interface Media {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  createdAt: string;
}

interface MediaGalleryProps {
  postId?: number;
  onSelect: (mediaUrl: string) => void;
  // If true, don't render the Dialog wrapper (for use in other components)
  noDialog?: boolean;
  // External open state (for use with noDialog)
  isOpen?: boolean;
  // External open state change handler (for use with noDialog)
  onOpenChange?: (open: boolean) => void;
}

export default function MediaGallery({
  postId,
  onSelect,
  noDialog = false,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: MediaGalleryProps) {
  // Use internal state if not provided externally
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external or internal state based on props
  const isOpen = noDialog ? externalIsOpen : internalIsOpen;
  const setIsOpen = noDialog
    ? (open: boolean) => externalOnOpenChange?.(open)
    : setInternalIsOpen;
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [postMedia, setPostMedia] = useState<Media[]>([]);
  const [unassociatedMedia, setUnassociatedMedia] = useState<Media[]>([]);
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

      // If postId is provided, fetch media specific to this post
      if (postId) {
        const postMediaResponse = await fetch(`/api/media?postId=${postId}`);
        if (postMediaResponse.ok) {
          const postMediaData = await postMediaResponse.json();
          setPostMedia(postMediaData.media || []);
        }
      }

      // Fetch unassociated media
      const unassociatedResponse = await fetch("/api/media?unassociated=true");
      if (unassociatedResponse.ok) {
        const unassociatedData = await unassociatedResponse.json();
        setUnassociatedMedia(unassociatedData.media || []);
      }
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
  const fetchMediaCallback = useCallback(fetchMedia, [postId]);

  useEffect(() => {
    if (isOpen) {
      fetchMediaCallback();
    }
  }, [isOpen, fetchMediaCallback]);

  // For external control, fetch media when component mounts if noDialog is true
  useEffect(() => {
    if (noDialog && externalIsOpen) {
      fetchMediaCallback();
    }
  }, [noDialog, externalIsOpen, fetchMediaCallback]);

  const handleSelect = (mediaUrl: string) => {
    onSelect(mediaUrl);
    setIsOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this media?")) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete media");
      }

      // Remove the deleted media from all lists
      setMedia(media.filter((item) => item.id !== id));
      setPostMedia(postMedia.filter((item) => item.id !== id));
      setUnassociatedMedia(unassociatedMedia.filter((item) => item.id !== id));

      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  const handleUploadComplete = () => {
    // Refresh the media lists
    fetchMedia();
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const isVideo = (mimeType: string) => mimeType.startsWith("video/");
  const isPdf = (mimeType: string) => mimeType === "application/pdf";

  // State for video thumbnails and loading status
  const [videoThumbnails, setVideoThumbnails] = useState<
    Record<number, string>
  >({});
  const [failedThumbnails, setFailedThumbnails] = useState<
    Record<number, boolean>
  >({});

  // Function to generate video thumbnail
  const generateVideoThumbnail = (videoUrl: string, videoId: number) => {
    // Check if we already have a thumbnail for this video
    if (videoThumbnails[videoId]) return;

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.muted = true;
    video.currentTime = 1; // Seek to 1 second to avoid black frames

    // When video metadata is loaded, we can seek
    video.onloadedmetadata = () => {
      // Seek to 25% of the video duration for a representative frame
      video.currentTime = video.duration * 0.25;
    };

    // When the video is seeked, capture the frame
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL("image/jpeg");

        // Update the thumbnails state
        setVideoThumbnails((prev) => ({
          ...prev,
          [videoId]: thumbnailUrl,
        }));
      }
    };

    // Handle errors
    video.onerror = () => {
      console.error("Error generating thumbnail for video:", videoUrl);
      setFailedThumbnails((prev) => ({
        ...prev,
        [videoId]: true,
      }));
    };

    // Set a timeout to mark as failed if it takes too long
    const timeoutId = setTimeout(() => {
      if (!videoThumbnails[videoId]) {
        setFailedThumbnails((prev) => ({
          ...prev,
          [videoId]: true,
        }));
      }
    }, 5000); // 5 seconds timeout

    // Load the video
    video.load();

    // Return a cleanup function (this will be used by useEffect if needed)
    return () => clearTimeout(timeoutId);
  };

  // Generate thumbnails for videos when media list changes
  useEffect(() => {
    media.forEach((item) => {
      if (
        isVideo(item.mimeType) &&
        !videoThumbnails[item.id] &&
        !failedThumbnails[item.id]
      ) {
        generateVideoThumbnail(item.url, item.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, videoThumbnails, failedThumbnails]);

  const renderMediaItem = (item: Media) => (
    <Card key={item.id} className="overflow-hidden group relative">
      <CardContent className="p-0">
        {isImage(item.mimeType) ? (
          <img
            src={item.url}
            alt={item.filename}
            className="w-full h-32 object-cover"
          />
        ) : isVideo(item.mimeType) ? (
          <div className="w-full h-32 bg-muted relative">
            {videoThumbnails[item.id] ? (
              <>
                <img
                  src={videoThumbnails[item.id]}
                  alt={`Thumbnail for ${item.filename}`}
                  className="w-full h-full object-cover"
                />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 rounded-full p-2">
                    <FontAwesomeIcon
                      icon={faPlay}
                      className="h-6 w-6 text-white"
                    />
                  </div>
                </div>
              </>
            ) : failedThumbnails[item.id] ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-800">
                <FontAwesomeIcon
                  icon={faPlay}
                  className="h-8 w-8 text-white mb-2"
                />
                <span className="text-xs text-white">Video</span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="h-6 w-6 animate-spin text-muted-foreground"
                />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
              {item.filename}
            </div>
          </div>
        ) : isPdf(item.mimeType) ? (
          <div className="w-full h-32 bg-muted flex items-center justify-center">
            <span className="text-xs text-center p-2">
              PDF: {item.filename}
            </span>
          </div>
        ) : (
          <div className="w-full h-32 bg-muted flex items-center justify-center">
            <span className="text-xs text-center p-2">
              File: {item.filename}
            </span>
          </div>
        )}
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
  );

  // Render the content with or without Dialog wrapper
  const renderContent = () => (
    <>
      <DialogHeader>
        <DialogTitle>Media Gallery</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload New</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="py-4">
          <MediaUploader
            postId={postId}
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>

        <TabsContent value="images" className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <FontAwesomeIcon
                icon={faSpinner}
                className="h-8 w-8 animate-spin"
              />
            </div>
          ) : (
            <>
              {/* Filter media to only show images */}
              {(() => {
                const imageMedia = media.filter((item) =>
                  isImage(item.mimeType)
                );
                return imageMedia.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No images found
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageMedia.map(renderMediaItem)}
                  </div>
                );
              })()}
            </>
          )}
        </TabsContent>

        <TabsContent value="videos" className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <FontAwesomeIcon
                icon={faSpinner}
                className="h-8 w-8 animate-spin"
              />
            </div>
          ) : (
            <>
              {/* Filter media to only show videos */}
              {(() => {
                const videoMedia = media.filter((item) =>
                  isVideo(item.mimeType)
                );
                return videoMedia.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No videos found
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {videoMedia.map(renderMediaItem)}
                  </div>
                );
              })()}
            </>
          )}
        </TabsContent>
      </Tabs>
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
          Media Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">{renderContent()}</DialogContent>
    </Dialog>
  );
}
