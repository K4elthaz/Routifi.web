import { Home, Users2, User, MapPin } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/org/{slug}",
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
];

export const getNavItems = (slug: string) => {
  return navItems.map((item) => ({
    ...item,
    href: item.href.replace(/{slug}/g, slug),
  }));
};
