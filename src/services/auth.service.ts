import { db } from "@/lib/db";
import { hashPassword, verifyPassword, signToken } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import type { User, AuthPayload } from "@/types";
import { randomUUID } from "crypto";

export async function registerUser(
  username: string,
  displayName: string,
  password: string,
): Promise<AuthPayload> {
  const existing = await db<any>("users").where({ username }).first();
  if (existing) throw AppError.conflict("Username already taken");

  const id = randomUUID();
  const passwordHash = await hashPassword(password);
  const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const [user] = await db<any>("users")
    .insert({
      id,
      username,
      display_name: displayName,
      password_hash: passwordHash,
      avatar_url: avatarUrl,
    })
    .returning("*");

  const token = signToken(user.id, user.username);

  return {
    accessToken: token,
    user: toUserDto(user),
  };
}

export async function loginUser(
  username: string,
  password: string,
): Promise<AuthPayload> {
  const user = await db<any>("users").where({ username }).first();
  if (!user) throw AppError.unauthorized("Invalid username or password");

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw AppError.unauthorized("Invalid username or password");

  const token = signToken(user.id, user.username);

  return {
    accessToken: token,
    user: toUserDto(user),
  };
}

export async function getUserById(id: string): Promise<User> {
  const user = await db<any>("users").where({ id }).first();
  if (!user) throw AppError.notFound("User");
  return toUserDto(user);
}

// ── Helpers ──

function toUserDto(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    displayName: row.display_name as string,
    avatarUrl: row.avatar_url as string | null,
    createdAt: (row.created_at as Date).toISOString(),
  };
}
