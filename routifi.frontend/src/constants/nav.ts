import { Home, Users2, User, MapPin } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/org/dashboard",
    icon: Home,
  },
  {
    title: "Leads",
    href: "/org/leads",
    icon: Users2,
  },
  {
    title: "Users",
    href: "/org/users",
    icon: User,
  },
  {
    title: "Maps",
    href: "/org/maps",
    icon: MapPin,
  },
];

export const getNavItems = (slug: string) => {
  return navItems.map((item) => ({
    ...item,
    href: item.href.replace(/{slug}/g, slug),
  }));
};
