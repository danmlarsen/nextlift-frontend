import LifetimeWorkoutsStats from "./lifetime-workouts-stats";
import WeeklyReportStats from "./weekly-report-stats";
import NewActiveWorkoutButton from "../../../features/workouts/components/new-active-workout-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <div className="flex min-h-12 items-center justify-between lg:hidden">
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_15rem] sm:gap-8 lg:grid-cols-[1fr_16rem]">
        <div className="space-y-4 sm:col-start-2 sm:row-start-1">
          <NewActiveWorkoutButton />
          <Button className="w-full" asChild>
            <Link href="/app/body-measurements">Bodyweight tracking</Link>
          </Button>
        </div>
        <div className="space-y-4 sm:col-start-1 sm:row-start-1">
          <LifetimeWorkoutsStats />
          <WeeklyReportStats />
        </div>
      </div>
    </div>
  );
}
