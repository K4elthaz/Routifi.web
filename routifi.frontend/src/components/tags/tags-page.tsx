import PageContainer from "../page-container";
import { Breadcrumbs } from "../breadcrumbs";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";

import CreateTagDialog from "./dialog/create-tag";
import TagsTable from "./tags-table";

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

          <CreateTagDialog />
        </div>
        <Separator />
      </div>

      <div className="mt-5">
        <TagsTable />
      </div>
    </PageContainer>
  );
}
