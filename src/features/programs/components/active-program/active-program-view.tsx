"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import {
  useAbandonEnrollment,
  useNextProgramCycle,
} from "@/api/program-enrollments/mutations";
import { useActiveEnrollment } from "@/api/program-enrollments/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import ActiveProgramCard from "../active-program-card";
import AdherenceCard from "./adherence-card";
import DayList from "./day-list";
import LiftProgress from "./lift-progress";
import ProgramWeekNavigator from "./program-week-navigator";
import ProgressionStateSheet from "./progression-state-sheet";

export default function ActiveProgramView() {
  const router = useRouter();
  const { data: enrollment, isLoading, isError } = useActiveEnrollment();
  const [stateSheetOpen, setStateSheetOpen] = useSearchParamState(
    "program-state-modal",
  );
  const [abandonOpen, setAbandonOpen] = useState(false);
  const [weekIndex, setWeekIndex] = useState<number | null>(null);
  const abandon = useAbandonEnrollment();
  const nextCycle = useNextProgramCycle();

  // Follow the schedule pointer until the user navigates weeks themselves.
  const pointerWeek = enrollment?.schedule.position.weekIndex ?? null;
  useEffect(() => {
    if (pointerWeek !== null) setWeekIndex((current) => current ?? pointerWeek);
  }, [pointerWeek]);

  const selectedWeek =
    enrollment?.schedule.weeks.find((week) => week.weekIndex === weekIndex) ??
    enrollment?.schedule.weeks[0];

  const handleAbandon = () => {
    if (!enrollment) return;
    setAbandonOpen(false);
    abandon.mutate(enrollment.id, {
      onSuccess: () => {
        toast.success("Program abandoned. Your workouts are kept.");
        router.push("/app/programs");
      },
      onError: (error) =>
        toast.error(error.message || "Could not abandon the program"),
    });
  };

  const handleNextCycle = () => {
    if (!enrollment) return;
    nextCycle.mutate(enrollment.id, {
      onSuccess: () => toast.success("Next cycle started"),
      onError: (error) =>
        toast.error(error.message || "Could not start the next cycle"),
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex min-h-12 items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => router.back()} aria-label="Back">
          <ChevronLeftIcon />
        </Button>
        <h1 className="truncate text-xl font-bold">
          {enrollment?.programName ?? "Program"}
        </h1>
        {enrollment ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Program actions">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {enrollment.programId && (
                <DropdownMenuItem asChild>
                  <Link href={`/app/programs/${enrollment.programId}`}>
                    Program details
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => setStateSheetOpen(true)}>
                Weights & exercises
              </DropdownMenuItem>
              {enrollment.status === "ACTIVE" && (
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => setAbandonOpen(true)}
                >
                  Abandon program
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-14" aria-hidden="true" />
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
      )}
      {isError && (
        <p className="text-destructive">
          Your program could not be loaded. Please try again later.
        </p>
      )}
      {!isLoading && !isError && !enrollment && (
        <Card>
          <CardHeader>
            <CardTitle>You are not following a program</CardTitle>
            <CardDescription>
              Pick one from the library and the app will plan every workout for
              you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/app/programs">Browse programs</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {enrollment && (
        <>
          <ActiveProgramCard enrollment={enrollment} />

          {enrollment.status === "COMPLETED" && (
            <Card>
              <CardHeader>
                <CardTitle>Program completed</CardTitle>
                <CardDescription>
                  Every day of the program is done. Run it again with your new
                  numbers, or pick a new program.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleNextCycle}
                  disabled={nextCycle.isPending}
                >
                  {nextCycle.isPending && <Spinner />}
                  Start next cycle
                </Button>
                <Button asChild variant="outline">
                  <Link href="/app/programs">Browse programs</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <AdherenceCard adherence={enrollment.schedule.adherence} />

          {selectedWeek && (
            <div className="space-y-3">
              <ProgramWeekNavigator
                week={selectedWeek}
                cycle={enrollment.schedule.position.cycle}
                totalWeeks={enrollment.schedule.totalWeeks}
                durationMode={enrollment.snapshot.durationMode}
                onPreviousWeek={() => setWeekIndex(selectedWeek.weekIndex - 1)}
                onNextWeek={() => setWeekIndex(selectedWeek.weekIndex + 1)}
              />
              <DayList enrollment={enrollment} week={selectedWeek} />
            </div>
          )}

          <LiftProgress enrollmentId={enrollment.id} />

          <ProgressionStateSheet
            enrollment={enrollment}
            isOpen={stateSheetOpen}
            onOpenChange={setStateSheetOpen}
          />
          <ConfirmDialog
            isOpen={abandonOpen}
            onOpenChange={setAbandonOpen}
            onConfirm={handleAbandon}
            title="Abandon program?"
            text="Your completed workouts stay in your history. You can start another program afterwards."
            confirmText="Abandon"
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
