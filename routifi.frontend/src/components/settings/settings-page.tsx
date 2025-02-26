import { useState } from "react";
import { Eye, EyeOff, Copy } from "lucide-react";

import PageContainer from "@/components/page-container";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { useParams } from "react-router-dom";
import { useOrganizationStore } from "@/store/organizationStore";
import { useToast } from "@/hooks/use-toast";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

export default function Settings() {
  const { slug } = useParams<{ slug: string }>();
  const { organizations } = useOrganizationStore();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleCopy = (apiKey?: string) => {
    if (!apiKey) return;

    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API Key copied to clipboard",
    });
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Settings", link: "/settings" }]} />

        <div className="flex items-center justify-between">
          <Heading
            title={`Settings`}
            description="Manage your organization settings."
          />
        </div>
        <Separator />
      </div>

      <div className="mt-4 space-y-4">
        {organizations
          .filter((org) => org.slug === slug)
          .map((org) => (
            <div key={org.id} className="relative">
              <Label htmlFor="api_key">API KEY</Label>
              <div className="relative">
                <Input
                  className="p-5 pr-14"
                  disabled
                  type={showApiKey ? "text" : "password"}
                  value={org.api_key}
                />
                <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(org.api_key)}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </PageContainer>
  );
}
