import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../server/auth/crypto.js";
import { hasPermission, ownsResource, permissions, rolePermissions } from "../server/auth/permissions.js";

describe("authentication primitives", () => {
  it("stores Argon2id hashes and rejects an incorrect password", async () => {
    const hash = await hashPassword("Correct horse battery staple 42");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain("Correct horse battery staple 42");
    await expect(verifyPassword(hash, "Correct horse battery staple 42")).resolves.toBe(true);
    await expect(verifyPassword(hash, "incorrect password")).resolves.toBe(false);
  });
});

describe("authorization policy", () => {
  it("defines an explicit permission set for every role", () => {
    expect(Object.keys(rolePermissions).sort()).toEqual([
      "ADMIN", "ANALYST", "CONTENT_EDITOR", "PROVIDER_MANAGER", "SALES", "SUPER_ADMIN", "SUPPORT", "USER",
    ]);
    expect([...rolePermissions.SUPER_ADMIN]).toEqual(permissions);
  });

  it("keeps role administration exclusive to super administrators", () => {
    for (const role of Object.keys(rolePermissions)) {
      expect(hasPermission(role as keyof typeof rolePermissions, "roles.manage")).toBe(role === "SUPER_ADMIN");
    }
  });

  it("separates specialist and administrative capabilities", () => {
    expect(hasPermission("USER", "package.manage")).toBe(false);
    expect(hasPermission("SUPPORT", "enquiry.read.assigned")).toBe(true);
    expect(hasPermission("SALES", "enquiry.manage")).toBe(true);
    expect(hasPermission("PROVIDER_MANAGER", "provider.manage")).toBe(true);
    expect(hasPermission("CONTENT_EDITOR", "content.manage")).toBe(true);
    expect(hasPermission("ANALYST", "analytics.read")).toBe(true);
    expect(hasPermission("ADMIN", "audit.read")).toBe(true);
    expect(hasPermission("ADMIN", "roles.manage")).toBe(false);
  });

  it("requires exact ownership for account-scoped resources", () => {
    expect(ownsResource("user-a", "user-a")).toBe(true);
    expect(ownsResource("user-a", "user-b")).toBe(false);
  });
});
