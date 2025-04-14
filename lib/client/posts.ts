import { Post } from "@/lib/store/useBlogStore";

// Base URL for API calls
const API_BASE_URL = "/api/posts";

/**
 * Fetch all posts with optional filtering
 */
export async function fetchPosts(
  options: {
    page?: number;
    limit?: number;
    publishedOnly?: boolean;
    searchTerm?: string;
    orderBy?: "createdAt" | "updatedAt" | "title";
    orderDirection?: "asc" | "desc";
  } = {}
): Promise<{ posts: Post[]; total: number }> {
  const {
    page = 1,
    limit = 10,
    publishedOnly = false,
    searchTerm,
    orderBy = "createdAt",
    orderDirection = "desc",
  } = options;

  // Build query string
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (publishedOnly) {
    params.append("publishedOnly", "true");
  }

  if (searchTerm) {
    params.append("search", searchTerm);
  }

  params.append("orderBy", orderBy);
  params.append("orderDirection", orderDirection);

  // Make API request
  const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch posts");
  }

  return await response.json();
}

/**
 * Fetch a single post by slug
 */
export async function fetchPostBySlug(slug: string): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/${slug}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch post");
  }

  const data = await response.json();
  return data.post;
}

/**
 * Fetch a single post by ID
 */
export async function fetchPostById(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/id/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch post");
  }

  const data = await response.json();
  return data.post;
}

/**
 * Create a new post
 */
export async function createPost(postData: {
  title: string;
  slug?: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}): Promise<Post> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create post");
  }

  const data = await response.json();
  return data.post;
}

/**
 * Update an existing post
 */
export async function updatePost(
  id: number,
  postData: {
    title?: string;
    slug?: string;
    subtitle?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    published?: boolean;
  }
): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/id/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update post");
  }

  const data = await response.json();
  return data.post;
}

/**
 * Delete a post
 */
export async function deletePost(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/id/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete post");
  }

  const data = await response.json();
  return data.success;
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate an excerpt from content
 */
export function generateExcerpt(
  content: string,
  maxLength: number = 150
): string {
  // Remove Markdown syntax
  const plainText = content
    .replace(/#+\s+/g, "") // Remove headings
    .replace(/\*\*|\*|~~|`/g, "") // Remove bold, italic, strikethrough, inline code
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace images and links with text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/>\s[^\n]*/g, ""); // Remove quotes

  // Truncate and add ellipsis
  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + "...";
}
