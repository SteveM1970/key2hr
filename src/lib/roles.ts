export const ROLES = ["admin", "manager", "staff"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function roleHomePath(role: Role): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "manager":
      return "/manager";
    case "staff":
      return "/staff";
  }
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "manager":
      return "Manager";
    case "staff":
      return "Staff";
  }
}

export type NavItem = {
  href: string;
  label: string;
  /** Placeholder destinations until later MVP slices land. */
  placeholder?: boolean;
};

export function navigationForRole(role: Role): NavItem[] {
  switch (role) {
    case "admin":
      return [
        { href: "/admin", label: "Home" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/personnel", label: "Personnel", placeholder: true },
        { href: "/admin/org", label: "Org structure", placeholder: true },
        { href: "/admin/workflows", label: "Workflows", placeholder: true },
        { href: "/admin/exports", label: "Excel export", placeholder: true },
        { href: "/admin/settings", label: "Settings", placeholder: true },
      ];
    case "manager":
      return [
        { href: "/manager", label: "Home" },
        { href: "/manager/team", label: "Direct reports", placeholder: true },
        { href: "/manager/approvals", label: "Approvals", placeholder: true },
        { href: "/manager/exports", label: "Team export", placeholder: true },
      ];
    case "staff":
      return [
        { href: "/staff", label: "Home" },
        { href: "/staff/profile", label: "My record", placeholder: true },
        { href: "/staff/leave", label: "Leave request", placeholder: true },
        { href: "/staff/workflows", label: "My workflows", placeholder: true },
      ];
  }
}

export function canAccessPath(role: Role, pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/admin")) return role === "admin";
  if (pathname.startsWith("/manager")) return role === "manager";
  if (pathname.startsWith("/staff")) return role === "staff";
  return false;
}
