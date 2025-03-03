import { useEffect } from "react";
import PageContainer from "../page-container";
import { Heading } from "../ui/heading";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { useUserProfileStore } from "@/store/userProfileStore";
import useAuthStore from "@/store/authStore";
import GoogleMapsViewer from "../google-maps-viewer";

export default function AccountProfile() {
  const { userProfileData, getUserProfile } = useUserProfileStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      getUserProfile(user.user.supabase_uid);
    }
  }, [getUserProfile, user]);
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Profile" description="Manage your account profile" />
        </div>
        <Separator />

        <div className="flex flex-col gap-4">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            value={userProfileData?.full_name || ""}
            disabled
          />

          <Label htmlFor="email">Email</Label>
          <Input id="email" value={userProfileData?.email || ""} disabled />

          <Label htmlFor="location">Location</Label>
          <GoogleMapsViewer
            value={{
              coordinates: userProfileData?.location
                ? (userProfileData.location.split(", ").map(Number) as [
                    number,
                    number
                  ])
                : [0, 0],
            }}
          />
        </div>
      </div>
    </PageContainer>
  );
}
