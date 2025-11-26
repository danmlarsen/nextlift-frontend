"use client";

import { useState } from "react";

import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { formatTimeFromMs } from "@/lib/utils";

const secondsToTimeString = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const timeStringToSeconds = (timeString: string) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

interface DurationInputProps {
  activeDuration: number;
  isEditing: boolean;
  onDurationChanged: (duration: number) => void;
}

export default function DurationInput({
  activeDuration,
  isEditing,
  onDurationChanged,
}: DurationInputProps) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(activeDuration);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onDurationChanged(duration);
    }
    setOpen(open);
  };

  const handleDurationChange = (newDuration: string) => {
    const parsedDuration = timeStringToSeconds(newDuration);
    const MAX_SECONDS = 43200;
    setDuration(Math.min(parsedDuration, MAX_SECONDS));
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button disabled={!isEditing}>
          {formatTimeFromMs(duration * 1000)}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Label htmlFor="time-picker">Duration</Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={secondsToTimeString(duration)}
          onChange={(e) => handleDurationChange(e.target.value)}
        />
      </PopoverContent>
    </Popover>
  );
}
