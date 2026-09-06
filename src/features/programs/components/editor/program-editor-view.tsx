"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateProgramBlock,
  useDeleteProgram,
} from "@/api/programs/mutations";
import { useProgram } from "@/api/programs/queries";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlockEditor from "./block-editor";
import ProgramMetaForm from "./program-meta-form";
import ProgramReadiness from "./program-readiness";

interface ProgramEditorViewProps {
  programId: number;
}

export default function ProgramEditorView({
  programId,
}: ProgramEditorViewProps) {
  const router = useRouter();
  const program = useProgram(programId);
  const createBlock = useCreateProgramBlock();
  const deleteProgram = useDeleteProgram();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blockTab, setBlockTab] = useState<string | null>(null);

  const blocks = program.data?.blocks ?? [];
  const activeBlock =
    blocks.find((block) => String(block.id) === blockTab) ?? blocks[0];

  const handleDelete = () => {
    setDeleteOpen(false);
    deleteProgram.mutate(programId, {
      onSuccess: () => {
        toast.success("Program deleted");
        router.push("/app/programs");
      },
      onError: (error) =>
        toast.error(error.message || "Could not delete the program"),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex min-h-12 items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push(`/app/programs/${programId}`)}
          aria-label="Back"
        >
          <ChevronLeftIcon />
        </Button>
        <h1 className="truncate text-xl font-bold">
          {program.data ? `Edit ${program.data.name}` : "Edit program"}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Program actions">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/app/programs/${programId}`}>Preview</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              Delete program
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {program.isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[240px] rounded-xl" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      )}
      {program.isError && (
        <p className="text-destructive">This program could not be loaded.</p>
      )}
      {program.isSuccess && !program.data.isOwner && (
        <p className="text-muted-foreground">
          Curated programs cannot be edited. Use &quot;Customize a copy&quot; on
          the program page to get an editable version.
        </p>
      )}

      {program.isSuccess && program.data.isOwner && (
        <>
          <ProgramMetaForm program={program.data} />
          <ProgramReadiness programId={programId} />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">
                {blocks.length > 1 ? "Blocks" : "Structure"}
              </h2>
              <Button
                variant="outline"
                size="sm"
                disabled={createBlock.isPending || blocks.length >= 12}
                onClick={() =>
                  createBlock.mutate(
                    {
                      programId,
                      data: { name: `Block ${blocks.length + 1}`, weeks: 4 },
                    },
                    {
                      onSuccess: (updated) =>
                        setBlockTab(
                          String(updated.blocks[updated.blocks.length - 1]?.id),
                        ),
                      onError: (error) =>
                        toast.error(error.message || "Could not add a block"),
                    },
                  )
                }
              >
                <PlusIcon /> Block
              </Button>
            </div>

            {blocks.length > 1 && activeBlock && (
              <Tabs value={String(activeBlock.id)} onValueChange={setBlockTab}>
                <TabsList className="flex-wrap">
                  {blocks.map((block) => (
                    <TabsTrigger key={block.id} value={String(block.id)}>
                      {block.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {blocks.map((block) => (
                  <TabsContent key={block.id} value={String(block.id)}>
                    <BlockEditor
                      programId={programId}
                      block={block}
                      blockCount={blocks.length}
                      level={program.data.level}
                      scheduleMode={program.data.scheduleMode}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
            {blocks.length === 1 && activeBlock && (
              <BlockEditor
                programId={programId}
                block={activeBlock}
                blockCount={1}
                level={program.data.level}
                scheduleMode={program.data.scheduleMode}
              />
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete program?"
        text="Anyone currently following it keeps their copy; the program itself is removed."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
