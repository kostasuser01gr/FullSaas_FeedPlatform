import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

/**
 * Toggle like on a post. Returns the new liked state and count.
 */
export async function toggleLike(
  postId: string,
  userId: string,
): Promise<{ liked: boolean; likesCount: number }> {
  const post = await db<any>("posts").where({ id: postId }).first();
  if (!post) throw AppError.notFound("Post");

  const existing = await db<any>("likes")
    .where({ post_id: postId, user_id: userId })
    .first();

  let liked: boolean;

  await db.transaction(async (trx) => {
    if (existing) {
      // Unlike
      await trx<any>("likes")
        .where({ post_id: postId, user_id: userId })
        .del();
      await trx<any>("posts").where({ id: postId }).decrement("likes_count", 1);
      liked = false;
    } else {
      // Like
      await trx<any>("likes").insert({ post_id: postId, user_id: userId });
      await trx<any>("posts").where({ id: postId }).increment("likes_count", 1);
      liked = true;
    }
  });

  const updated = await db<any>("posts")
    .where({ id: postId })
    .select("likes_count")
    .first();

  return { liked: liked!, likesCount: Number(updated.likes_count) };
}
