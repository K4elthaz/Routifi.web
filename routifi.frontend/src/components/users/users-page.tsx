import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Filter } from "lucide-react";
import { useOrganizationStore } from "@/store/organizationStore";
import { useMemberStore } from "@/store/memberStore";
import UpdateMembersDialog from "./dialog/update-member";
import RemoveMemberDialog from "./dialog/remove-member";
import { InviteButton } from "../dashboard/invite-button";
import { Badge } from "../ui/badge";

export default function Users() {
  const { slug } = useParams<{ slug: string }>();
  const { organizations, fetchOrganizations } = useOrganizationStore();
  const { fetchAllTagsForMembers, memberTags } = useMemberStore();
  const organization = organizations.find((org) => org.slug === slug);

  useEffect(() => {
    if (!organization) {
      fetchOrganizations();
    } else if (organization.members?.length) {
      fetchAllTagsForMembers(organization.id, organization.members ?? []);
    }
  }, [organization]);

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs
          items={[{ title: "Members", link: `/org/${slug}/users` }]}
        />

        <div className="flex items-center justify-between">
          <Heading
            title={`Members`}
            description="Manage your organization and clients."
          />

          {organization ? (
            <InviteButton organizationId={organization.id} />
          ) : null}
        </div>
        <Separator />

        <div className="flex items-center space-x-2">
          <Input placeholder="Search user" className="w-72" />
          <Button variant="outline">
            <Filter />
          </Button>
        </div>

        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Members</TableHead>
                <TableHead className="text-center">Tag</TableHead>
                <TableHead className="hidden sm:table-cell">Response</TableHead>
                <TableHead className="text-right">AVG Response</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="cursor-pointer">
              {organization?.members && organization.members.length > 0 ? (
                organization.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">{member.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {member.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {memberTags[member.id]?.length > 0 ? (
                        memberTags[member.id].map((tag) => (
                          <Badge
                            key={tag.tagId}
                            className="px-2 py-1 rounded-md text-sm mr-1 cursor-pointer"
                            variant="outline"
                          >
                            {tag.tagName}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No Tags</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"></TableCell>
                    <TableCell className="text-right">00.34 </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <UpdateMembersDialog member={member} />
                            </TooltipTrigger>
                            <TooltipContent>Update</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <RemoveMemberDialog member={member} />
                            </TooltipTrigger>
                            <TooltipContent>Remove</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageContainer>
  );
}
