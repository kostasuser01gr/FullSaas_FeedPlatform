import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  /** Hydrate from /api/auth/me on mount (cookie-based) */
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,

  setUser: (user, token) => set({ user, token }),

  clearUser: () => set({ user: null, token: null }),

  hydrate: async () => {
    // Already hydrated
    if (get().user) return;

    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data?.user) {
        set({ user: json.data.user });
      }
    } catch {
      // Not authenticated — no-op
    }
  },
}));
