import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Slash } from "lucide-react";
import { Fragment } from "react";

type BreadcrumbItemProps = {
  title: string;
  link: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItemProps[] }) {
  const [lastVisited, setLastVisited] = useState<BreadcrumbItemProps | null>(
    null
  );

  useEffect(() => {
    const storedBreadcrumb = localStorage.getItem("lastBreadcrumb");
    if (storedBreadcrumb) {
      setLastVisited(JSON.parse(storedBreadcrumb));
    }
    localStorage.setItem("lastBreadcrumb", JSON.stringify(items[0])); // Store the current page
  }, [items]);

  return (
    <Breadcrumb className="cursor-pointer">
      <BreadcrumbList>
        {/* Show last visited breadcrumb if available */}
        {lastVisited && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={lastVisited.link}>
                {lastVisited.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
          </>
        )}

        {/* Render current breadcrumb items */}
        {items.map((item, index) => (
          <Fragment key={item.title}>
            {index !== items.length - 1 && (
              <BreadcrumbItem>
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {index < items.length - 1 && (
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
            )}
            {index === items.length - 1 && (
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
