import PageContainer from "../page-container";
import { Breadcrumbs } from "../breadcrumbs";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";

export default function Dashboard() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Dashboard", link: "/dashboard" }]} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Dashboard`}
            description="Manage your organization and clients."
          />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
