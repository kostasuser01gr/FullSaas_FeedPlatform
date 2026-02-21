import { z } from "zod";

// ── Auth ──
export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscores only"),
  displayName: z.string().min(1).max(100),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// ── Posts ──
export const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  imageUrl: z.string().url().max(1024).nullable().optional(),
});

export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sortBy: z.enum(["created_at", "likes_count"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  authorId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
});

// ── Comments ──
export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const commentsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
