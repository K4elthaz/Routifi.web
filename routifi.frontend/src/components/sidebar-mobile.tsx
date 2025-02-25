import { MenuIcon } from "lucide-react";
import { useState } from "react";

import { DashboardNav } from "./nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { getNavItems } from "@/constants/nav";
import useAuthStore from "@/store/authStore";
import { useOrganizationStore } from "@/store/organizationStore";

export function MobileSidebar({ slug }: { slug?: string }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const { organizations } = useOrganizationStore();

  const isOwner = organizations.some(
    (org) => org.created_by === user?.user.supabase_uid
  );

  const processedNavItems = slug ? getNavItems(slug, isOwner) : [];
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Overview
              </h2>
              <div className="space-y-1">
                <DashboardNav
                  items={processedNavItems}
                  isMobileNav={true}
                  setOpen={setOpen}
                  slug={slug}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
