import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WeeklyReportButton() {
  return (
    <Button variant="ghost" asChild>
      <Link href="/app/weekly-report">
        <span>Weekly Report</span> <ChevronRightIcon />
      </Link>
    </Button>
  );
}
