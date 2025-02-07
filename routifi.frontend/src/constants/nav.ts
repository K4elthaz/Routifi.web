import { Home, Users2, User, MapPin, Tags, Settings } from "lucide-react";

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
  {
    title: "Tags",
    href: "/org/tags",
    icon: Tags,
    ownerOnly: true,
  },
  {
    title: "Settings",
    href: "/org/settings",
    icon: Settings,
    ownerOnly: true,
  },
];

export const getNavItems = (slug: string) => {
  return navItems.map((item) => ({
    ...item,
    href: item.href.replace(/{slug}/g, slug),
  }));
};
