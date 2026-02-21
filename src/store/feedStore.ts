import { create } from "zustand";
import type { Post } from "@/types";

/**
 * Feed store — used by the client-side FeedPage to coordinate
 * CreatePost → VirtualizedFeed prepend.
 */
interface FeedState {
  /** Posts prepended from CreatePost (shown optimistically at top) */
  pendingPrepend: Post[];
  addPending: (post: Post) => void;
  clearPending: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  pendingPrepend: [],
  addPending: (post) =>
    set((s) => ({ pendingPrepend: [post, ...s.pendingPrepend] })),
  clearPending: () => set({ pendingPrepend: [] }),
}));
