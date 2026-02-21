import { Suspense } from "react";
import FeedClient from "./FeedClient";
import Spinner from "@/components/ui/Spinner";
import { getFeed } from "@/services/posts.service";

/**
 * Root page — Server Component.
 * Fetches the first page of the feed on the server,
 * then hands off to FeedClient for interactivity.
 */
export const dynamic = "force-dynamic"; // always fetch fresh data

export default async function HomePage() {
  // Server-side first page fetch (no auth → likedByMe = false)
  const page = await getFeed(
    { sortBy: "created_at", sortOrder: "desc", limit: 20 },
    null,
  );

  return (
    <Suspense fallback={<Spinner size="lg" />}>
      <FeedClient
        initialPosts={page.data}
        initialCursor={page.nextCursor}
        initialHasMore={page.hasMore}
      />
    </Suspense>
  );
}
