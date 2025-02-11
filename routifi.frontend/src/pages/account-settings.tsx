import PageContainer from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";

export default function AccountSettings() {
  return (
    <div className="flex">
      <main className="w-full flex-1 overflow-hidden">
        <Header />
        <PageContainer>
          <div className="space-y-4">
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
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
