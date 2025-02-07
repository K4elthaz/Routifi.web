import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

export default function OrgnaizationParent() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="w-full flex-1 overflow-hidden">
        <Header />
      </main>
    </div>
  );
}
