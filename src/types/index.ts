/* ──────────────────────────────────────────────
   Shared TypeScript types for the entire app.
   Used by both server (services, route handlers)
   and client (components, stores, hooks).
   ────────────────────────────────────────────── */

// ── Pagination ──
export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// ── Users ──
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export type UserPublic = Pick<User, "id" | "username" | "displayName" | "avatarUrl">;

// ── Posts ──
export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  author: UserPublic;
  likedByMe: boolean;
}

export type PostSortField = "created_at" | "likes_count";
export type SortOrder = "asc" | "desc";

export interface FeedFilters {
  sortBy?: PostSortField;
  sortOrder?: SortOrder;
  authorId?: string;
  search?: string;
}

// ── Comments ──
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: UserPublic;
}

// ── Auth ──
export interface AuthPayload {
  accessToken: string;
  user: User;
}

export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

// ── API envelope ──
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
