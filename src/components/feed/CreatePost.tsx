"use client";

import { useState, useCallback } from "react";
import type { Post } from "@/types";

interface Props {
  onPostCreated: (post: Post) => void;
}

export default function CreatePost({ onPostCreated }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = content.trim();
      if (!trimmed || submitting) return;
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: trimmed }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error?.message ?? "Failed to create post");
        }

        const json = await res.json();
        onPostCreated(json.data);
        setContent("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
    [content, submitting, onPostCreated],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        maxLength={5000}
        rows={3}
        className="w-full resize-none rounded-md border border-gray-200 p-3 text-sm outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {content.length}/5000
        </span>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
