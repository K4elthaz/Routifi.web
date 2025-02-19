import PageContainer from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function AccountSettings() {
  return (
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
        <div className="flex h-[calc(80vh-24px)]">
          <aside className="w-64 p-4 flex flex-col space-y-2 items-start">
            <Button variant="ghost" className="w-full justify-start">
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Security
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Billing
            </Button>
          </aside>
          <Separator orientation="vertical" className="h-auto" />
        </div>
      </div>
    </PageContainer>
  );
}
