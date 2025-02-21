import { Copy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { GetOrganizationData } from "@/types/organization";

interface DashboardOrgProps {
  organization: GetOrganizationData;
}

export default function DashboardOrg({ organization }: DashboardOrgProps) {
  const formattedDate = new Date(organization.created_at).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            {organization.name}
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy Organization ID</span>
            </Button>
          </CardTitle>
          <CardDescription>Created at: {formattedDate}</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {/* {organization.logo ? (
            <img
              src={organization.logo}
              alt={`${organization.name} logo`}
              width={48}
              height={48}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted" />
          )} */}
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Organization Details</div>
          <div className="grid gap-3">
            <p className="text-muted-foreground">{organization.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
