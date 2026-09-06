"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-2 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={htmlFor} className="text-xs">
        {label}
      </Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

interface NumberFieldProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type"
> {
  value: number | null | undefined;
  /** Called on blur with the parsed value; empty input yields null. */
  onCommit: (value: number | null) => void;
}

/**
 * Number input that keeps what the user is typing as text and only commits
 * a parsed value on blur, so "2." or an empty field never turns into 0.
 */
export function NumberField({
  value,
  onCommit,
  className,
  ...props
}: NumberFieldProps) {
  const [text, setText] = useState(value == null ? "" : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value == null ? "" : String(value));
  }, [value, focused]);

  return (
    <Input
      type="number"
      inputMode="decimal"
      className={cn("h-9 text-sm", className)}
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        setFocused(false);
        const trimmed = text.trim();
        if (trimmed === "") {
          onCommit(null);
          return;
        }
        const parsed = Number(trimmed);
        if (Number.isFinite(parsed)) {
          onCommit(parsed);
        } else {
          setText(value == null ? "" : String(value));
        }
      }}
      {...props}
    />
  );
}

interface TextFieldProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange"
> {
  value: string;
  onCommit: (value: string) => void;
}

/** Text input that commits on blur (autosave pattern of the template editor). */
export function TextField({ value, onCommit, ...props }: TextFieldProps) {
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value);
  }, [value, focused]);

  return (
    <Input
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        setFocused(false);
        if (text !== value) onCommit(text);
      }}
      {...props}
    />
  );
}
