import "dotenv/config";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../server/app.js";
import { loadEnv } from "../server/config/env.js";
import { disconnectDatabase, getDatabase } from "../server/db/client.js";

afterEach(async () => {
  await disconnectDatabase();
});

describe("Supabase PostgreSQL integration", () => {
  it("reads the seeded catalogue and reports database readiness", async () => {
    const env = loadEnv();
    const database = getDatabase(env.DATABASE_URL);

    const [provider, network, broadbandPackage] = await Promise.all([
      database.provider.findFirst({ where: { active: true }, orderBy: { slug: "asc" } }),
      database.networkOperator.findFirst({ where: { active: true }, orderBy: { slug: "asc" } }),
      database.broadbandPackage.findFirst({ where: { active: true }, orderBy: { slug: "asc" } }),
    ]);

    expect(provider).toMatchObject({ slug: "afrihost" });
    expect(network).toMatchObject({ slug: "frogfoot" });
    expect(broadbandPackage).toMatchObject({ slug: "demo-afrihost-50-50" });

    const app = createApp(env);
    const response = await app.inject({ method: "GET", url: "/api/ready" });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ready", database: "available" });
  });

  it("keeps liveness healthy while readiness fails for an unavailable database", async () => {
    const env = {
      ...loadEnv(),
      DATABASE_URL: "postgresql://invalid:invalid@127.0.0.1:1/invalid",
    };
    const app = createApp(env);

    const health = await app.inject({ method: "GET", url: "/api/health" });
    const ready = await app.inject({ method: "GET", url: "/api/ready" });
    await app.close();

    expect(health.statusCode).toBe(200);
    expect(health.json()).toMatchObject({ status: "ok" });
    expect(ready.statusCode).toBe(503);
    expect(ready.json()).toEqual({ status: "not_ready", database: "unavailable" });
  });

  it("serves validated catalogue filters, sorting and detail from PostgreSQL", async () => {
    const env = loadEnv();
    const app = createApp(env);

    const filtered = await app.inject({
      method: "GET",
      url: "/api/catalogue/packages?minSpeed=100&sort=highest-speed&pageSize=10",
    });
    const detail = await app.inject({
      method: "GET",
      url: "/api/catalogue/packages/demo-afrihost-50-50",
    });
    const invalid = await app.inject({
      method: "GET",
      url: "/api/catalogue/packages?page=0",
    });
    await app.close();

    expect(filtered.statusCode).toBe(200);
    expect(filtered.json().items.map((item: { downloadMbps: number }) => item.downloadMbps)).toEqual([200, 100, 100]);
    expect(detail.statusCode).toBe(200);
    expect(detail.json()).toMatchObject({ slug: "demo-afrihost-50-50", provider: { slug: "afrihost" }, network: { slug: "vumatel" } });
    expect(invalid.statusCode).toBe(400);
    expect(invalid.json().error.code).toBe("validation_error");
  });

  it("excludes inactive packages and retains expired promotions as historical data", async () => {
    const env = loadEnv();
    const database = getDatabase(env.DATABASE_URL);
    const provider = await database.provider.findUniqueOrThrow({ where: { slug: "afrihost" } });
    const network = await database.networkOperator.findUniqueOrThrow({ where: { slug: "vumatel" } });
    const inactiveSlug = "wp2-inactive-package";
    const expiredSlug = "wp2-expired-promotion-package";

    await database.broadbandPackage.createMany({ data: [
      { slug: inactiveSlug, providerId: provider.id, networkId: network.id, name: "Inactive test", connectivityType: "FIBRE", downloadMbps: 10, uploadMbps: 10, monthlyPrice: 10, active: false, description: "Integration test", extras: [] },
      { slug: expiredSlug, providerId: provider.id, networkId: network.id, name: "Expired promotion test", connectivityType: "FIBRE", downloadMbps: 10, uploadMbps: 10, monthlyPrice: 10, promotionalPrice: 5, promotionStart: new Date("2020-01-01"), promotionEnd: new Date("2020-01-02"), description: "Integration test", extras: [] },
    ] });

    try {
      const app = createApp(env);
      const inactive = await app.inject({ method: "GET", url: `/api/catalogue/packages/${inactiveSlug}` });
      const expired = await app.inject({ method: "GET", url: `/api/catalogue/packages/${expiredSlug}` });
      await app.close();

      expect(inactive.statusCode).toBe(404);
      expect(expired.statusCode).toBe(200);
      expect(expired.json()).toMatchObject({ promotionalPrice: null });
      expect(new Date(expired.json().promotionEnd).getTime()).toBeLessThan(Date.now());
    } finally {
      await database.broadbandPackage.deleteMany({ where: { slug: { in: [inactiveSlug, expiredSlug] } } });
    }
  });

  it("resolves seeded coverage and persists only a locality summary", async () => {
    const env = loadEnv();
    const database = getDatabase(env.DATABASE_URL);
    const before = new Date();
    const app = createApp(env);
    const response = await app.inject({ method: "POST", url: "/api/coverage/check", payload: { street: "42 Private Road", suburb: "Fourways", city: "Johannesburg", province: "Gauteng", postalCode: "2055" } });
    await app.close();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "AVAILABLE", source: "DEMO" });
    expect(response.json().packages).toHaveLength(1);
    expect(response.body).not.toContain("42 Private Road");

    const search = await database.coverageSearch.findFirst({ where: { createdAt: { gte: before }, suburb: "Fourways" }, orderBy: { createdAt: "desc" } });
    expect(search).toMatchObject({ resultStatus: "AVAILABLE", networksFound: 1, packagesFound: 1, source: "DEMO" });
    expect(JSON.stringify(search?.address)).not.toContain("42 Private Road");
    await database.coverageSearch.deleteMany({ where: { createdAt: { gte: before }, suburb: "Fourways" } });
  });

  it("enforces registration, ownership, CSRF, reset, and session revocation", async () => {
    const env = loadEnv();
    const database = getDatabase(env.DATABASE_URL);
    const app = createApp(env);
    const marker = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const email = `wp4-${marker}@example.test`;
    const otherEmail = `wp4-other-${marker}@example.test`;
    const originalPassword = "Production-ready password 42";
    const replacementPassword = "Replacement password 84";

    try {
      const registered = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email, password: originalPassword, firstName: "WP4", lastName: "Primary", role: "SUPER_ADMIN" },
      });
      expect(registered.statusCode).toBe(200);
      expect(registered.json().user).toMatchObject({ email, role: "USER", status: "UNVERIFIED" });
      expect(registered.body).not.toContain("passwordHash");
      const primaryCookies = cookieHeader(registered.headers["set-cookie"]);
      const primaryCsrf = cookieValue(registered.headers["set-cookie"], "fc_csrf");

      const verification = await app.inject({ method: "POST", url: "/api/auth/verify-email", payload: { token: registered.json().developmentVerificationToken } });
      expect(verification.statusCode).toBe(200);
      expect(verification.json().user.status).toBe("ACTIVE");

      const wrongLogin = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email, password: "wrong password" } });
      expect(wrongLogin.statusCode).toBe(401);
      expect(wrongLogin.json().error.code).toBe("INVALID_CREDENTIALS");

      const other = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: otherEmail, password: originalPassword, firstName: "WP4", lastName: "Other" },
      });
      expect(other.statusCode).toBe(200);
      const otherId = other.json().user.id as string;

      const crossAccount = await app.inject({ method: "GET", url: `/api/account/users/${otherId}`, headers: { cookie: primaryCookies } });
      expect(crossAccount.statusCode).toBe(403);
      expect(crossAccount.json().error.code).toBe("FORBIDDEN");

      const missingCsrf = await app.inject({ method: "PATCH", url: "/api/me", headers: { cookie: primaryCookies }, payload: { firstName: "Changed" } });
      expect(missingCsrf.statusCode).toBe(403);
      expect(missingCsrf.json().error.code).toBe("CSRF_VALIDATION_FAILED");

      const roleInjection = await app.inject({ method: "PATCH", url: "/api/me", headers: { cookie: primaryCookies, "x-csrf-token": primaryCsrf }, payload: { role: "SUPER_ADMIN" } });
      expect(roleInjection.statusCode).toBe(400);
      expect((await database.user.findUniqueOrThrow({ where: { email } })).role).toBe("USER");

      const forbiddenAdmin = await app.inject({ method: "GET", url: "/api/admin/security-check", headers: { cookie: primaryCookies } });
      expect(forbiddenAdmin.statusCode).toBe(403);
      expect(forbiddenAdmin.json().error.code).toBe("FORBIDDEN");

      const forgot = await app.inject({ method: "POST", url: "/api/auth/forgot-password", payload: { email } });
      expect(forgot.statusCode).toBe(200);
      const resetToken = forgot.json().developmentResetToken as string;
      const reset = await app.inject({ method: "POST", url: "/api/auth/reset-password", payload: { token: resetToken, password: replacementPassword } });
      expect(reset.statusCode).toBe(200);
      const reused = await app.inject({ method: "POST", url: "/api/auth/reset-password", payload: { token: resetToken, password: replacementPassword } });
      expect(reused.statusCode).toBe(400);

      const revokedSession = await app.inject({ method: "GET", url: "/api/me", headers: { cookie: primaryCookies } });
      expect(revokedSession.statusCode).toBe(401);
      const oldPassword = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email, password: originalPassword } });
      expect(oldPassword.statusCode).toBe(401);
      const newPassword = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email, password: replacementPassword } });
      expect(newPassword.statusCode).toBe(200);

      const activeCookies = cookieHeader(newPassword.headers["set-cookie"]);
      await database.user.update({ where: { email }, data: { status: "DISABLED" } });
      const disabledSession = await app.inject({ method: "GET", url: "/api/me", headers: { cookie: activeCookies } });
      expect(disabledSession.statusCode).toBe(403);
      expect(disabledSession.json().error.code).toBe("ACCOUNT_DISABLED");
    } finally {
      await app.close();
      await database.user.deleteMany({ where: { email: { in: [email, otherEmail] } } });
    }
  }, 60_000);

  it("persists the customer enquiry journey and keeps account data isolated", async () => {
    const env = loadEnv();
    const database = getDatabase(env.DATABASE_URL);
    const app = createApp(env);
    const marker = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const customerEmail = `wp5-customer-${marker}@example.test`;
    const otherEmail = `wp5-other-${marker}@example.test`;
    const adminEmail = `wp5-admin-${marker}@example.test`;
    const password = "Production-ready password 42";

    try {
      const customer = await app.inject({ method: "POST", url: "/api/auth/register", payload: { email: customerEmail, password, firstName: "WP5", lastName: "Customer" } });
      const other = await app.inject({ method: "POST", url: "/api/auth/register", payload: { email: otherEmail, password, firstName: "WP5", lastName: "Other" } });
      const admin = await app.inject({ method: "POST", url: "/api/auth/register", payload: { email: adminEmail, password, firstName: "WP5", lastName: "Admin" } });
      expect([customer.statusCode, other.statusCode, admin.statusCode]).toEqual([200, 200, 200]);

      const customerId = customer.json().user.id as string;
      const otherId = other.json().user.id as string;
      const adminId = admin.json().user.id as string;
      await database.user.update({ where: { id: adminId }, data: { role: "ADMIN" } });
      const customerHeaders = mutationHeaders(customer.headers["set-cookie"]);
      const adminHeaders = mutationHeaders(admin.headers["set-cookie"]);
      const customerCookie = cookieHeader(customer.headers["set-cookie"]);
      const adminCookie = cookieHeader(admin.headers["set-cookie"]);
      const broadbandPackage = await database.broadbandPackage.findFirstOrThrow({ where: { active: true }, orderBy: { slug: "asc" } });

      const addressPayload = { street: "15 Test Avenue", suburb: "Fourways", city: "Johannesburg", province: "Gauteng", postalCode: "2055" };
      const address = await app.inject({ method: "POST", url: "/api/me/addresses", headers: customerHeaders, payload: addressPayload });
      expect(address.statusCode).toBe(200);
      const foreignAddress = await database.userAddress.create({ data: { userId: otherId, ...addressPayload, street: "99 Private Lane" } });
      const idorDelete = await app.inject({ method: "DELETE", url: `/api/me/addresses/${foreignAddress.id}`, headers: customerHeaders });
      expect(idorDelete.statusCode).toBe(404);
      expect(await database.userAddress.findUnique({ where: { id: foreignAddress.id } })).not.toBeNull();

      const saved = await app.inject({ method: "POST", url: `/api/me/saved-packages/${broadbandPackage.id}/toggle`, headers: customerHeaders });
      expect(saved.json()).toEqual({ saved: true });
      const comparison = await app.inject({ method: "PUT", url: "/api/me/comparison", headers: customerHeaders, payload: { packageIds: [broadbandPackage.id] } });
      expect(comparison.statusCode).toBe(200);
      expect(comparison.json().comparison.items).toHaveLength(1);
      const preferences = await app.inject({ method: "PUT", url: "/api/me/notification-preferences", headers: customerHeaders, payload: { email: true, sms: true, push: false, marketing: false } });
      expect(preferences.json().preferences).toMatchObject({ email: true, sms: true, push: false, marketing: false });

      const enquiryPayload = { packageId: broadbandPackage.id, address: addressPayload, firstName: "WP5", lastName: "Customer", email: customerEmail, phone: "0821234567", contactMethod: "Email", propertyType: "Residential", dwelling: "House", landlordAck: true, privacy: true, terms: true, providerContact: true, marketing: false };
      const enquiry = await app.inject({ method: "POST", url: "/api/enquiries", headers: { cookie: customerCookie }, payload: enquiryPayload });
      expect(enquiry.statusCode).toBe(200);
      expect(enquiry.json().enquiry).toMatchObject({ status: "Submitted", email: customerEmail });
      const enquiryId = enquiry.json().enquiry.id as string;
      const duplicate = await app.inject({ method: "POST", url: "/api/enquiries", headers: { cookie: customerCookie }, payload: enquiryPayload });
      expect(duplicate.statusCode).toBe(409);
      expect(duplicate.json().error.code).toBe("DUPLICATE_ENQUIRY");

      const ownEnquiries = await app.inject({ method: "GET", url: "/api/me/enquiries", headers: { cookie: customerCookie } });
      expect(ownEnquiries.json().items).toHaveLength(1);
      const adminList = await app.inject({ method: "GET", url: "/api/admin/enquiries", headers: { cookie: adminCookie } });
      expect(adminList.statusCode).toBe(200);
      expect(adminList.json().items.some((item: { id: string }) => item.id === enquiryId)).toBe(true);
      const adminUpdate = await app.inject({ method: "PATCH", url: `/api/admin/enquiries/${enquiryId}`, headers: adminHeaders, payload: { status: "UNDER_REVIEW", note: "Ownership and workflow verified." } });
      expect(adminUpdate.statusCode).toBe(200);
      expect(adminUpdate.json().enquiry.status).toBe("Under review");
      expect(adminUpdate.json().enquiry.statusHistory).toHaveLength(2);

      const persisted = await database.enquiry.findUniqueOrThrow({ where: { id: enquiryId }, include: { history: true } });
      expect(persisted).toMatchObject({ userId: customerId, status: "UNDER_REVIEW", landlordAcknowledged: true });
      expect(persisted.privacyConsentAt).toBeInstanceOf(Date);
      expect(persisted.history).toHaveLength(2);
      expect(await database.auditLog.findFirst({ where: { actorId: adminId, targetId: enquiryId, action: "enquiry.updated" } })).not.toBeNull();
    } finally {
      await app.close();
      await database.user.deleteMany({ where: { email: { in: [customerEmail, otherEmail, adminEmail] } } });
    }
  }, 90_000);
});

function cookieHeader(setCookie: string | string[] | undefined) {
  const values = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  return values.map((value) => value.split(";", 1)[0]).join("; ");
}

function cookieValue(setCookie: string | string[] | undefined, name: string) {
  const match = cookieHeader(setCookie).split("; ").find((value) => value.startsWith(`${name}=`));
  if (!match) throw new Error(`Missing ${name} cookie`);
  return decodeURIComponent(match.slice(name.length + 1));
}

function mutationHeaders(setCookie: string | string[] | undefined) {
  return { cookie: cookieHeader(setCookie), "x-csrf-token": cookieValue(setCookie, "fc_csrf") };
}
