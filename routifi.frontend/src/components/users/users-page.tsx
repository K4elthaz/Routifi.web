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
import { Filter } from "lucide-react";

export default function Users() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Users", link: "/users" }]} />

        <div className="flex items-center justify-between">
          <Heading
            title={`Users`}
            description="Manage your organization and clients."
          />

          <Button size="sm">Add User</Button>
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
                <TableHead className="hidden sm:table-cell">Response</TableHead>
                <TableHead className="text-right">AVG Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Liam Johnson</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    liam@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="text-right">00.34</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Olivia Smith</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    olivia@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="text-right">00.45</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Noah Williams</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    noah@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="text-right">00.54</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Emma Brown</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    emma@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="text-right">00.64</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Liam Johnson</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    liam@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="text-right">00.24</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Liam Johnson</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    liam@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="text-right">00.32</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Olivia Smith</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    olivia@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="text-right">00.36</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Emma Brown</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    emma@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"></TableCell>
                <TableCell className="text-right">00.38</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </PageContainer>
  );
}
