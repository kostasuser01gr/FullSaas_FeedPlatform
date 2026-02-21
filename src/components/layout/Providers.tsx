"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Client-side providers wrapper.
 * Hydrates auth state from cookie on mount.
 */
export default function Providers({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
