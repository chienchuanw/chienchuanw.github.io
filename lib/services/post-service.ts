import { eq, desc, asc, like, and, or, sql } from "drizzle-orm";
import db from "../db";
import { posts, Post, NewPost, users } from "../db/schema";

export const postService = {
  /**
   * Create a new post
   */
  async create(
    postData: Omit<NewPost, "createdAt" | "updatedAt" | "publishedAt">
  ): Promise<Post> {
    try {
      // Set publishedAt timestamp if the post is being published
      const publishedAt = postData.published ? new Date() : null;

      const result = await db
        .insert(posts)
        .values({
          ...postData,
          publishedAt,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  /**
   * Get all posts with optional filtering and pagination
   */
  async getAll(
    options: {
      page?: number;
      limit?: number;
      publishedOnly?: boolean;
      authorId?: number;
      searchTerm?: string;
      orderBy?: "createdAt" | "updatedAt" | "publishedAt" | "title";
      orderDirection?: "asc" | "desc";
    } = {}
  ): Promise<{ posts: Post[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      publishedOnly = false,
      authorId,
      searchTerm,
      orderBy = "createdAt",
      orderDirection = "desc",
    } = options;

    // Build where conditions
    const whereConditions = [];

    if (publishedOnly) {
      whereConditions.push(eq(posts.published, true));
    }

    if (authorId) {
      whereConditions.push(eq(posts.authorId, authorId));
    }

    if (searchTerm) {
      whereConditions.push(
        or(
          like(posts.title, `%${searchTerm}%`),
          like(posts.content, `%${searchTerm}%`),
          like(posts.excerpt, `%${searchTerm}%`)
        )
      );
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Build order by
    let orderByClause;
    if (orderBy === "createdAt") {
      orderByClause =
        orderDirection === "desc"
          ? desc(posts.createdAt)
          : asc(posts.createdAt);
    } else if (orderBy === "updatedAt") {
      orderByClause =
        orderDirection === "desc"
          ? desc(posts.updatedAt)
          : asc(posts.updatedAt);
    } else if (orderBy === "publishedAt") {
      orderByClause =
        orderDirection === "desc"
          ? desc(posts.publishedAt)
          : asc(posts.publishedAt);
    } else if (orderBy === "title") {
      orderByClause =
        orderDirection === "desc" ? desc(posts.title) : asc(posts.title);
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = countResult[0]?.count || 0;

    // Get posts with pagination and ordering
    const query = db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .limit(limit)
      .offset(offset);

    // Add where clause if needed
    if (whereConditions.length > 0) {
      query.where(and(...whereConditions));
    }

    // Add order by clause if needed
    if (orderByClause) {
      query.orderBy(orderByClause);
    }

    const result = await query;

    // Map the results to include authorName
    const mappedPosts = result.map((row) => ({
      ...row.posts,
      authorName: row.users?.displayName || undefined,
    }));

    return {
      posts: mappedPosts,
      total,
    };
  },

  /**
   * Get a post by ID
   */
  async getById(id: number): Promise<Post | undefined> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id));

    if (result.length === 0) {
      return undefined;
    }

    return {
      ...result[0].posts,
      authorName: result[0].users?.displayName || undefined,
    };
  },

  /**
   * Get a post by slug
   */
  async getBySlug(slug: string): Promise<Post | undefined> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.slug, slug));

    if (result.length === 0) {
      return undefined;
    }

    return {
      ...result[0].posts,
      authorName: result[0].users?.displayName || undefined,
    };
  },

  /**
   * Update a post
   */
  async update(
    id: number,
    postData: Partial<Omit<NewPost, "createdAt" | "updatedAt" | "publishedAt">>
  ): Promise<Post | undefined> {
    // Get the current post to check if it's being published for the first time
    const currentPost = await this.getById(id);

    // Determine if we need to set publishedAt
    let publishedAt = undefined;

    if (currentPost && postData.published !== undefined) {
      // If post is being published for the first time, set publishedAt to now
      if (postData.published && !currentPost.published) {
        publishedAt = new Date();
      }
      // If post is being unpublished, don't change the publishedAt (keep record of when it was published)
    }

    const result = await db
      .update(posts)
      .set({
        ...postData,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    if (result.length === 0) {
      return undefined;
    }

    return result[0];
  },

  /**
   * Delete a post
   */
  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning({ id: posts.id });

    return result.length > 0;
  },

  /**
   * Generate a unique slug from a title
   */
  async generateUniqueSlug(title: string): Promise<string> {
    // Convert title to slug format
    let slug = title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists
    let existingPost = await this.getBySlug(slug);
    let counter = 1;

    // If slug exists, append a number until we find a unique one
    while (existingPost) {
      slug = `${slug}-${counter}`;
      existingPost = await this.getBySlug(slug);
      counter++;
    }

    return slug;
  },
};
