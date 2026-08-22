import Link from "next/link";

import LandingHeader from "./header";

interface LandingLayoutProps {
  children?: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <>
      <div className="mx-auto grid min-h-dvh max-w-5xl grid-rows-[auto_1fr_auto]">
        <LandingHeader />
        <main className="grid p-4 md:p-6">{children}</main>
        <footer className="flex items-center justify-center p-4 md:justify-end md:p-6">
          <p className="text-muted-foreground text-xs md:text-sm">
            In active development by –{" "}
            <Link
              href="https://www.danmarius.no"
              className="hover:text-foreground underline underline-offset-2 transition-colors duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              danmarius.no
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
}
