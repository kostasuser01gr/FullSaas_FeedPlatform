"use client";

import { useCallback, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import type { Post } from "@/types";
import PostCard from "./PostCard";

interface Props {
  initialPosts: Post[];
  initialCursor: string | null;
  initialHasMore: boolean;
  /** Current query params forwarded to the fetch URL */
  queryString?: string;
}

export default function VirtualizedFeed({
  initialPosts,
  initialCursor,
  initialHasMore,
  queryString = "",
}: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const cursorRef = useRef<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !cursorRef.current) return;
    setLoading(true);
    try {
      const separator = queryString ? "&" : "?";
      const base = queryString ? `/api/posts?${queryString}` : "/api/posts";
      const url = cursorRef.current
        ? `${base}${queryString ? "&" : base.includes("?") ? "&" : "?"}cursor=${cursorRef.current}`
        : base;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();
      const page = json.data as {
        data: Post[];
        nextCursor: string | null;
        hasMore: boolean;
      };

      setPosts((prev) => [...prev, ...page.data]);
      cursorRef.current = page.nextCursor;
      setHasMore(page.hasMore);
    } catch (err) {
      console.error("Feed load error:", err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, queryString]);

  // Optimistic like toggle
  const handleLikeToggle = useCallback(
    (postId: string, liked: boolean, newCount: number) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: liked, likesCount: newCount }
            : p,
        ),
      );
    },
    [],
  );

  // Optimistic comment count bump
  const handleCommentAdded = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentsCount: p.commentsCount + 1 }
          : p,
      ),
    );
  }, []);

  // Optimistic delete
  const handleDelete = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  // Prepend new post
  const prependPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  return (
    <div className="w-full">
      {/* Expose prependPost for CreatePost via a data attribute */}
      <div
        id="feed-prepend"
        data-prepend="true"
        ref={(el) => {
          if (el) (el as unknown as { prependPost: typeof prependPost }).prependPost = prependPost;
        }}
        className="hidden"
      />

      <Virtuoso
        useWindowScroll
        data={posts}
        endReached={loadMore}
        overscan={600}
        itemContent={(_index, post) => (
          <PostCard
            key={post.id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onCommentAdded={handleCommentAdded}
            onDelete={handleDelete}
          />
        )}
        components={{
          Footer: () =>
            loading ? (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : !hasMore && posts.length > 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                You&apos;ve reached the end
              </p>
            ) : null,
        }}
      />

      {posts.length === 0 && !loading && (
        <p className="py-12 text-center text-gray-500">
          No posts yet. Be the first to share something!
        </p>
      )}
    </div>
  );
}
