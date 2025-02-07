import { NavLink } from "react-router-dom";
import { Dispatch, SetStateAction } from "react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false,
}: DashboardNavProps) {
  const { isMinimized } = useSidebar();

  if (!items?.length) {
    return null;
  }

  console.log("isActive", isMobileNav, isMinimized);

  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        {items.map(
          (item, index) =>
            item.href && (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.disabled ? "/" : item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        isActive ? "bg-accent" : "transparent",
                        item.disabled && "cursor-not-allowed opacity-80"
                      )
                    }
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                  >
                    <span className="flex items-center">
                      {item.icon ? (
                        <item.icon className="ml-3 mr-5 size-5 flex-none" />
                      ) : (
                        <ChevronLeft className="ml-3 mr-5 size-5 flex-none" />
                      )}
                      {isMobileNav || (!isMinimized && !isMobileNav) ? (
                        <span className="mr-2 truncate">{item.title}</span>
                      ) : null}
                    </span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="right"
                  sideOffset={8}
                  className={!isMinimized ? "hidden" : "inline-block"}
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            )
        )}
      </TooltipProvider>
    </nav>
  );
}
