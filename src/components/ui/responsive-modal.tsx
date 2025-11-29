"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";

interface ResponsiveModalProps {
  content: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  className?: string;
  scrollParentRef?: React.RefObject<HTMLDivElement | null>;
  onAnimationEnd?: () => void;
}

export function ResponsiveModal({
  content,
  isOpen,
  onOpenChange,
  title,
  description,
  className,
  scrollParentRef,
  onAnimationEnd,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          className="sm:max-w-lg"
          onAnimationEnd={onAnimationEnd}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div
            className={cn("overflow-y-auto", className)}
            ref={scrollParentRef}
          >
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  } else {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        onAnimationEnd={onAnimationEnd}
      >
        <DrawerContent
          className="h-[100dvh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div
            className={cn("overflow-y-auto", className)}
            ref={scrollParentRef}
          >
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
}
