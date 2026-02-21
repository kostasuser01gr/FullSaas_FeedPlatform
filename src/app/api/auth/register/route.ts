import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { registerUser } from "@/services/auth.service";
import { setTokenCookie } from "@/lib/auth";
import { errorToResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION", message: "Invalid input", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { username, displayName, password } = parsed.data;
    const result = await registerUser(username, displayName, password);

    // Set httpOnly cookie for browser clients
    setTokenCookie(result.accessToken);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    const { status, body } = errorToResponse(err);
    return NextResponse.json(body, { status });
  }
}
