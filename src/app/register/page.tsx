import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — FeedPlatform",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-12 max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        Create Account
      </h1>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-500 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
