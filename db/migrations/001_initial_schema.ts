import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // ── UUID extension ──
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // ── Users ──
  await knex.schema.createTable("users", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.string("username", 40).notNullable().unique();
    t.string("display_name", 100).notNullable();
    t.string("password_hash", 255).notNullable();
    t.text("avatar_url");
    t.timestamps(true, true); // created_at, updated_at
  });

  // ── Posts ──
  await knex.schema.createTable("posts", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.uuid("author_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.text("content").notNullable();
    t.text("image_url");
    t.integer("likes_count").notNullable().defaultTo(0);
    t.integer("comments_count").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

  // Full-text search GIN index
  await knex.raw(`
    CREATE INDEX idx_posts_content_fts
    ON posts
    USING GIN (to_tsvector('english', content))
  `);

  // Cursor pagination indexes
  await knex.raw(`CREATE INDEX idx_posts_created_at_id ON posts (created_at DESC, id DESC)`);
  await knex.raw(`CREATE INDEX idx_posts_likes_id ON posts (likes_count DESC, id DESC)`);

  // ── Likes ──
  await knex.schema.createTable("likes", (t) => {
    t.uuid("post_id").notNullable().references("id").inTable("posts").onDelete("CASCADE");
    t.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.primary(["post_id", "user_id"]);
  });

  // ── Comments ──
  await knex.schema.createTable("comments", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    t.uuid("post_id").notNullable().references("id").inTable("posts").onDelete("CASCADE");
    t.uuid("author_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.text("content").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.raw(`CREATE INDEX idx_comments_post_created ON comments (post_id, created_at ASC, id ASC)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("comments");
  await knex.schema.dropTableIfExists("likes");
  await knex.schema.dropTableIfExists("posts");
  await knex.schema.dropTableIfExists("users");
}
