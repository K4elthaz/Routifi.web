import { User, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "@/api/userAuthAPI";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/authStore";

export default function NavUser() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const handleLogout = () => {
    logoutUser();
    navigate("/sign-in");

    toast({
      title: "Logout Successful",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="sample-avatar.png" alt="avatar" />
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Coach</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={`/account/`}>Account Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogout();
          }}
        >
          <DropdownMenuItem>
            <button type="submit" className="w-full text-start">
              Log out
            </button>
          </DropdownMenuItem>
        </form>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-row items-center space-x-2">
              <p className="text-xs leading-none text-muted-foreground">
                <a href="/" className="flex items-center space-x-1">
                  <Plus size={16} />
                  <span>Create Organization</span>
                </a>
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
