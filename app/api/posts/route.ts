import { NextRequest, NextResponse } from "next/server";
import { postService } from "@/lib/services/post-service";
import { authService } from "@/lib/services/auth-service";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const publishedOnly = searchParams.get("publishedOnly") === "true";
    const searchTerm = searchParams.get("search") || undefined;
    const orderBy =
      (searchParams.get("orderBy") as "createdAt" | "updatedAt" | "title") ||
      "createdAt";
    const orderDirection =
      (searchParams.get("orderDirection") as "asc" | "desc") || "desc";

    // Get posts with pagination
    const { posts, total } = await postService.getAll({
      page,
      limit,
      publishedOnly,
      searchTerm,
      orderBy,
      orderDirection,
    });

    return NextResponse.json({ posts, total });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate a unique slug if not provided
    if (!data.slug) {
      data.slug = await postService.generateUniqueSlug(data.title);
    }

    // Create post
    const post = await postService.create({
      title: data.title,
      slug: data.slug,
      subtitle: data.subtitle,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      tags: data.tags || [],
      published: data.published || false,
      authorId: user.id,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
