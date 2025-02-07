import PageContainer from "@/components/page-container";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function Maps() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Maps", link: "/maps" }]} />

        <div className="flex items-center justify-between">
          <Heading
            title={`Maps`}
            description="Manage your leads pinned locations."
          />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
