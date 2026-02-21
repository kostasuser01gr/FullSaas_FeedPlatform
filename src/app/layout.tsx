import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FeedPlatform — Social Feed",
  description:
    "A production-grade social feed platform built with Next.js 14, React 18, and PostgreSQL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
