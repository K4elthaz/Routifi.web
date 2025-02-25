import PageContainer from "@/components/page-container";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { useParams } from "react-router-dom";
import { useOrganizationStore } from "@/store/organizationStore";

import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function Settings() {
  const { slug } = useParams<{ slug: string }>();
  const { organizations } = useOrganizationStore();

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

      <div className="mt-4 space-y-4">
        {organizations
          .filter((org) => org.slug === slug)
          .map((org) => (
            <div key={org.id}>
              <Label htmlFor="api_key">API KEY</Label>
              <Input className="p-5" disabled value={org.api_key} />
            </div>
          ))}
      </div>
    </PageContainer>
  );
}
