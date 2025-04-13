import { NextRequest, NextResponse } from "next/server";
import { mediaService } from "@/lib/services/media-service";
import { authService } from "@/lib/services/auth-service";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is awaited
    const { id: idStr } = await Promise.resolve(params);
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    // Get media by ID
    const mediaItem = await mediaService.getById(id);

    if (!mediaItem) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ media: mediaItem });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { id: idStr } = await Promise.resolve(params);
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    // Get media by ID
    const mediaItem = await mediaService.getById(id);

    if (!mediaItem) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Check if user is the author or an admin
    if (user.id !== mediaItem.authorId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete media
    const success = await mediaService.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete media" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { id: idStr } = await Promise.resolve(params);
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    // Get media by ID
    const mediaItem = await mediaService.getById(id);

    if (!mediaItem) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Check if user is the author or an admin
    if (user.id !== mediaItem.authorId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();

    // Update post ID
    const updatedMedia = await mediaService.updatePostId(id, data.postId);

    if (!updatedMedia) {
      return NextResponse.json(
        { error: "Failed to update media" },
        { status: 500 }
      );
    }

    return NextResponse.json({ media: updatedMedia });
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}
