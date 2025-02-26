import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Dispatch, SetStateAction } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";

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
  slug?: string;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false,
}: DashboardNavProps) {
  const { isMinimized } = useSidebar();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  if (!items?.length) {
    return null;
  }

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        {items.map((item, index) => (
          <div key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <NavLink
                    to={item.href || "#"}
                    end
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        item.children
                          ? ""
                          : isActive
                          ? "bg-accent"
                          : "transparent",
                        item.disabled && "cursor-not-allowed opacity-80"
                      )
                    }
                    onClick={(e) => {
                      if (item.children) {
                        e.preventDefault(); // Prevent redirect when toggling section
                        toggleSection(item.title);
                      }
                      if (setOpen && !item.children) setOpen(false); // Close sidebar only if no children
                    }}
                  >
                    <span className="flex items-center w-full">
                      {item.icon ? (
                        <item.icon className="ml-3 mr-5 size-5 flex-none" />
                      ) : (
                        <ChevronLeft className="ml-3 mr-5 size-5 flex-none" />
                      )}
                      {isMobileNav || (!isMinimized && !isMobileNav) ? (
                        <span className="mr-2 truncate">{item.title}</span>
                      ) : null}
                      {item.children && (
                        <ChevronDown
                          className={`ml-auto transition-transform ${
                            openSections[item.title] ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </span>
                  </NavLink>
                </div>
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

            {/* Render Children */}
            {item.children && openSections[item.title] && (
              <div className="ml-5 mt-1 space-y-1 border-l-2 border-gray-500 pl-3">
                {item.children.map((child, childIndex) => (
                  <NavLink
                    key={childIndex}
                    to={child.href || "#"}
                    end
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md py-2 px-2 text-sm hover:bg-accent hover:text-accent-foreground",
                        isActive ? "bg-accent" : "transparent"
                      )
                    }
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                  >
                    <span className="truncate">{child.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </TooltipProvider>
    </nav>
  );
}
