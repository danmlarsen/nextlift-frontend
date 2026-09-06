"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { useActiveEnrollment } from "@/api/program-enrollments/queries";
import { useDuplicateProgram } from "@/api/programs/mutations";
import { useProgram } from "@/api/programs/queries";
import { totalWeeksOf } from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import { formatDuration } from "@/lib/program-format";
import EnrollWizard from "../enroll-wizard/enroll-wizard";
import { Chip, GoalBadge, LevelBadge } from "../program-badges";
import ProgramBlockSection from "./program-block-section";

interface ProgramDetailViewProps {
  programId: number;
}

export default function ProgramDetailView({
  programId,
}: ProgramDetailViewProps) {
  const router = useRouter();
  const program = useProgram(programId);
  const activeEnrollment = useActiveEnrollment();
  const [enrollOpen, setEnrollOpen] = useSearchParamState("enroll-modal");
  const duplicateProgram = useDuplicateProgram();

  const handleCustomize = () => {
    duplicateProgram.mutate(programId, {
      onSuccess: (copy) => {
        toast.success("Copy saved to your programs");
        router.push(`/app/programs/${copy.id}/edit`);
      },
      onError: (error) =>
        toast.error(error.message || "Could not copy the program"),
    });
  };

  const followingThis =
    activeEnrollment.data?.programId === programId
      ? activeEnrollment.data
      : null;
  const followingOther =
    activeEnrollment.data && activeEnrollment.data.programId !== programId
      ? activeEnrollment.data
      : null;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex min-h-12 items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => router.back()} aria-label="Back">
          <ChevronLeftIcon />
        </Button>
        <h1 className="truncate text-xl font-bold">
          {program.data?.name ?? "Program"}
        </h1>
        {program.data?.isOwner ? (
          <Button asChild variant="ghost" size="icon" aria-label="Edit program">
            <Link href={`/app/programs/${programId}/edit`}>
              <PencilIcon />
            </Link>
          </Button>
        ) : (
          <div className="w-14" aria-hidden="true" />
        )}
      </div>

      {program.isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[160px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      )}
      {program.isError && (
        <p className="text-destructive">
          This program could not be loaded. It may have been removed.
        </p>
      )}

      {program.isSuccess && (
        <>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <LevelBadge level={program.data.level} />
              <GoalBadge goal={program.data.goal} />
              <Chip className="text-muted-foreground">
                {program.data.daysPerWeek} days/week
              </Chip>
              <Chip className="text-muted-foreground">
                {formatDuration(
                  totalWeeksOf(program.data),
                  program.data.durationMode,
                )}
              </Chip>
              <Chip className="text-muted-foreground">
                {program.data.scheduleMode === "CALENDAR"
                  ? "Fixed weekdays"
                  : "Rotation"}
              </Chip>
            </div>
            {program.data.description && (
              <p className="text-sm">{program.data.description}</p>
            )}
            {program.data.credit && (
              <p className="text-muted-foreground text-xs">
                {program.data.credit}
              </p>
            )}
          </div>

          <Card>
            {followingThis && (
              <>
                <CardHeader>
                  <CardTitle>You are following this program</CardTitle>
                  <CardDescription>
                    Your next workout and progress live on the program page.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/app/programs/active">Open program</Link>
                  </Button>
                </CardContent>
              </>
            )}
            {followingOther && (
              <>
                <CardHeader>
                  <CardTitle>
                    You are following {followingOther.programName}
                  </CardTitle>
                  <CardDescription>
                    Only one program can run at a time. Finish or abandon it
                    from its page before starting this one.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/app/programs/active">
                      Open current program
                    </Link>
                  </Button>
                </CardContent>
              </>
            )}
            {!followingThis && !followingOther && (
              <>
                <CardHeader>
                  <CardTitle>Follow this program</CardTitle>
                  <CardDescription>
                    Pick a start date and your starting weights; the app then
                    tells you what to do each session and progresses the loads.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => setEnrollOpen(true)}
                    disabled={activeEnrollment.isLoading}
                  >
                    Follow this program
                  </Button>
                </CardContent>
              </>
            )}
          </Card>

          {program.data.isSystem && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCustomize}
              disabled={duplicateProgram.isPending}
            >
              {duplicateProgram.isPending && <Spinner />}
              Customize a copy
            </Button>
          )}

          <div className="space-y-6">
            {program.data.blocks.map((block) => (
              <ProgramBlockSection
                key={block.id}
                block={block}
                showBlockHeading={program.data.blocks.length > 1}
                effortScale={program.data.effortScale}
                scheduleMode={program.data.scheduleMode}
              />
            ))}
          </div>

          <EnrollWizard
            program={program.data}
            isOpen={enrollOpen}
            onOpenChange={setEnrollOpen}
          />
        </>
      )}
    </div>
  );
}
