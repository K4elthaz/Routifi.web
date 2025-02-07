import PageContainer from "../page-container";
import { Breadcrumbs } from "../breadcrumbs";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";

export default function Leads() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Leads", link: "/dashboard/leads" }]} />

        <div className="flex items-start justify-between">
          <Heading
            title="Leads"
            description="Manage your organization and clients."
          />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
