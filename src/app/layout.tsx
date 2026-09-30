import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { AppProviders } from "@/components/providers/AppProviders";
import { APP_NAME, APP_TAGLINE, APP_URL } from "@/lib/constants";
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
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — India's Creator Leaderboard`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Bid. Rank. Get discovered. India's creator ranking and discovery platform — compete by category, share your rank, and send traffic to YouTube.",
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: "Compete for the top spot in India's creator categories.",
    type: "website",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_TAGLINE,
  },
  alternates: { canonical: APP_URL },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: APP_URL,
    description: APP_TAGLINE,
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProviders>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <MobileNav />
        </AppProviders>
      </body>
    </html>
  );
}
