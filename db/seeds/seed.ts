import type { Knex } from "knex";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

/**
 * Seed 10 users, 200 posts, some likes, and comments
 * for local development.
 */
export async function seed(knex: Knex): Promise<void> {
  // Clean tables in FK order
  await knex("comments").del();
  await knex("likes").del();
  await knex("posts").del();
  await knex("users").del();

  const now = new Date();
  const hash = await bcrypt.hash("password123", BCRYPT_ROUNDS);

  // ── Users ──
  const users = Array.from({ length: 10 }, (_, i) => ({
    id: randomUUID(),
    username: `user${i + 1}`,
    display_name: `User ${i + 1}`,
    password_hash: hash,
    avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=User${i + 1}`,
    created_at: new Date(now.getTime() - (10 - i) * 86_400_000),
    updated_at: now,
  }));

  await knex("users").insert(users);

  // ── Posts ──
  const sampleContents = [
    "Just deployed my first Next.js app to Vercel! The DX is incredible.",
    "Hot take: Server Components are the biggest paradigm shift since hooks.",
    "Anyone else using cursor-based pagination? Way better than offset for large datasets.",
    "TIL you can use React.memo with custom comparators to fine-tune rendering.",
    "Writing Zod schemas for API validation is oddly satisfying.",
    "PostgreSQL full-text search with GIN indexes is underrated.",
    "Just migrated from Express to Next.js Route Handlers. No regrets.",
    "Tailwind CSS + dark mode = chef's kiss.",
    "Zustand vs Redux — for new projects, Zustand wins every time.",
    "The react-virtuoso library handles 50k+ items like butter.",
  ];

  const posts: Array<Record<string, unknown>> = [];
  for (let i = 0; i < 200; i++) {
    const author = users[i % users.length];
    posts.push({
      id: randomUUID(),
      author_id: author.id,
      content: sampleContents[i % sampleContents.length] + (i > 9 ? ` (#${i + 1})` : ""),
      image_url: i % 7 === 0 ? `https://picsum.photos/seed/post${i}/800/400` : null,
      likes_count: 0,
      comments_count: 0,
      created_at: new Date(now.getTime() - (200 - i) * 600_000), // 10 min apart
      updated_at: now,
    });
  }

  // Batch insert (Postgres supports large batches)
  for (let i = 0; i < posts.length; i += 50) {
    await knex("posts").insert(posts.slice(i, i + 50));
  }

  // ── Likes ──
  const likes: Array<{ post_id: string; user_id: string }> = [];
  for (const post of posts.slice(0, 80)) {
    // Each of the first 80 posts gets 1-5 random likes
    const numLikes = 1 + Math.floor(Math.random() * 5);
    const shuffled = [...users].sort(() => Math.random() - 0.5).slice(0, numLikes);
    for (const u of shuffled) {
      likes.push({ post_id: post.id as string, user_id: u.id });
    }
  }

  for (let i = 0; i < likes.length; i += 50) {
    await knex("likes").insert(likes.slice(i, i + 50));
  }

  // Update likes_count
  await knex.raw(`
    UPDATE posts SET likes_count = (
      SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id
    )
  `);

  // ── Comments ──
  const comments: Array<Record<string, unknown>> = [];
  for (const post of posts.slice(0, 50)) {
    const numComments = 1 + Math.floor(Math.random() * 4);
    for (let j = 0; j < numComments; j++) {
      const commenter = users[Math.floor(Math.random() * users.length)];
      comments.push({
        id: randomUUID(),
        post_id: post.id,
        author_id: commenter.id,
        content: `Great post! This is comment ${j + 1}.`,
        created_at: new Date(
          (post.created_at as Date).getTime() + (j + 1) * 60_000,
        ),
      });
    }
  }

  for (let i = 0; i < comments.length; i += 50) {
    await knex("comments").insert(comments.slice(i, i + 50));
  }

  // Update comments_count
  await knex.raw(`
    UPDATE posts SET comments_count = (
      SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id
    )
  `);

  console.log(
    `Seeded: ${users.length} users, ${posts.length} posts, ${likes.length} likes, ${comments.length} comments`,
  );
}
