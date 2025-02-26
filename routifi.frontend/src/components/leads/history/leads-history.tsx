import PageContainer from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function LeadsHistory() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs
          items={[{ title: "Leads History", link: "/leads/history" }]}
        />

        <div className="flex items-start justify-between">
          <Heading
            title="Leads History"
            description="View the history of all leads."
          />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
