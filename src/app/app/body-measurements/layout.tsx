"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
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
        <h1 className="text-xl font-bold">Body Measurements</h1>
        <Button asChild>
          <Link href={`/app/body-measurements/add`}>Add</Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
