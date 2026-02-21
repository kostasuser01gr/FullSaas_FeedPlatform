import { NextRequest, NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  clearTokenCookie();
  return NextResponse.json({ success: true, data: null });
}
