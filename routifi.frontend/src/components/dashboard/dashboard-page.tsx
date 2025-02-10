import { useParams } from "react-router-dom";

import PageContainer from "../page-container";
import { Breadcrumbs } from "../breadcrumbs";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";
import { useOrganizationStore } from "@/store/organizationStore";

export default function Dashboard() {
  const { slug } = useParams();
  const { organizations } = useOrganizationStore();

  const organization = organizations.find((org) => org.slug === slug);

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            {
              title: organization?.name ?? "Organization",
              link: `/org/${slug}`,
            },
          ]}
        />

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
