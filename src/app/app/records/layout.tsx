"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PersonalRecordsLayout({
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
        <h1 className="text-xl font-bold">Personal records</h1>
        {/* Spacer to keep the title centered */}
        <div className="w-14" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}
