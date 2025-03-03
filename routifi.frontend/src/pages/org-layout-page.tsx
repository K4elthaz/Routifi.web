import { useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useOrganizationStore } from "@/store/organizationStore";

import { Outlet, useParams } from "react-router-dom";

export default function OrgnaizationParent() {
  const { slug } = useParams();
  const { fetchOrganizations } = useOrganizationStore();

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return (
    <div className="flex">
      <Sidebar slug={slug} />
      <main className="w-full flex-1 overflow-hidden">
        <Header slug={slug} />
        <Outlet />
      </main>
    </div>
  );
}
