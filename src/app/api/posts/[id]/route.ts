import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getPostById, deletePost } from "@/services/posts.service";
import { errorToResponse } from "@/lib/errors";

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/posts/[id] — Single post.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = getUserFromRequest(req, false);
    const post = await getPostById(params.id, user?.sub ?? null);
    return NextResponse.json({ success: true, data: post });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

/**
 * DELETE /api/posts/[id] — Delete own post (auth required).
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const jwt = getUserFromRequest(req, true);
    await deletePost(params.id, jwt.sub);
    return NextResponse.json({ success: true, data: null });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
