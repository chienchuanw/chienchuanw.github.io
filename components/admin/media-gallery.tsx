'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages, faSpinner, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import MediaUploader from './media-uploader';

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
}

export default function MediaGallery({ postId, onSelect }: MediaGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [postMedia, setPostMedia] = useState<Media[]>([]);
  const [unassociatedMedia, setUnassociatedMedia] = useState<Media[]>([]);
  const { toast } = useToast();

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      // Fetch all media for the user
      const response = await fetch('/api/media');
      if (!response.ok) {
        throw new Error('Failed to fetch media');
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
      const unassociatedResponse = await fetch('/api/media?unassociated=true');
      if (unassociatedResponse.ok) {
        const unassociatedData = await unassociatedResponse.json();
        setUnassociatedMedia(unassociatedData.media || []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, postId]);

  const handleSelect = (mediaUrl: string) => {
    onSelect(mediaUrl);
    setIsOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this media?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete media');
      }
      
      // Remove the deleted media from all lists
      setMedia(media.filter(item => item.id !== id));
      setPostMedia(postMedia.filter(item => item.id !== id));
      setUnassociatedMedia(unassociatedMedia.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Media deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'destructive',
      });
    }
  };

  const handleUploadComplete = (mediaUrl: string) => {
    // Refresh the media lists
    fetchMedia();
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');
  const isPdf = (mimeType: string) => mimeType === 'application/pdf';

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
          <div className="w-full h-32 bg-muted flex items-center justify-center">
            <span className="text-xs text-center p-2">Video: {item.filename}</span>
          </div>
        ) : isPdf(item.mimeType) ? (
          <div className="w-full h-32 bg-muted flex items-center justify-center">
            <span className="text-xs text-center p-2">PDF: {item.filename}</span>
          </div>
        ) : (
          <div className="w-full h-32 bg-muted flex items-center justify-center">
            <span className="text-xs text-center p-2">File: {item.filename}</span>
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          <FontAwesomeIcon icon={faImages} className="h-4 w-4 mr-2" />
          Media Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media Gallery</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload New</TabsTrigger>
            {postId && <TabsTrigger value="post">Post Media</TabsTrigger>}
            <TabsTrigger value="all">All Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="py-4">
            <MediaUploader postId={postId} onUploadComplete={handleUploadComplete} />
          </TabsContent>
          
          {postId && (
            <TabsContent value="post" className="py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin" />
                </div>
              ) : postMedia.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No media attached to this post yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {postMedia.map(renderMediaItem)}
                </div>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="all" className="py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin" />
              </div>
            ) : media.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No media found</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map(renderMediaItem)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
