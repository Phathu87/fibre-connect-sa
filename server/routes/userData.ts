import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import type { AppEnv } from "../config/env.js";
import { createAuthMiddleware } from "../auth/middleware.js";
import { hashOpaqueToken } from "../auth/crypto.js";
import { getDatabase } from "../db/client.js";
import { AppError } from "../lib/errors.js";
import { createAuthRepository } from "../repositories/auth.js";
import { createUserDataRepository } from "../repositories/userData.js";

const uuid = z.string().uuid();
const address = z.object({ street: z.string().trim().min(1).max(160), suburb: z.string().trim().min(1).max(100), city: z.string().trim().min(1).max(100), province: z.string().trim().min(1).max(100), postalCode: z.string().trim().regex(/^\d{4}$/).optional() }).strict();
const preference = z.object({ email: z.boolean(), sms: z.boolean(), push: z.boolean(), marketing: z.boolean() }).strict();
const comparison = z.object({ packageIds: z.array(uuid).max(4).refine((ids) => new Set(ids).size === ids.length) }).strict();
const enquiry = z.object({
  packageId: uuid, address,
  firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), email: z.string().trim().email().max(254), phone: z.string().trim().min(7).max(30),
  contactMethod: z.enum(["Email", "Phone", "WhatsApp"]), propertyType: z.enum(["Residential", "Business"]), dwelling: z.string().trim().min(1).max(80), unit: z.string().trim().max(80).optional(), accessNotes: z.string().trim().max(500).optional(), landlordAck: z.boolean(),
  privacy: z.literal(true), terms: z.literal(true), providerContact: z.literal(true), marketing: z.boolean(),
}).strict();
const statuses = ["SUBMITTED", "UNDER_REVIEW", "PROVIDER_CONTACTED", "AWAITING_CUSTOMER", "APPROVED", "INSTALLATION_SCHEDULED", "COMPLETED", "CANCELLED"] as const;
const adminUpdate = z.object({ status: z.enum(statuses).optional(), assignedToId: uuid.nullable().optional(), note: z.string().trim().max(1000).optional() }).strict().refine((value) => Object.keys(value).length > 0);

