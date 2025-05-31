import { NextRequest, NextResponse } from "next/server";
import { postService } from "@/lib/services/post-service";
import { authService } from "@/lib/services/auth-service";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure params is awaited
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Get post by ID
    const post = await postService.getById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if post is published or user is authenticated
    if (!post.published) {
      // Get authentication token
      const cookieStore = await cookies();
      const authToken = cookieStore.get("auth_token")?.value;

      if (!authToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Validate session
      const user = await authService.validateSession(authToken);

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check if user is the author or an admin
      if (user.id !== post.authorId && user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate session
    const user = await authService.validateSession(authToken);

    if (!user) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Ensure params is awaited
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Get post by ID
    const post = await postService.getById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user is the author or an admin
    if (user.id !== post.authorId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate a unique slug if title changed and slug not provided
    let newSlug = data.slug;
    if (data.title !== post.title && !data.slug) {
      newSlug = await postService.generateUniqueSlug(data.title);
    }

    // Update post
    const updatedPost = await postService.update(id, {
      title: data.title,
      slug: newSlug,
      subtitle: data.subtitle,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      tags: data.tags,
      published: data.published,
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate session
    const user = await authService.validateSession(authToken);

    if (!user) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Ensure params is awaited
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Get post by ID
    const post = await postService.getById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user is the author or an admin
    if (user.id !== post.authorId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete post
    const success = await postService.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
