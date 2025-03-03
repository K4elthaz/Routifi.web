import PageContainer from "../page-container";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";

export default function AccountSecurity() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Security"
            description="Manage your account security"
          />
        </div>
        <Separator />
      </div>
    </PageContainer>
  );
}
