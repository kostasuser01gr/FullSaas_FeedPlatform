import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — FeedPlatform",
};

export default function LoginPage() {
  return (
    <div className="mx-auto mt-12 max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        Sign In
      </h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-500 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
