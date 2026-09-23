import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TopCreator.in — India's Pay-to-Rank Creator Leaderboard",
  description:
    "Indian YouTubers and fans bid via UPI/Razorpay to claim the #1 spot across Tech, Gaming, Vlogs, Comedy, and Finance.",
  openGraph: {
    title: "TopCreator.in",
    description: "Pay. Rank. Flex. India's creator leaderboard where money decides.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-50">{children}</body>
    </html>
  );
}
