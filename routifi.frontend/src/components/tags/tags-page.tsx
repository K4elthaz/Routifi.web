import PageContainer from "../page-container";
import { Breadcrumbs } from "../breadcrumbs";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";

export default function Tags() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Tags", link: "/tags" }]} />

        <div className="flex items-start justify-between">
          <Heading
            title="Tags"
            description="Manage and create your organization and clients tags."
          />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
