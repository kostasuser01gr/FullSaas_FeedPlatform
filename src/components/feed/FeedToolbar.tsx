"use client";

import { useDeferredValue, useState, useTransition } from "react";
import type { PostSortField, SortOrder } from "@/types";

interface Props {
  onFilterChange: (params: URLSearchParams) => void;
}

export default function FeedToolbar({ onFilterChange }: Props) {
  const [sortBy, setSortBy] = useState<PostSortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [isPending, startTransition] = useTransition();

  const buildParams = (
    sb: PostSortField,
    so: SortOrder,
    q: string,
  ): URLSearchParams => {
    const p = new URLSearchParams();
    if (sb !== "created_at") p.set("sortBy", sb);
    if (so !== "desc") p.set("sortOrder", so);
    if (q.trim()) p.set("search", q.trim());
    return p;
  };

  const handleSortByChange = (val: PostSortField) => {
    setSortBy(val);
    startTransition(() => onFilterChange(buildParams(val, sortOrder, deferredSearch)));
  };

  const handleSortOrderToggle = () => {
    const next: SortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(next);
    startTransition(() => onFilterChange(buildParams(sortBy, next, deferredSearch)));
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    startTransition(() => onFilterChange(buildParams(sortBy, sortOrder, val)));
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search posts…"
          className="w-full rounded-md border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
        <svg
          className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      {/* Sort By */}
      <select
        value={sortBy}
        onChange={(e) => handleSortByChange(e.target.value as PostSortField)}
        className="rounded-md border border-gray-200 py-1.5 px-2 text-sm outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      >
        <option value="created_at">Newest</option>
        <option value="likes_count">Most liked</option>
      </select>

      {/* Sort Order */}
      <button
        onClick={handleSortOrderToggle}
        className="rounded-md border border-gray-200 p-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        title={sortOrder === "desc" ? "Descending" : "Ascending"}
      >
        {sortOrder === "desc" ? "↓" : "↑"}
      </button>

      {isPending && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      )}
    </div>
  );
}
