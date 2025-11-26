"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import AuthGuard from "@/api/auth/auth-guard";
import ActiveWorkoutView from "@/features/workouts/components/workout-active/active-workout-view";
import Navigation from "./navigation";
import { ActiveWorkoutProvider } from "@/context/active-workout-context";
import WorkoutModalProvider from "@/features/workouts/components/workout-history/workout-modal-provider";

interface CoreLayoutProps {
  children: React.ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
  return (
    <AuthGuard>
      <WorkoutModalProvider>
        <ActiveWorkoutProvider>
          <div className="grid lg:grid-cols-[auto_1fr]">
            <div className="hidden w-[16rem] lg:block"></div>

            <div className="p-4 lg:p-8">
              <div className="mx-auto max-w-5xl">{children}</div>
            </div>

            <div className="h-16 lg:hidden" />

            <ActiveWorkoutView />
            <Navigation />
          </div>
          <ReactQueryDevtools />
        </ActiveWorkoutProvider>
      </WorkoutModalProvider>
    </AuthGuard>
  );
}
