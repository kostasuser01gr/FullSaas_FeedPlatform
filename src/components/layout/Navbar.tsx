"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCallback } from "react";

export default function Navbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    clearUser();
    router.push("/login");
    router.refresh();
  }, [clearUser, router]);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold text-brand-600 dark:text-brand-400"
        >
          FeedPlatform
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.displayName}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-gray-300 px-3 py-1 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
