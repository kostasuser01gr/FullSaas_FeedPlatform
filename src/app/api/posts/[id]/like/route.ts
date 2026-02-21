import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { toggleLike } from "@/services/reactions.service";
import { errorToResponse } from "@/lib/errors";

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/posts/[id]/like — Toggle like (auth required).
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const jwt = getUserFromRequest(req, true);
    const result = await toggleLike(params.id, jwt.sub);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
