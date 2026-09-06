"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { usePutProgramDayContent } from "@/api/programs/mutations";
import { type PutDayContentDto } from "@/api/programs/types";
import { putDayContentSchema } from "@/validation/programSchema";
import { draftToDto, type ExerciseDraft } from "./draft";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

const SAVE_DELAY_MS = 800;

/**
 * Debounced replace-all save of a day's content. Invalid drafts are held
 * back with a message instead of being sent, so the editor never persists
 * something the API would reject.
 */
export function useDayAutosave(programId: number, dayId: number) {
  const put = usePutProgramDayContent();
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<PutDayContentDto | null>(null);

  const send = useDebouncedCallback((dto: PutDayContentDto) => {
    latest.current = null;
    put.mutate(
      { programId, dayId, data: dto },
      {
        onSuccess: () => {
          // A newer draft may already be queued; keep "saving" in that case.
          if (latest.current === null) setStatus("saved");
        },
        onError: (mutationError) => {
          setStatus("error");
          setError(mutationError.message || "Could not save");
        },
      },
    );
  }, SAVE_DELAY_MS);

  const save = (draft: ExerciseDraft[]) => {
    const dto = draftToDto(draft);
    const parsed = putDayContentSchema.safeParse(dto);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setStatus("error");
      setError(
        issue
          ? `${issue.path.join(".")}: ${issue.message}`
          : "Check the values",
      );
      send.cancel();
      return;
    }
    setError(null);
    setStatus("saving");
    latest.current = dto;
    send(dto);
  };

  // Do not lose a pending save when the editor unmounts.
  useEffect(() => () => send.flush(), [send]);

  return { save, status, error };
}
