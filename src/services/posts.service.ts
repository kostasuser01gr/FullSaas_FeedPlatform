import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Post, CursorPage, FeedFilters, UserPublic } from "@/types";
import { randomUUID } from "crypto";

const DEFAULT_LIMIT = 20;

/**
 * Get paginated feed with cursor-based pagination.
 *
 * Cursor is a base-64 encoded JSON `{ v: <sortValue>, id: <uuid> }`.
 * Supports sorting by `created_at` (default) or `likes_count`,
 * filtering by author and full-text search.
 */
export async function getFeed(
  filters: FeedFilters & { cursor?: string; limit?: number },
  currentUserId: string | null,
): Promise<CursorPage<Post>> {
  const {
    sortBy = "created_at",
    sortOrder = "desc",
    authorId,
    search,
    cursor,
    limit = DEFAULT_LIMIT,
  } = filters;

  const q = db<any>("posts as p")
    .join("users as u", "u.id", "p.author_id")
    .select(
      "p.*",
      "u.username as author_username",
      "u.display_name as author_display_name",
      "u.avatar_url as author_avatar_url",
    );

  // Liked-by-me subquery
  if (currentUserId) {
    q.select(
      db.raw(
        `EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked_by_me`,
        [currentUserId],
      ),
    );
  } else {
    q.select(db.raw("false AS liked_by_me"));
  }

  // ── Filters ──
  if (authorId) q.where("p.author_id", authorId);

  if (search) {
    q.whereRaw(
      `to_tsvector('english', p.content) @@ plainto_tsquery('english', ?)`,
      [search],
    );
  }

  // ── Cursor ──
  if (cursor) {
    const decoded = decodeCursor(cursor);
    const op = sortOrder === "desc" ? "<" : ">";
    q.where(function () {
      this.where(sortBy === "created_at" ? "p.created_at" : "p.likes_count", op, decoded.v)
        .orWhere(function () {
          this.where(
            sortBy === "created_at" ? "p.created_at" : "p.likes_count",
            decoded.v,
          ).andWhere("p.id", op, decoded.id);
        });
    });
  }

  // ── Sort ──
  const col = sortBy === "created_at" ? "p.created_at" : "p.likes_count";
  q.orderBy(col, sortOrder).orderBy("p.id", sortOrder);

  // Fetch limit + 1 to detect hasMore
  q.limit(limit + 1);

  const rows = await q;
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  const data = rows.map(toPostDto);

  let nextCursor: string | null = null;
  if (hasMore && rows.length > 0) {
    const last = rows[rows.length - 1];
    const v = sortBy === "created_at" ? last.created_at : last.likes_count;
    nextCursor = encodeCursor(v, last.id);
  }

  return { data, nextCursor, hasMore };
}

export async function createPost(
  authorId: string,
  content: string,
  imageUrl: string | null,
): Promise<Post> {
  const id = randomUUID();

  const [row] = await db<any>("posts")
    .insert({
      id,
      author_id: authorId,
      content,
      image_url: imageUrl ?? null,
    })
    .returning("*");

  const author = await db<any>("users")
    .where({ id: authorId })
    .select("id", "username", "display_name", "avatar_url")
    .first();

  return toPostDto({ ...row, ...prefixAuthor(author) });
}

export async function getPostById(
  id: string,
  currentUserId: string | null,
): Promise<Post> {
  const q = db<any>("posts as p")
    .join("users as u", "u.id", "p.author_id")
    .select(
      "p.*",
      "u.username as author_username",
      "u.display_name as author_display_name",
      "u.avatar_url as author_avatar_url",
    )
    .where("p.id", id);

  if (currentUserId) {
    q.select(
      db.raw(
        `EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked_by_me`,
        [currentUserId],
      ),
    );
  } else {
    q.select(db.raw("false AS liked_by_me"));
  }

  const row = await q.first();
  if (!row) throw AppError.notFound("Post");
  return toPostDto(row);
}

export async function deletePost(
  postId: string,
  userId: string,
): Promise<void> {
  const post = await db<any>("posts").where({ id: postId }).first();
  if (!post) throw AppError.notFound("Post");
  if (post.author_id !== userId) throw AppError.forbidden("Not the author");
  await db<any>("posts").where({ id: postId }).del();
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

// ── Row → DTO ──

function prefixAuthor(row: Record<string, unknown>) {
  return {
    author_username: row.username,
    author_display_name: row.display_name,
    author_avatar_url: row.avatar_url,
  };
}

function toPostDto(row: Record<string, unknown>): Post {
  const author: UserPublic = {
    id: row.author_id as string,
    username: row.author_username as string,
    displayName: row.author_display_name as string,
    avatarUrl: row.author_avatar_url as string | null,
  };

  return {
    id: row.id as string,
    authorId: row.author_id as string,
    content: row.content as string,
    imageUrl: row.image_url as string | null,
    likesCount: Number(row.likes_count ?? 0),
    commentsCount: Number(row.comments_count ?? 0),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
    author,
    likedByMe: Boolean(row.liked_by_me),
  };
}
