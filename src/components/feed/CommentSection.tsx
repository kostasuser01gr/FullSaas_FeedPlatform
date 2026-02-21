"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Comment as CommentType } from "@/types";

interface Props {
  postId: string;
  onCommentAdded: () => void;
}

export default function CommentSection({ postId, onCommentAdded }: Props) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const cursorRef = useRef<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const initialFetched = useRef(false);

  const fetchComments = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      try {
        const qs = cursor ? `?cursor=${cursor}` : "";
        const res = await fetch(`/api/posts/${postId}/comments${qs}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Fetch comments failed");
        const json = await res.json();
        const page = json.data as {
          data: CommentType[];
          nextCursor: string | null;
          hasMore: boolean;
        };
        setComments((prev) => (cursor ? [...prev, ...page.data] : page.data));
        cursorRef.current = page.nextCursor;
        setHasMore(page.hasMore);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [postId],
  );

  useEffect(() => {
    if (!initialFetched.current) {
      initialFetched.current = true;
      fetchComments();
    }
  }, [fetchComments]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || submitting) return;
      setSubmitting(true);
      try {
        const res = await fetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: content.trim() }),
        });
        if (!res.ok) throw new Error("Add comment failed");
        const json = await res.json();
        setComments((prev) => [...prev, json.data]);
        setContent("");
        onCommentAdded();
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    },
    [postId, content, submitting, onCommentAdded],
  );

  return (
    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
      {/* Existing comments */}
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
              {c.author.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {c.author.displayName}{" "}
                <span className="font-normal text-gray-400">
                  @{c.author.username}
                </span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          </div>
        )}

        {hasMore && !loading && (
          <button
            onClick={() => fetchComments(cursorRef.current ?? undefined)}
            className="text-xs font-medium text-brand-500 hover:underline"
          >
            Load more comments
          </button>
        )}
      </div>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment…"
          maxLength={2000}
          className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "…" : "Post"}
        </button>
      </form>
    </div>
  );
}
