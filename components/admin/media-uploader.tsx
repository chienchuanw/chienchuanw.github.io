'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { compressImage } from '@/components/contact/avatar-uploader';

interface MediaUploaderProps {
  postId?: number;
  onUploadComplete?: (mediaUrl: string) => void;
  enableImageOptimization?: boolean; // 是否啟用圖片最佳化
}

export default function MediaUploader({
  postId,
  onUploadComplete,
  enableImageOptimization = false
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      let fileToUpload = file;

      // 如果啟用圖片最佳化且檔案是圖片，則進行壓縮
      if (enableImageOptimization && file.type.startsWith('image/')) {
        try {
          fileToUpload = await compressImage(file);
          toast({
            title: 'Image Optimized',
            description: 'Image has been compressed for better performance',
            variant: 'default',
          });
        } catch (error) {
          console.warn('圖片壓縮失敗，使用原始檔案:', error);
          // 如果壓縮失敗，繼續使用原始檔案
        }
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);

      if (postId) {
        formData.append('postId', postId.toString());
      }
      
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Upload Successful',
        description: 'Media file has been uploaded',
      });
      
      // Call the callback with the media URL
      if (onUploadComplete && data.media) {
        onUploadComplete(data.media.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };



  return (
    <Card className={`border-2 ${dragActive ? 'border-primary border-dashed' : 'border-border'}`}>
      <CardContent className="p-4">
        <div
          className="flex flex-col items-center justify-center p-6 text-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <FontAwesomeIcon icon={faUpload} className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">Upload Media</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop files here or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*,application/pdf"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Select File
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: JPEG, PNG, GIF, WebP, SVG, MP4, WebM, PDF
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
