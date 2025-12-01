import Link from "next/link";

import { Button } from "@/components/ui/button";
import AuthGuard from "@/api/auth/auth-guard";

export default function LandingPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/app">
      <div className="grid items-center justify-center text-center md:justify-start md:text-left">
        <div className="w-full max-w-3xl space-y-8">
          <h1 className="text-3xl font-medium sm:text-5xl md:text-7xl">
            Track your workouts.
            <br />
            See your progress.
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm sm:max-w-md md:text-base">
            NextLift is a fast, distraction-free workout tracker that makes it
            easy to log sets, follow your plan, and see your progress over time.
          </p>
          <div className="flex justify-center gap-2 sm:gap-4 md:justify-start">
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/demo">Try demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
