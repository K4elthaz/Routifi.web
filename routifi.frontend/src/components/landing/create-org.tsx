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
import { PlusIcon } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

import { useOrganizationStore } from "@/store/organizationStore";
import { OrgData } from "@/types/organization";
import { createOrganization } from "@/api/organizationAPI";

import { useToast } from "@/hooks/use-toast";

export function CreateOrgForm() {
  const form = useForm<OrgData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const { setOrgData } = useOrganizationStore();
  const { toast } = useToast();

  const handleCreateOrg = async (data: OrgData) => {
    try {
      setOrgData(data);
      const response = await createOrganization({
        name: data.name,
        description: data.description,
        // logo: data.logo,
      });
      form.reset();
      toast({
        title: "Organization Created",
        description: "Your organization has been created successfully.",
      });
      console.log(response);
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
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
              <Button type="submit">Create Organization</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
