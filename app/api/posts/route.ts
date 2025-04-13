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
    console.log("POST /api/posts - Start");
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    console.log("Auth token:", authToken ? "Present" : "Missing");
    if (!authToken) {
      console.log("Unauthorized - No auth token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate session
    console.log("Validating session...");
    const user = await authService.validateSession(authToken);

    console.log(
      "User from session:",
      user ? `ID: ${user.id}, Username: ${user.username}` : "No user found"
    );
    if (!user) {
      console.log("Unauthorized - Session expired or invalid");
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();
    console.log("Request data:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.title || !data.content) {
      console.log("Bad request - Missing title or content");
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate a unique slug if not provided
    if (!data.slug) {
      console.log("Generating slug from title:", data.title);
      data.slug = await postService.generateUniqueSlug(data.title);
    }

    console.log("Creating post with user ID:", user.id);
    // Create post
    const post = await postService.create({
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      tags: data.tags || [],
      published: data.published || false,
      authorId: user.id,
    });

    console.log(
      "Post created successfully:",
      post ? `ID: ${post.id}, Title: ${post.title}` : "No post returned"
    );
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
