import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

import { Outlet } from "react-router-dom";

export default function OrgnaizationParent() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="w-full flex-1 overflow-hidden">
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
