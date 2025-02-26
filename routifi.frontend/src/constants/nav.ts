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
    href: "/org/{slug}/leads",
    children: [
      {
        title: "Leads",
        href: "/org/{slug}/leads",
      },
      {
        title: "Leads Pool",
        href: "/org/{slug}/leads/pool",
        ownerOnly: true,
      },
      {
        title: "Leads History",
        href: "/org/{slug}/leads/history",
        ownerOnly: true,
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
    .map((item) => {
      if (!isOwner && item.title === "Leads") {
        return {
          ...item,
          href: item.href.replace("{slug}", slug),
          children: undefined,
        };
      }

      return {
        ...item,
        href: item.href ? item.href.replace("{slug}", slug) : undefined,
        children: item.children
          ? item.children
              .map((child) => ({
                ...child,
                href: child.href.replace("{slug}", slug),
              }))
              .filter((child) => isOwner || !child.ownerOnly)
          : undefined,
      };
    })
    .filter((item) => isOwner || item.title === "Leads" || !item.ownerOnly);
};
