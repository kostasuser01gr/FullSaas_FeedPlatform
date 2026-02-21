import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { commentsQuerySchema, createCommentSchema } from "@/lib/validation";
import { getComments, addComment } from "@/services/comments.service";
import { errorToResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/posts/[id]/comments — Paginated comments (oldest first).
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = commentsQuerySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Invalid query", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const page = await getComments(params.id, parsed.data.cursor, parsed.data.limit);
    return NextResponse.json({ success: true, data: page });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/posts/[id]/comments — Add comment (auth required).
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const jwt = getUserFromRequest(req, true);
    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Invalid input", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const comment = await addComment(params.id, jwt.sub, parsed.data.content);
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
