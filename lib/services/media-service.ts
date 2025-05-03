import { eq, desc, and, isNull } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { media, Media, NewMedia } from '../db/schema';

// Define allowed file types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  // Documents
  'application/pdf',
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Base upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Base URL for accessing uploads
const UPLOAD_BASE_URL = '/uploads';

export const mediaService = {
  /**
   * Ensure upload directory exists
   */
  async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
  },

  /**
   * Validate file before upload
   */
  validateFile(file: { size: number; type: string; name: string }): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds the maximum allowed size (${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
      };
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed',
      };
    }

    return { valid: true };
  },

  /**
   * Save uploaded file to disk
   */
  async saveFile(
    file: { arrayBuffer: () => Promise<ArrayBuffer>; name: string; type: string; size: number },
    authorId: number,
    postId?: number
  ): Promise<Media> {
    // Ensure upload directory exists
    await this.ensureUploadDir();

    // Generate unique filename
    const fileExt = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${fileExt}`;

    // Create year/month based directory structure
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const uploadPath = path.join(UPLOAD_DIR, yearMonth);

    // Ensure year/month directory exists
    await fs.mkdir(uploadPath, { recursive: true });

    // Full path to save the file
    const filePath = path.join(uploadPath, uniqueFilename);

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Calculate relative path for database
    const relativePath = path.join(yearMonth, uniqueFilename);

    // Create URL for accessing the file
    const fileUrl = `${UPLOAD_BASE_URL}/${yearMonth}/${uniqueFilename}`;

    // Save file info to database
    const newMedia: NewMedia = {
      filename: uniqueFilename,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      path: relativePath,
      url: fileUrl,
      authorId,
      postId: postId || null,
    };

    const result = await db.insert(media).values(newMedia).returning();

    return result[0];
  },

  /**
   * Get media by ID
   */
  async getById(id: number): Promise<Media | undefined> {
    const result = await db.select().from(media).where(eq(media.id, id));
    return result[0];
  },

  /**
   * Get all media for a post
   */
  async getByPostId(postId: number): Promise<Media[]> {
    const result = await db
      .select()
      .from(media)
      .where(eq(media.postId, postId))
      .orderBy(desc(media.createdAt));

    return result;
  },

  /**
   * Get all media for a user
   */
  async getByAuthorId(authorId: number, limit = 50): Promise<Media[]> {
    const result = await db
      .select()
      .from(media)
      .where(eq(media.authorId, authorId))
      .orderBy(desc(media.createdAt))
      .limit(limit);

    return result;
  },

  /**
   * Delete media by ID
   */
  async delete(id: number): Promise<boolean> {
    // Get media info
    const mediaItem = await this.getById(id);

    if (!mediaItem) {
      return false;
    }

    // Delete file from disk
    try {
      const filePath = path.join(UPLOAD_DIR, mediaItem.path);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const result = await db
      .delete(media)
      .where(eq(media.id, id))
      .returning({ id: media.id });

    return result.length > 0;
  },

  /**
   * Update media post association
   */
  async updatePostId(id: number, postId: number | null): Promise<Media | undefined> {
    const result = await db
      .update(media)
      .set({
        postId,
        updatedAt: new Date(),
      })
      .where(eq(media.id, id))
      .returning();

    if (result.length === 0) {
      return undefined;
    }

    return result[0];
  },

  /**
   * Get all unassociated media for a user
   */
  async getUnassociatedByAuthorId(authorId: number): Promise<Media[]> {
    const result = await db
      .select()
      .from(media)
      .where(
        and(
          eq(media.authorId, authorId),
          // Use isNull instead of eq for null comparison
          isNull(media.postId)
        )
      )
      .orderBy(desc(media.createdAt));

    return result;
  }
};
