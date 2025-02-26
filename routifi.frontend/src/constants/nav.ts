import { Home, Users2, User, MapPin, Tags, Settings } from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/org/{slug}/dashboard",
    icon: Home,
  },
  {
    title: "Leads",
    icon: Users2,
    children: [
      {
        title: "Leads",
        href: "/org/{slug}/leads",
      },
      {
        title: "Leads Pool",
        href: "/org/{slug}/leads/pool",
      },
      {
        title: "Leads History",
        href: "/org/{slug}/leads/history",
      },
    ],
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

export const getNavItems = (slug: string, isOwner: boolean) => {
  return navItems
    .map((item) => ({
      ...item,
      href: item.href ? item.href.replace("{slug}", slug) : undefined,
      children: item.children
        ? item.children.map((child) => ({
            ...child,
            href: child.href.replace("{slug}", slug),
          }))
        : undefined,
    }))
    .filter((item) => isOwner || !item.ownerOnly);
};
