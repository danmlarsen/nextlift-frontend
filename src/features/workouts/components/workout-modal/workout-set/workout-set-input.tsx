import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function WorkoutSetInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      type="number"
      className={cn("h-8 text-center text-sm", className)}
      {...props}
    />
  );
}
