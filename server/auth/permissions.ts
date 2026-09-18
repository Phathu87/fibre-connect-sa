import type { UserRole } from "../../src/generated/prisma/enums.js";

export const permissions = [
  "profile.read.self", "profile.update.self", "address.read.self", "enquiry.read.self",
  "package.read", "package.manage", "provider.manage", "network.manage", "promotion.manage",
  "enquiry.read.assigned", "enquiry.manage", "customer.read", "content.manage", "analytics.read",
  "audit.read", "settings.manage", "roles.manage",
] as const;
export type Permission = typeof permissions[number];

const selfService: Permission[] = ["profile.read.self", "profile.update.self", "address.read.self", "enquiry.read.self", "package.read"];

export const rolePermissions: Record<UserRole, ReadonlySet<Permission>> = {
  USER: new Set(selfService),
  SUPPORT: new Set([...selfService, "enquiry.read.assigned", "customer.read"]),
  SALES: new Set([...selfService, "enquiry.read.assigned", "enquiry.manage", "customer.read"]),
  PROVIDER_MANAGER: new Set([...selfService, "package.manage", "provider.manage", "network.manage", "promotion.manage"]),
  CONTENT_EDITOR: new Set([...selfService, "content.manage"]),
  ANALYST: new Set([...selfService, "analytics.read"]),
  ADMIN: new Set([...selfService, "package.manage", "provider.manage", "network.manage", "promotion.manage", "enquiry.read.assigned", "enquiry.manage", "customer.read", "content.manage", "analytics.read", "audit.read", "settings.manage"]),
  SUPER_ADMIN: new Set(permissions),
};

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].has(permission);
}

export function ownsResource(principalUserId: string, resourceUserId: string) {
  return principalUserId === resourceUserId;
}
