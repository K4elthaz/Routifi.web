import PageContainer from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function LeadsPool() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Leads Pool", link: "/leads/pool" }]} />

        <div className="flex items-start justify-between">
          <Heading
            title="Leads Pool"
            description="Manage your organization leads pool."
          />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
