import { cn } from "@/lib/utils";

import NavUser from "./nav-user";
import { MobileSidebar } from "./sidebar-mobile";
import { ModeToggle } from "@/components/mode-toggle";

export default function Header({ slug }: { slug?: string }) {
  return (
    <header className="sticky inset-x-0 top-0 w-full">
      <nav className="flex items-center justify-between px-4 py-2 md:justify-end">
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar slug={slug} />
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <NavUser />
        </div>
      </nav>
    </header>
  );
}
