import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusIcon, Loader2 } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";

import { useOrganizationStore } from "@/store/organizationStore";
import useLoadingStore from "@/store/loadingStore";
import { OrgData } from "@/types/organization";
import { useToast } from "@/hooks/use-toast";

export function CreateOrgForm() {
  const form = useForm<OrgData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const { addOrganization } = useOrganizationStore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { loading, setLoading } = useLoadingStore();

  const handleCreateOrg = async (data: OrgData) => {
    try {
      setLoading(true);
      await addOrganization(data);
      form.reset();
      toast({
        title: "Organization Created",
        description: "Your organization has been created successfully.",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating organization:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={loading}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] max-w-[100vw] h-[100vh] sm:h-auto">
        <div className="space-y-2">
          <DialogTitle>
            <div className="text-2xl font-bold">Create Organization</div>
          </DialogTitle>
          <DialogDescription>
            Enter organization details below to create your organization.
          </DialogDescription>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateOrg)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Organization Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your organization&apos;s visible name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter organization description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your organization&apos;s purpose or mission.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) =>
                        e.target.files && field.onChange(e.target.files[0])
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your organization logo. Max size: 5MB. Supported
                    formats: JPG, PNG
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Creating..." : "Create Organization"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
