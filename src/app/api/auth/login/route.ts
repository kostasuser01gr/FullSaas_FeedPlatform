import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { loginUser } from "@/services/auth.service";
import { setTokenCookie } from "@/lib/auth";
import { errorToResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Invalid input", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;
    const result = await loginUser(username, password);

    setTokenCookie(result.accessToken);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
