import { Link } from "react-router-dom";
import { useOrganizationStore } from "@/store/organizationStore";

export default function OrganizationList() {
  const organizations = useOrganizationStore((state) => state.organizations);
  return (
    <div>
      <ul>
        {organizations.map((org, index) => (
          <li
            key={index}
            className="flex space-x-2 p-2 items-center rounded-md hover:bg-accent transition-colors"
          >
            <Link
              to={`/org/${org.slug}`}
              className="text-xs text-foreground hover:underline"
            >
              {org.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
