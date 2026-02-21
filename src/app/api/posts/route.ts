import { NextRequest, NextResponse } from "next/server";
import { feedQuerySchema, createPostSchema } from "@/lib/validation";
import { getUserFromRequest } from "@/lib/auth";
import { getFeed, createPost } from "@/services/posts.service";
import { errorToResponse } from "@/lib/errors";

/**
 * GET /api/posts — Paginated feed with cursor, sort, search, filter.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const raw = Object.fromEntries(url.searchParams.entries());
    const parsed = feedQuerySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Invalid query", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const user = getUserFromRequest(req, false);
    const page = await getFeed(parsed.data, user?.sub ?? null);

    return NextResponse.json({ success: true, data: page });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}

/**
 * POST /api/posts — Create a new post (auth required).
 */
export async function POST(req: NextRequest) {
  try {
    const jwt = getUserFromRequest(req, true);
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Invalid input", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const post = await createPost(
      jwt.sub,
      parsed.data.content,
      parsed.data.imageUrl ?? null,
    );

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
