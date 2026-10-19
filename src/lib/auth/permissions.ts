import type { Role } from "@prisma/client";

/**
 * Single source of truth for role-based access control.
 * Enforced server-side in every admin server action / route handler via `requirePermission`.
 * The admin UI also uses it to hide navigation, but hiding is never relied upon.
 */
export const PERMISSIONS = {
  "dashboard.view": ["SUPER_ADMIN", "EDITOR", "MARKETING"],
  "pages.manage": ["SUPER_ADMIN", "EDITOR"],
  "homepage.manage": ["SUPER_ADMIN", "EDITOR", "MARKETING"],
  "navigation.manage": ["SUPER_ADMIN", "EDITOR"],
  "services.manage": ["SUPER_ADMIN", "EDITOR"],
  "projects.manage": ["SUPER_ADMIN", "EDITOR"],
  "industries.manage": ["SUPER_ADMIN", "EDITOR"],
  "articles.manage": ["SUPER_ADMIN", "EDITOR", "MARKETING"],
  "testimonials.manage": ["SUPER_ADMIN", "EDITOR", "MARKETING"],
  "faqs.manage": ["SUPER_ADMIN", "EDITOR", "MARKETING"],
  "media.manage": ["SUPER_ADMIN", "EDITOR", "MARKETING"],
  "leads.view": ["SUPER_ADMIN", "MARKETING"],
  "leads.manage": ["SUPER_ADMIN", "MARKETING"],
  "leads.export": ["SUPER_ADMIN", "MARKETING"],
  "leads.delete": ["SUPER_ADMIN"],
  "contact.manage": ["SUPER_ADMIN", "MARKETING"],
  "social.manage": ["SUPER_ADMIN", "MARKETING"],
  "seo.manage": ["SUPER_ADMIN", "MARKETING"],
  "branding.manage": ["SUPER_ADMIN"],
  "settings.manage": ["SUPER_ADMIN"],
  "users.manage": ["SUPER_ADMIN"],
  "activity.view": ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  EDITOR: "Editor",
  MARKETING: "Marketing Manager",
};
