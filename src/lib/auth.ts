import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { JwtPayload } from "@/types";
import { AppError } from "./errors";

// ── Config ──
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
const TOKEN_COOKIE = "feed_token";

// ── Password hashing ──
export function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// ── JWT ──
export function signToken(userId: string, username: string): string {
  const payload: JwtPayload = { sub: userId, username };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ── Cookie-based token storage (secure in production) ──
export function setTokenCookie(token: string) {
  cookies().set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearTokenCookie() {
  cookies().delete(TOKEN_COOKIE);
}

// ── Extract current user from request ──

/**
 * Read JWT from either:
 *   1. `Authorization: Bearer <token>` header (API clients)
 *   2. `feed_token` httpOnly cookie (browser)
 *
 * Returns null if no valid token found (for optional-auth routes).
 * Throws if `required` is true and token is missing/invalid.
 */
export function getUserFromRequest(
  req: NextRequest,
  required: true,
): JwtPayload;
export function getUserFromRequest(
  req: NextRequest,
  required?: false,
): JwtPayload | null;
export function getUserFromRequest(
  req: NextRequest,
  required = false,
): JwtPayload | null {
  let token: string | null = null;

  // 1. Try Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // 2. Fall back to cookie
  if (!token) {
    token = req.cookies.get(TOKEN_COOKIE)?.value ?? null;
  }

  if (!token) {
    if (required) throw AppError.unauthorized("Authentication required");
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    if (required) throw AppError.unauthorized("Invalid or expired token");
    return null;
  }
}
