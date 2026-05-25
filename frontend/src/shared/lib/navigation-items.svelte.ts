import {
  LayoutDashboard,
  Monitor,
  Settings,
  ShieldAlert,
  Tag,
} from "@lucide/svelte";

export function getNavItemIcon(navItemTitle: string) {
  const navItemTitleLower = navItemTitle.toLowerCase();
  switch (navItemTitleLower) {
    case "dashboard":
      return LayoutDashboard;
    case "devices":
      return Monitor;
    case "rules":
      return ShieldAlert;
    case "tags":
      return Tag;
    case "configuration":
      return Settings;
    default:
      return LayoutDashboard;
  }
}
