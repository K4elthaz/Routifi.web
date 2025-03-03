import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PageContainer from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const sidebarItems = [
  { title: "Profile", link: "/account/profile" },
  { title: "Security", link: "/account/security" },
  { title: "Billing", link: "/account/billing" },
];

export default function AccountSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/account") {
      navigate("/account/profile", { replace: true });
    }
  }, [location, navigate]);

  return (
    <PageContainer>
      <div className="space-y-4 mt-5">
        <Breadcrumbs
          items={[{ title: "Account Settings", link: "/account" }]}
        />

        <div className="flex items-start justify-between">
          <Heading
            title="Account Settings"
            description="Manage your account settings"
          />
        </div>
        <Separator />

        {/* Mobile: Tabs */}
        <div className="md:hidden">
          <Tabs defaultValue={sidebarItems[0].link} className="w-full">
            <TabsList className="w-full flex">
              {sidebarItems.map((item) => (
                <TabsTrigger key={item.link} value={item.link} asChild>
                  <Link to={item.link} className="w-full text-center">
                    {item.title}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>

            {sidebarItems.map((item) => (
              <TabsContent key={item.link} value={item.link}>
                <Outlet />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Desktop: Sidebar */}
        <div className="hidden md:flex space-x-6">
          <aside className="w-64 rounded-lg">
            <nav className="space-y-2 mt-5">
              {sidebarItems.map((item) => (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`block px-2 py-2 rounded-md transition ${
                    location.pathname === item.link
                      ? "bg-zinc-900 text-white"
                      : "hover:bg-accent"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="w-3/4">
            <Outlet />
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
