import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getUserById } from "@/services/auth.service";
import { errorToResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const jwt = getUserFromRequest(req, true);
    const user = await getUserById(jwt.sub);
    return NextResponse.json({ success: true, data: { user } });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
