"use client";

import { type WorkoutTemplateData } from "@/api/workout-templates/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import TemplateCardDropdownMenu from "./template-card-dropdown-menu";
import StartWorkoutFromTemplateButton from "./start-workout-from-template-button";
import { useTemplateEditor } from "./template-editor/template-editor-provider";

interface TemplateCardProps {
  template: WorkoutTemplateData;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const { openTemplate } = useTemplateEditor();
  const templateExercises = template.workoutTemplateExercises;
  const totalSets = templateExercises.reduce(
    (sum, templateExercise) =>
      sum + templateExercise.workoutTemplateSets.length,
    0,
  );

  return (
    <Card className="text-left">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button
            onClick={() => openTemplate(template.id)}
            variant="link"
            className="px-0 font-bold lg:text-xl"
          >
            {template.name}
          </Button>
          <TemplateCardDropdownMenu templateId={template.id} />
        </div>
        <CardDescription>
          {templateExercises.length}{" "}
          {templateExercises.length === 1 ? "exercise" : "exercises"} ·{" "}
          {totalSets} {totalSets === 1 ? "set" : "sets"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {templateExercises.length === 0 && (
          <p className="text-muted-foreground py-4 text-center font-medium">
            No exercises added
          </p>
        )}
        {templateExercises.length > 0 && (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-auto">Exercise</TableHead>
                <TableHead className="w-16 text-center">Sets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templateExercises.map((templateExercise) => (
                <TableRow key={templateExercise.id}>
                  <TableCell title={templateExercise.exercise.name}>
                    <div className="truncate">
                      {templateExercise.exercise.name}
                    </div>
                  </TableCell>
                  <TableCell className="w-16 text-center">
                    {templateExercise.workoutTemplateSets.length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <StartWorkoutFromTemplateButton templateId={template.id} />
      </CardContent>
    </Card>
  );
}

export function TemplateCardSkeleton() {
  return (
    <li>
      <Skeleton className="h-[200px] rounded-xl" />
    </li>
  );
}
