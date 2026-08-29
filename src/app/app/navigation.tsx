"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  DumbbellIcon,
  HomeIcon,
  LayoutTemplateIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import SettingsButton from "@/components/settings/settings-button";

const navItems = [
  { label: "Home", href: "/app", icon: HomeIcon },
  { label: "Workouts", href: "/app/workouts", icon: BookOpenIcon },
  { label: "Templates", href: "/app/templates", icon: LayoutTemplateIcon },
  { label: "Exercises", href: "/app/exercises", icon: DumbbellIcon },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-background fixed inset-x-0 bottom-0 lg:inset-x-auto lg:inset-y-0 lg:w-[16rem] lg:py-8">
      <div className="hidden px-8 pb-10 lg:block">
        <Logo className="w-full max-w-40" url="/app" />
      </div>
      <nav className="mx-auto grid h-16 max-w-lg lg:h-auto lg:px-4">
        <ul className="grid grid-cols-5 lg:flex lg:flex-col lg:gap-4">
          {navItems.map((navItem) => (
            <li key={navItem.label} className="grid">
              <Link
                href={navItem.href}
                className={cn(
                  "hover:text-accent grid place-items-center transition-colors duration-300 lg:justify-start",
                  navItem.href === pathname && "text-accent/75",
                )}
              >
                <div className="flex flex-col items-center lg:flex-row lg:gap-4 lg:px-4 lg:py-2">
                  <navItem.icon size={20} />
                  <span>{navItem.label}</span>
                </div>
              </Link>
            </li>
          ))}
          <li className="grid place-items-center lg:justify-start">
            <SettingsButton />
          </li>
        </ul>
      </nav>
    </aside>
  );
}
