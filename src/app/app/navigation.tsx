"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  DumbbellIcon,
  HistoryIcon,
  HomeIcon,
  LayoutTemplateIcon,
  ScaleIcon,
  SettingsIcon,
  TrophyIcon,
  UserCogIcon,
  UserRoundIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import SettingsButton, {
  SettingsModal,
} from "@/components/settings/settings-button";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Desktop sidebar has room for a flat list; the mobile bottom bar collapses
// History and Templates into one "Workouts" tab, and body tracking, records
// and settings into one "Profile" tab — each opening a bottom menu.
const desktopNavItems = [
  { label: "Home", href: "/app", icon: HomeIcon },
  { label: "Workouts", href: "/app/workouts", icon: BookOpenIcon },
  { label: "Templates", href: "/app/templates", icon: LayoutTemplateIcon },
  { label: "Exercises", href: "/app/exercises", icon: DumbbellIcon },
  { label: "Body", href: "/app/body-measurements", icon: ScaleIcon },
  { label: "Records", href: "/app/records", icon: TrophyIcon },
];

const workoutsMenuItems = [
  { label: "History", href: "/app/workouts", icon: HistoryIcon },
  { label: "Templates", href: "/app/templates", icon: LayoutTemplateIcon },
];

const profileMenuItems = [
  {
    label: "Body profile",
    href: "/app/body-measurements/profile",
    icon: UserCogIcon,
  },
  {
    label: "Bodyweight tracker",
    href: "/app/body-measurements",
    icon: ScaleIcon,
  },
  { label: "Personal records", href: "/app/records", icon: TrophyIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const [workoutsMenuOpen, setWorkoutsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [, setSettingsOpen] = useSearchParamState("settings");

  // Sections with subroutes (e.g. /app/body-measurements/add) should keep
  // their nav item highlighted; the root matches only exactly.
  const isActivePath = (href: string) =>
    href === "/app"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const isWorkoutsPath = workoutsMenuItems.some(
    (menuItem) => menuItem.href === pathname,
  );
  const isProfilePath =
    isActivePath("/app/body-measurements") || isActivePath("/app/records");

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-background fixed inset-x-0 bottom-0 lg:inset-x-auto lg:inset-y-0 lg:w-[16rem] lg:py-8">
      <div className="hidden px-8 pb-10 lg:block">
        <Logo className="w-full max-w-40" url="/app" />
      </div>
      <nav className="mx-auto grid h-16 max-w-lg lg:h-auto lg:px-4">
        {/* Mobile bottom bar */}
        <ul className="grid grid-cols-4 lg:hidden">
          <li className="grid">
            <Link
              href="/app"
              className={cn(
                "hover:text-accent grid place-items-center transition-colors duration-300",
                pathname === "/app" && "text-accent/75",
              )}
            >
              <div className="flex flex-col items-center">
                <HomeIcon size={20} />
                <span>Home</span>
              </div>
            </Link>
          </li>
          <li className="grid">
            <button
              onClick={() => setWorkoutsMenuOpen(true)}
              className={cn(
                "hover:text-accent grid place-items-center transition-colors duration-300",
                isWorkoutsPath && "text-accent/75",
              )}
            >
              <div className="flex flex-col items-center">
                <BookOpenIcon size={20} />
                <span>Workouts</span>
              </div>
            </button>
          </li>
          <li className="grid">
            <Link
              href="/app/exercises"
              className={cn(
                "hover:text-accent grid place-items-center transition-colors duration-300",
                isActivePath("/app/exercises") && "text-accent/75",
              )}
            >
              <div className="flex flex-col items-center">
                <DumbbellIcon size={20} />
                <span>Exercises</span>
              </div>
            </Link>
          </li>
          <li className="grid">
            <button
              onClick={() => setProfileMenuOpen(true)}
              className={cn(
                "hover:text-accent grid place-items-center transition-colors duration-300",
                isProfilePath && "text-accent/75",
              )}
            >
              <div className="flex flex-col items-center">
                <UserRoundIcon size={20} />
                <span>Profile</span>
              </div>
            </button>
          </li>
        </ul>

        {/* Desktop sidebar */}
        <ul className="hidden lg:flex lg:flex-col lg:gap-4">
          {desktopNavItems.map((navItem) => (
            <li key={navItem.label} className="grid">
              <Link
                href={navItem.href}
                className={cn(
                  "hover:text-accent grid place-items-center transition-colors duration-300 lg:justify-start",
                  isActivePath(navItem.href) && "text-accent/75",
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

      <Drawer open={workoutsMenuOpen} onOpenChange={setWorkoutsMenuOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Workouts</DrawerTitle>
            <DrawerDescription className="sr-only">
              Choose between workout history and workout templates
            </DrawerDescription>
          </DrawerHeader>
          <ul className="grid gap-1 px-4 pb-8">
            {workoutsMenuItems.map((menuItem) => (
              <li key={menuItem.href} className="grid">
                <Link
                  href={menuItem.href}
                  onClick={() => setWorkoutsMenuOpen(false)}
                  className={cn(
                    "hover:text-accent flex items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-300",
                    pathname === menuItem.href && "text-accent/75",
                  )}
                >
                  <menuItem.icon size={20} />
                  <span>{menuItem.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </DrawerContent>
      </Drawer>

      <Drawer open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Profile</DrawerTitle>
            <DrawerDescription className="sr-only">
              Choose between body profile, body tracking, personal records and
              settings
            </DrawerDescription>
          </DrawerHeader>
          <ul className="grid gap-1 px-4 pb-8">
            {profileMenuItems.map((menuItem) => (
              <li key={menuItem.href} className="grid">
                <Link
                  href={menuItem.href}
                  onClick={() => setProfileMenuOpen(false)}
                  className={cn(
                    "hover:text-accent flex items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-300",
                    pathname === menuItem.href && "text-accent/75",
                  )}
                >
                  <menuItem.icon size={20} />
                  <span>{menuItem.label}</span>
                </Link>
              </li>
            ))}
            <li className="grid">
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  setSettingsOpen(true);
                }}
                className="hover:text-accent flex items-center gap-4 rounded-lg px-4 py-3 text-left transition-colors duration-300"
              >
                <SettingsIcon size={20} />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </DrawerContent>
      </Drawer>

      <SettingsModal />
    </aside>
  );
}
