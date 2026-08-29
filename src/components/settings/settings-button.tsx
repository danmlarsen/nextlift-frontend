"use client";

import Link from "next/link";
import { SettingsIcon } from "lucide-react";

import { ResponsiveModal } from "../ui/responsive-modal";
import ChangePasswordButton from "@/components/settings/change-password-button";
import ThemeToggle from "../theme-toggle";
import { Button } from "../ui/button";
import DeleteAccountButton from "@/components/settings/delete-account-button";
import { useSearchParamState } from "@/hooks/use-search-param-state";

/**
 * The settings dialog itself. Mount it once; any trigger can open it through
 * the shared "settings" search param.
 */
export function SettingsModal() {
  const [isOpen, setIsOpen] = useSearchParamState("settings");

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      content={
        <div className="space-y-4 px-4">
          <div className="flex min-h-12 items-center justify-between">
            <h1 className="text-xl font-bold">Settings</h1>
          </div>

          <ChangePasswordButton className="w-full" />
          <ThemeToggle />
          <Button asChild className="w-full">
            <Link href="/logout">Logout</Link>
          </Button>
          <DeleteAccountButton className="w-full" />
        </div>
      }
    />
  );
}

export default function SettingsButton() {
  const [, setIsOpen] = useSearchParamState("settings");

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="text-foreground hover:text-accent flex flex-col items-center justify-center gap-0 bg-transparent hover:bg-transparent lg:flex-row lg:gap-4 lg:px-4 lg:py-2"
    >
      <SettingsIcon className="size-5" />
      <span>Settings</span>
    </button>
  );
}
