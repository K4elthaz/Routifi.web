import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Card } from "../ui/card";
import { useTagStore } from "@/store/tagStore";
import UpdateTagDialog from "./dialog/update-tag";
import DeleteTagDialog from "./dialog/delete-tag";

export default function TagsTable() {
  const { slug } = useParams<{ slug: string }>();
  const { tags, getTags } = useTagStore();

  useEffect(() => {
    if (slug) {
      getTags(slug);
    }
  }, [slug, getTags]);

  return (
    <Card>
      <Table className="text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Tag</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.name}</TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <UpdateTagDialog tag={tag} />
                      </TooltipTrigger>
                      <TooltipContent>Update</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <DeleteTagDialog tag={tag} />
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
