import PageContainer from "../page-container";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";

export default function AccountBilling() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Billing" description="Manage your account billing" />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
