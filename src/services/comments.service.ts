import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Comment, CursorPage, UserPublic } from "@/types";
import { randomUUID } from "crypto";

const DEFAULT_LIMIT = 20;

export async function getComments(
  postId: string,
  cursor?: string,
  limit = DEFAULT_LIMIT,
): Promise<CursorPage<Comment>> {
  // Verify post exists
  const post = await db<any>("posts").where({ id: postId }).first();
  if (!post) throw AppError.notFound("Post");

  const q = db<any>("comments as c")
    .join("users as u", "u.id", "c.author_id")
    .select(
      "c.*",
      "u.username as author_username",
      "u.display_name as author_display_name",
      "u.avatar_url as author_avatar_url",
    )
    .where("c.post_id", postId);

  if (cursor) {
    const decoded = decodeCursor(cursor);
    q.where(function () {
      this.where("c.created_at", ">", decoded.v).orWhere(function () {
        this.where("c.created_at", decoded.v).andWhere("c.id", ">", decoded.id);
      });
    });
  }

  q.orderBy("c.created_at", "asc").orderBy("c.id", "asc").limit(limit + 1);

  const rows = await q;
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  const data = rows.map(toCommentDto);

  let nextCursor: string | null = null;
  if (hasMore && rows.length > 0) {
    const last = rows[rows.length - 1];
    nextCursor = encodeCursor(last.created_at, last.id);
  }

  return { data, nextCursor, hasMore };
}

export async function addComment(
  postId: string,
  authorId: string,
  content: string,
): Promise<Comment> {
  const post = await db<any>("posts").where({ id: postId }).first();
  if (!post) throw AppError.notFound("Post");

  const id = randomUUID();

  await db.transaction(async (trx) => {
    await trx<any>("comments").insert({
      id,
      post_id: postId,
      author_id: authorId,
      content,
    });
    await trx<any>("posts").where({ id: postId }).increment("comments_count", 1);
  });

  const row = await db<any>("comments as c")
    .join("users as u", "u.id", "c.author_id")
    .select(
      "c.*",
      "u.username as author_username",
      "u.display_name as author_display_name",
      "u.avatar_url as author_avatar_url",
    )
    .where("c.id", id)
    .first();

  return toCommentDto(row);
}

// ── Cursor helpers ──

function encodeCursor(value: any, id: string): string {
  return Buffer.from(JSON.stringify({ v: value, id })).toString("base64url");
}

function decodeCursor(cursor: string): { v: any; id: string } {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString());
  } catch {
    throw AppError.badRequest("Invalid cursor");
  }
}

// ── DTO ──

function toCommentDto(row: Record<string, unknown>): Comment {
  const author: UserPublic = {
    id: row.author_id as string,
    username: row.author_username as string,
    displayName: row.author_display_name as string,
    avatarUrl: row.author_avatar_url as string | null,
  };

  return {
    id: row.id as string,
    postId: row.post_id as string,
    authorId: row.author_id as string,
    content: row.content as string,
    createdAt: (row.created_at as Date).toISOString(),
    author,
  };
}
