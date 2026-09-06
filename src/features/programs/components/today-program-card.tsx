"use client";

import { useActiveEnrollment } from "@/api/program-enrollments/queries";
import ActiveProgramCard from "./active-program-card";

/** Dashboard card; renders nothing unless the user follows a program. */
export default function TodayProgramCard() {
  const { data: enrollment } = useActiveEnrollment();

  if (!enrollment) return null;

  return <ActiveProgramCard enrollment={enrollment} compact />;
}
