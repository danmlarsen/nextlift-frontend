"use client";

import Link from "next/link";
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react";

import { useProgramEnrollDefaults } from "@/api/programs/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProgramReadinessProps {
  programId: number;
}

/** Structural checks the backend runs before anyone can follow the program. */
export default function ProgramReadiness({ programId }: ProgramReadinessProps) {
  const defaults = useProgramEnrollDefaults(programId);
  if (!defaults.isSuccess) return null;

  const problems = defaults.data.problems;
  const ready = problems.length === 0;

  return (
    <Card className={ready ? "border-emerald-500/40" : "border-amber-500/40"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {ready ? (
            <CheckCircle2Icon className="size-5 text-emerald-500" />
          ) : (
            <CircleAlertIcon className="size-5 text-amber-500" />
          )}
          {ready ? "Ready to follow" : "Not ready yet"}
        </CardTitle>
        <CardDescription>
          {ready
            ? `${defaults.data.defaults.length} progression slots.`
            : "Fix these before the program can be followed:"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ready ? (
          <Button asChild variant="outline" className="w-full">
            <Link href={`/app/programs/${programId}`}>Preview and follow</Link>
          </Button>
        ) : (
          <ul className="list-inside list-disc space-y-1 text-sm">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
