"use client";

import { useParams } from "next/navigation";

import ProgramDetailView from "@/features/programs/components/program-detail/program-detail-view";

export default function ProgramDetailPage() {
  const params = useParams<{ programId: string }>();
  const programId = Number(params.programId);

  return <ProgramDetailView programId={programId} />;
}
