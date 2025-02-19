import { useParams } from "react-router-dom";
import { useEffect } from "react";
import PageContainer from "../page-container";
import { Breadcrumbs } from "../breadcrumbs";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { useOrganizationStore } from "@/store/organizationStore";
import { InviteButton } from "./invite-button";
import DashboardMembersCard from "./cards/members";
import DashboardOrg from "./cards/organization-details";

export default function Dashboard() {
  const { slug } = useParams();
  const { organizations, fetchOrganizations } = useOrganizationStore();

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

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

        <div className="flex w-full flex-col bg-muted/40">
          <div className="flex flex-col sm:gap-4 sm:py-4">
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
              <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  <Card className="sm:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle>{organization?.name}</CardTitle>
                      <CardDescription className="max-w-lg text-balance leading-relaxed">
                        {organization?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      {organization && (
                        <InviteButton organizationId={organization.id} />
                      )}
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Performance Score</CardDescription>
                      <CardTitle className="text-4xl">48</CardTitle>
                    </CardHeader>
                    <CardFooter>
                      <Progress value={48} aria-label="25% increase" />
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription> Accumulated leads</CardDescription>
                      <CardTitle className="text-4xl">681</CardTitle>
                    </CardHeader>
                    <CardFooter>
                      <Progress value={100} aria-label="12% increase" />
                    </CardFooter>
                  </Card>
                </div>
                <DashboardMembersCard />
              </div>
              {organization && <DashboardOrg organization={organization} />}
            </main>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
