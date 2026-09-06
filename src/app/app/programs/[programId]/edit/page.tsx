"use client";

import { useParams } from "next/navigation";

import ProgramEditorView from "@/features/programs/components/editor/program-editor-view";

export default function ProgramEditorPage() {
  const params = useParams<{ programId: string }>();

  return <ProgramEditorView programId={Number(params.programId)} />;
}