export async function registerUserDataRoutes(app: FastifyInstance, env: AppEnv) {
  const database = getDatabase(env.DATABASE_URL);
  const authRepository = createAuthRepository(database);
  const repository = createUserDataRepository(database);
  const auth = createAuthMiddleware(authRepository, env);
  const protectedMutation = { preHandler: [auth.authenticate, auth.requireCsrf] };

  app.get("/api/me/addresses", { preHandler: auth.authenticate }, async (request) => ({ items: await repository.listAddresses(request.auth!.user.id) }));
  app.post("/api/me/addresses", protectedMutation, async (request) => ({ address: await repository.createAddress(request.auth!.user.id, address.parse(request.body)) }));
  app.patch("/api/me/addresses/:id/preferred", protectedMutation, async (request) => { const { id } = z.object({ id: uuid }).parse(request.params); const item = await repository.preferAddress(request.auth!.user.id, id); if (!item) throw new AppError(404, "ADDRESS_NOT_FOUND", "Address not found"); return { address: item }; });
  app.delete("/api/me/addresses/:id", protectedMutation, async (request) => { const { id } = z.object({ id: uuid }).parse(request.params); const result = await repository.deleteAddress(request.auth!.user.id, id); if (!result.count) throw new AppError(404, "ADDRESS_NOT_FOUND", "Address not found"); return { success: true }; });

  app.get("/api/me/saved-packages", { preHandler: auth.authenticate }, async (request) => ({ items: (await repository.listSaved(request.auth!.user.id)).map((item) => item.package) }));
  app.post("/api/me/saved-packages/:packageId/toggle", protectedMutation, async (request) => { const { packageId } = z.object({ packageId: uuid }).parse(request.params); if (!await repository.findPackage(packageId)) throw new AppError(404, "PACKAGE_NOT_FOUND", "Package not found"); return { saved: await repository.toggleSaved(request.auth!.user.id, packageId) }; });

  app.get("/api/me/comparison", { preHandler: auth.authenticate }, async (request) => ({ comparison: await repository.getComparison(request.auth!.user.id) }));
  app.put("/api/me/comparison", protectedMutation, async (request) => {
    const result = await repository.setComparison(request.auth!.user.id, comparison.parse(request.body).packageIds);
    if (!result) throw new AppError(404, "PACKAGE_NOT_FOUND", "One or more packages were not found");
    return { comparison: result };
  });
  app.get("/api/me/notification-preferences", { preHandler: auth.authenticate }, async (request) => ({ preferences: await repository.getPreferences(request.auth!.user.id) ?? { email: true, sms: false, push: false, marketing: false } }));
  app.put("/api/me/notification-preferences", protectedMutation, async (request) => ({ preferences: await repository.setPreferences(request.auth!.user.id, preference.parse(request.body)) }));
  app.get("/api/me/enquiries", { preHandler: auth.authenticate }, async (request) => ({ items: serializeEnquiries(await repository.listUserEnquiries(request.auth!.user.id)) }));

  app.post("/api/enquiries", { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } }, async (request) => {
    const body = enquiry.parse(request.body);
    const principal = await optionalPrincipal(request, env, authRepository);
    const pkg = await repository.findPackage(body.packageId);
    if (!pkg) throw new AppError(404, "PACKAGE_NOT_FOUND", "Package not found");
    const normalized = `${body.email.toLowerCase()}|${body.packageId}|${body.address.street.toLowerCase()}|${body.address.postalCode ?? ""}`;
    const deduplicationKey = createHash("sha256").update(normalized).digest("hex");
    const duplicate = await repository.findRecentDuplicate(deduplicationKey, new Date(Date.now() - 10 * 60_000));
    if (duplicate) throw new AppError(409, "DUPLICATE_ENQUIRY", `This enquiry was already submitted as ${duplicate.reference}`);
    const now = new Date();
    const created = await repository.createEnquiry({ reference: `FC-${randomBytes(5).toString("hex").toUpperCase()}`, userId: principal?.user.id ?? null, packageId: body.packageId, address: body.address, firstName: body.firstName, lastName: body.lastName, email: body.email.toLowerCase(), phone: body.phone, contactMethod: body.contactMethod, propertyType: body.propertyType, dwelling: body.dwelling, unit: body.unit || null, accessNotes: body.accessNotes || null, landlordAcknowledged: body.landlordAck, privacyConsentAt: now, termsConsentAt: now, providerContactConsentAt: now, marketingConsentAt: body.marketing ? now : null, deduplicationKey });
    await repository.addInitialHistory(created.id);
    return { enquiry: serializeEnquiry({ ...created, history: [{ status: "SUBMITTED", note: "Enquiry submitted.", createdAt: now }] }) };
  });

  app.get("/api/admin/enquiries", { preHandler: [auth.authenticate, auth.requirePermission("enquiry.read.assigned")] }, async () => ({ items: serializeEnquiries(await repository.listAdminEnquiries()) }));
  app.patch("/api/admin/enquiries/:id", { preHandler: [auth.authenticate, auth.requireCsrf, auth.requirePermission("enquiry.manage")] }, async (request) => {
    const { id } = z.object({ id: uuid }).parse(request.params); const body = adminUpdate.parse(request.body);
    const updated = await repository.updateEnquiry(id, body, request.auth!.user.id); if (!updated) throw new AppError(404, "ENQUIRY_NOT_FOUND", "Enquiry not found");
    await repository.writeAudit({ actorId: request.auth!.user.id, action: "enquiry.updated", targetType: "Enquiry", targetId: id, requestId: request.id, metadata: { status: body.status ?? null, assignedToId: body.assignedToId ?? null, noteAdded: Boolean(body.note) } });
    return { enquiry: serializeEnquiry(updated) };
  });
}

async function optionalPrincipal(request: FastifyRequest, env: AppEnv, repository: ReturnType<typeof createAuthRepository>) {
  const token = request.cookies[env.SESSION_COOKIE_NAME]; if (!token) return null;
  const session = await repository.findSession(hashOpaqueToken(token));
  return session && session.user.status !== "SUSPENDED" && session.user.status !== "DISABLED" ? session : null;
}

function serializeEnquiries(items: any[]) { return items.map(serializeEnquiry); }
function serializeEnquiry(item: any) { return { ...item, packageName: item.package?.name, packageSlug: item.package?.slug, providerName: item.package?.provider?.name, assignedTo: item.assignedTo ? `${item.assignedTo.firstName ?? ""} ${item.assignedTo.lastName ?? ""}`.trim() || item.assignedTo.email : null, status: titleStatus(item.status), statusHistory: (item.history ?? []).map((entry: any) => ({ status: titleStatus(entry.status), note: entry.note, at: entry.createdAt })) }; }
function titleStatus(status: string) { return status.toLowerCase().replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase()); }
