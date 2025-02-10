import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect } from "react";
import { useOrganizationStore } from "@/store/organizationStore";
import useLoadingStore from "@/store/loadingStore";

import useAuthStore from "@/store/authStore";

export default function OrganizationList() {
  const { user } = useAuthStore();
  const { organizations, fetchOrganizations } = useOrganizationStore();
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    if (user && organizations.length === 0) {
      setLoading(true);
      fetchOrganizations()
        .catch((error) =>
          console.error("Failed to fetch organizations:", error)
        )
        .finally(() => setLoading(false));
    }
  }, [user, organizations.length, fetchOrganizations, setLoading]);

  if (!user) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center">
        <p>You are not logged in</p>
      </div>
    );
  }

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.created_by === user.supabase_uid || org.members.includes(user.uid)
  );

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-base text-muted-foreground">
          Your Organizations
        </CardTitle>
      </CardHeader>
      <CardContent className="items-center">
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 items-center text-g">
          {filteredOrganizations.length === 0 ? (
            <p>No organizations found.</p>
          ) : (
            filteredOrganizations.map((org) => (
              <Link
                key={org.id}
                to={`/org/${org.slug}`}
                className="w-full md:w-auto"
              >
                <Card className="flex items-center p-4 gap-4 transition-shadow duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src="/logo.png"
                      alt="Organization logo"
                      className="rounded-full"
                      width={48}
                      height={48}
                    />
                  </div>
                  <p className="text-base text-center">{org.name}</p>
                </Card>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
