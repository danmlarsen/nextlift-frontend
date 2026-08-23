import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import Providers from "@/components/providers";
import { SITE_URL } from "@/lib/site-url";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NextLift - Workout Tracker",
  description:
    "NextLift is a fast, distraction-free workout tracker that makes it easy to log sets, follow your plan, and see your progress over time.",
  keywords: [
    "workout tracker",
    "fitness app",
    "exercise logging",
    "progress tracking",
    "workout planner",
    "health and fitness",
    "gym log",
    "training journal",
  ],
  authors: [{ name: "Dan Marius Larsen", url: "https://www.danmarius.no" }],
  creator: "Dan Marius Larsen",
  twitter: {
    card: "summary_large_image",
    title: "NextLift - Workout Tracker",
    description:
      "NextLift is a fast, distraction-free workout tracker that makes it easy to log sets, follow your plan, and see your progress over time.",
  },
  openGraph: {
    title: "NextLift - Workout Tracker",
    description:
      "NextLift is a fast, distraction-free workout tracker that makes it easy to log sets, follow your plan, and see your progress over time.",
    type: "website",
    url: "/",
    siteName: "NextLift",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} bg-background text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
