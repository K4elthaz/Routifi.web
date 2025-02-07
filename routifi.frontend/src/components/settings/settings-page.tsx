import PageContainer from "@/components/page-container";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Settings", link: "/settings" }]} />

        <div className="flex items-center justify-between">
          <Heading
            title={`Settings`}
            description="Manage your organization settings."
          />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
