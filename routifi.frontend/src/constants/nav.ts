import { Home, Users2, User, MapPin, Tags, Settings } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/org/{slug}/dashboard",
    icon: Home,
  },
  {
    title: "Leads",
    href: "/org/{slug}/leads",
    icon: Users2,
  },
  {
    title: "Users",
    href: "/org/{slug}/users",
    icon: User,
  },
  {
    title: "Maps",
    href: "/org/{slug}/maps",
    icon: MapPin,
  },
  {
    title: "Tags",
    href: "/org/{slug}/tags",
    icon: Tags,
    ownerOnly: true,
  },
  {
    title: "Settings",
    href: "/org/{slug}/settings",
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
