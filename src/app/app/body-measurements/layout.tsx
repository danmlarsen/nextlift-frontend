"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, UserCogIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BodyMeasurementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex min-h-12 items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeftIcon />
        </Button>
        <h1 className="text-xl font-bold">Bodyweight tracker</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/app/body-measurements/profile`}
              aria-label="Body profile"
            >
              <UserCogIcon />
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/app/body-measurements/add`}>Add</Link>
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
