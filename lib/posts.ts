import { Post as DbPost } from "./db/schema";
import { Post as StorePost } from "./store/useBlogStore";
import * as clientPosts from "./client/posts";

// Export the Post type from the store for backward compatibility
export type Post = StorePost;

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return clientPosts.generateSlug(title);
}

/**
 * Generate an excerpt from content
 */
export function generateExcerpt(
  content: string,
  maxLength: number = 150
): string {
  return clientPosts.generateExcerpt(content, maxLength);
}

/**
 * Create a new post
 */
export async function createPost(postData: Partial<Post>): Promise<Post> {
  try {
    return await clientPosts.createPost({
      title: postData.title || "Untitled Post",
      slug: postData.slug || generateSlug(postData.title || "Untitled Post"),
      content: postData.content || "",
      excerpt: postData.excerpt || "",
      coverImage: postData.coverImage,
      tags: postData.tags || [],
      published: postData.published || false,
    });
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
}

/**
 * Get all posts
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const { posts } = await clientPosts.fetchPosts({ limit: 100 });
    return posts;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

/**
 * Get a post by ID
 */
export async function getPostById(id: number): Promise<Post | null> {
  try {
    return await clientPosts.fetchPostById(id);
  } catch (error) {
    console.error(`Failed to fetch post with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get a post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    return await clientPosts.fetchPostBySlug(slug);
  } catch (error) {
    console.error(`Failed to fetch post with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Update a post
 */
export async function updatePost(
  id: number,
  updates: Partial<Post>
): Promise<Post | null> {
  try {
    return await clientPosts.updatePost(id, updates);
  } catch (error) {
    console.error(`Failed to update post with ID ${id}:`, error);
    return null;
  }
}

/**
 * Delete a post
 */
export async function deletePost(id: number): Promise<boolean> {
  try {
    return await clientPosts.deletePost(id);
  } catch (error) {
    console.error(`Failed to delete post with ID ${id}:`, error);
    return false;
  }
}
