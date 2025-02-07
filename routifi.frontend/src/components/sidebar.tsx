import { Link } from "react-router-dom";

import { useSidebar } from "@/hooks/use-sidebar";
import AppLogo from "./app-logo";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

import { DashboardNav } from "./nav";
import { getNavItems } from "@/constants/nav";

type SidebarProps = {
  className?: string;
  logo?: string;
  slug?: string;
};

export default function Sidebar({ className, logo, slug }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();

  const handleToggle = () => {
    toggle();
  };
  return (
    <aside
      className={cn(
        `relative  hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block`,
        !isMinimized ? "w-72" : "w-[72px]",
        className
      )}
    >
      <div className="hidden p-5 pt-10 lg:block">
        <Link to="/dashboard">
          {logo ? (
            <img src={logo} alt="Organization Logo" width={24} height={24} />
          ) : (
            <AppLogo size={24} />
          )}
        </Link>
      </div>
      <ChevronLeft
        className={cn(
          "absolute -right-3 top-12 z-50  cursor-pointer rounded-full border bg-background text-3xl text-foreground scale-75",
          isMinimized && "rotate-180"
        )}
        onClick={handleToggle}
      />
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mt-3 space-y-1">
            <DashboardNav items={getNavItems(slug || "")} />
          </div>
        </div>
      </div>
    </aside>
  );
}
