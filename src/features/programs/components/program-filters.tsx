"use client";

import { ChevronDownIcon } from "lucide-react";

import {
  PROGRAM_GOALS,
  PROGRAM_LEVELS,
  type ProgramGoal,
  type ProgramLevel,
  type ProgramsQueryFilters,
} from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PROGRAM_GOAL_LABELS,
  PROGRAM_LEVEL_LABELS,
} from "@/lib/program-format";

const DAYS_OPTIONS = [2, 3, 4, 5, 6];
const ALL = "all";

interface ProgramFiltersProps {
  filters: ProgramsQueryFilters;
  onChange: (filters: ProgramsQueryFilters) => void;
}

function FilterMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-between"
          aria-label={label}
        >
          <span className="truncate">
            {value === ALL ? label : selected?.label}
          </span>
          <ChevronDownIcon className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          <DropdownMenuRadioItem value={ALL} className="py-3">
            All
          </DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="py-3"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ProgramFilters({
  filters,
  onChange,
}: ProgramFiltersProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <FilterMenu
        label="Goal"
        value={filters.goal ?? ALL}
        options={PROGRAM_GOALS.map((goal) => ({
          value: goal,
          label: PROGRAM_GOAL_LABELS[goal],
        }))}
        onChange={(value) =>
          onChange({
            ...filters,
            goal: value === ALL ? undefined : (value as ProgramGoal),
          })
        }
      />
      <FilterMenu
        label="Level"
        value={filters.level ?? ALL}
        options={PROGRAM_LEVELS.map((level) => ({
          value: level,
          label: PROGRAM_LEVEL_LABELS[level],
        }))}
        onChange={(value) =>
          onChange({
            ...filters,
            level: value === ALL ? undefined : (value as ProgramLevel),
          })
        }
      />
      <FilterMenu
        label="Days/week"
        value={filters.daysPerWeek ? String(filters.daysPerWeek) : ALL}
        options={DAYS_OPTIONS.map((days) => ({
          value: String(days),
          label: `${days} days`,
        }))}
        onChange={(value) =>
          onChange({
            ...filters,
            daysPerWeek: value === ALL ? undefined : Number(value),
          })
        }
      />
    </div>
  );
}
