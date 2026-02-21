"use client";

import { memo, useState, useCallback } from "react";
import Image from "next/image";
import type { Post } from "@/types";
import CommentSection from "./CommentSection";

interface Props {
  post: Post;
  onLikeToggle: (postId: string, liked: boolean, count: number) => void;
  onCommentAdded: (postId: string) => void;
  onDelete: (postId: string) => void;
}

function PostCardInner({ post, onLikeToggle, onCommentAdded, onDelete }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLike = useCallback(async () => {
    if (liking) return;
    setLiking(true);

    // Optimistic update
    const prevLiked = post.likedByMe;
    const prevCount = post.likesCount;
    const optimisticLiked = !prevLiked;
    const optimisticCount = prevLiked ? prevCount - 1 : prevCount + 1;
    onLikeToggle(post.id, optimisticLiked, optimisticCount);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Like failed");
      const json = await res.json();
      onLikeToggle(post.id, json.data.liked, json.data.likesCount);
    } catch {
      // Revert
      onLikeToggle(post.id, prevLiked, prevCount);
    } finally {
      setLiking(false);
    }
  }, [post.id, post.likedByMe, post.likesCount, liking, onLikeToggle]);

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    if (!confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      onDelete(post.id);
    } catch {
      setDeleting(false);
    }
  }, [post.id, deleting, onDelete]);

  const timeAgo = formatRelativeTime(post.createdAt);

  return (
    <article className="mb-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        {post.author.avatarUrl ? (
          <Image
            src={post.author.avatarUrl}
            alt={post.author.displayName}
            width={40}
            height={40}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-semibold">
            {post.author.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {post.author.displayName}
          </p>
          <p className="text-xs text-gray-500">@{post.author.username} · {timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      <p className="mb-3 whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
        {post.content}
      </p>

      {post.imageUrl && (
        <div className="relative mb-3 aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.imageUrl}
            alt="Post image"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
            unoptimized
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-gray-100 pt-3 dark:border-gray-700">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 text-sm font-medium transition ${
            post.likedByMe
              ? "text-red-500 hover:text-red-600"
              : "text-gray-500 hover:text-red-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={post.likedByMe ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {post.likesCount}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-brand-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
            />
          </svg>
          {post.commentsCount}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto text-sm text-gray-400 transition hover:text-red-500"
          title="Delete post"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentAdded={() => onCommentAdded(post.id)}
        />
      )}
    </article>
  );
}

// ── Helpers ──

function formatRelativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const PostCard = memo(PostCardInner);
export default PostCard;
