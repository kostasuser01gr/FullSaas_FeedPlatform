"use client";

import { useState, useCallback } from "react";
import CreatePost from "@/components/feed/CreatePost";
import FeedToolbar from "@/components/feed/FeedToolbar";
import VirtualizedFeed from "@/components/feed/VirtualizedFeed";
import { useAuthStore } from "@/store/authStore";
import type { Post } from "@/types";

/**
 * Client wrapper that wires up CreatePost → VirtualizedFeed
 * and FeedToolbar → query string updates.
 */
export default function FeedClient({
  initialPosts,
  initialCursor,
  initialHasMore,
}: {
  initialPosts: Post[];
  initialCursor: string | null;
  initialHasMore: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const [queryString, setQueryString] = useState("");
  const [feedKey, setFeedKey] = useState(0);
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const handleFilterChange = useCallback(async (params: URLSearchParams) => {
    const qs = params.toString();
    setQueryString(qs);

    // Re-fetch first page with new filters
    try {
      const url = qs ? `/api/posts?${qs}` : "/api/posts";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      const page = json.data;
      setPosts(page.data);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
      setFeedKey((k) => k + 1);
    } catch (err) {
      console.error("Filter fetch error:", err);
    }
  }, []);

  const handlePostCreated = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setFeedKey((k) => k + 1);
  }, []);

  return (
    <>
      {user && <CreatePost onPostCreated={handlePostCreated} />}
      <FeedToolbar onFilterChange={handleFilterChange} />
      <VirtualizedFeed
        key={feedKey}
        initialPosts={posts}
        initialCursor={cursor}
        initialHasMore={hasMore}
        queryString={queryString}
      />
    </>
  );
}
