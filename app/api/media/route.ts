import { NextRequest, NextResponse } from 'next/server';
import { mediaService } from '@/lib/services/media-service';
import { authService } from '@/lib/services/auth-service';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate session
    const user = await authService.validateSession(authToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId') ? parseInt(searchParams.get('postId')!) : undefined;
    const unassociated = searchParams.get('unassociated') === 'true';

    let mediaItems;

    const userId = user.id as number;

    if (unassociated) {
      // Get unassociated media
      mediaItems = await mediaService.getUnassociatedByAuthorId(userId);
    } else if (postId) {
      // Get media for a specific post
      mediaItems = await mediaService.getByPostId(postId);
    } else {
      // Get all media for the user
      mediaItems = await mediaService.getByAuthorId(userId);
    }

    return NextResponse.json({ media: mediaItems });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate session
    const user = await authService.validateSession(authToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postIdStr = formData.get('postId') as string | null;
    const postId = postIdStr ? parseInt(postIdStr) : undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = mediaService.validateFile(file);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Save file
    const userId = user.id as number;
    const savedMedia = await mediaService.saveFile(file, userId, postId);

    return NextResponse.json({ media: savedMedia });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
