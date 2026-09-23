import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import type { AppEnv } from "../config/env.js";
import { DevelopmentAuthDelivery, UnconfiguredProductionAuthDelivery } from "../auth/delivery.js";
import { createAuthMiddleware } from "../auth/middleware.js";
import { ownsResource } from "../auth/permissions.js";
import { getDatabase } from "../db/client.js";
import { AppError } from "../lib/errors.js";
import { createAuthRepository } from "../repositories/auth.js";
import { AuthService } from "../services/auth.js";
import { createBotProtection } from "../security/botProtection.js";

const email = z.string().trim().email().max(254);
const password = z.string().min(12).max(128);
const token = z.string().min(32).max(256);
const uuid = z.string().uuid();
const registerBody = z.object({ email, password, firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), phone: z.string().trim().min(7).max(30).optional() });
const loginBody = z.object({ email, password: z.string().min(1).max(128) });
const profileBody = z.object({ firstName: z.string().trim().min(1).max(80).optional(), lastName: z.string().trim().min(1).max(80).optional(), phone: z.string().trim().min(7).max(30).optional(), marketingConsent: z.boolean().optional() }).strict();
const roleBody = z.object({ role: z.enum(["USER", "SUPPORT", "SALES", "PROVIDER_MANAGER", "CONTENT_EDITOR", "ANALYST", "ADMIN", "SUPER_ADMIN"]) });
const statusBody = z.object({ status: z.enum(["ACTIVE", "UNVERIFIED", "SUSPENDED", "DISABLED"]) });

export async function registerAuthRoutes(app: FastifyInstance, env: AppEnv) {
  const repository = createAuthRepository(getDatabase(env.DATABASE_URL));
  const delivery = env.NODE_ENV === "production" ? new UnconfiguredProductionAuthDelivery() : new DevelopmentAuthDelivery();
  const service = new AuthService(repository, delivery, env.SESSION_TTL_HOURS, env.NODE_ENV !== "production");
  const auth = createAuthMiddleware(repository, env);
  const verifyBot = createBotProtection(env);
  const rateLimit = (max: number) => ({ config: { rateLimit: { max, timeWindow: "1 minute" } } });
  const publicProtection = (max: number) => ({ ...rateLimit(max), preHandler: verifyBot });

  app.post("/api/auth/register", publicProtection(5), async (request, reply) => {
    const result = await service.register(registerBody.parse(request.body));
    setSessionCookies(reply, env, result.session);
    return { user: result.user, ...(result.developmentVerificationToken ? { developmentVerificationToken: result.developmentVerificationToken } : {}) };
  });
  app.post("/api/auth/login", publicProtection(8), async (request, reply) => {
    const body = loginBody.parse(request.body);
    const result = await service.login(body.email, body.password);
    setSessionCookies(reply, env, result.session);
    return { user: result.user };
  });
  app.post("/api/auth/logout", { preHandler: [auth.authenticate, auth.requireCsrf] }, async (request, reply) => {
    await repository.revokeSession(request.auth!.sessionId);
    clearSessionCookies(reply, env);
    return { success: true };
  });
  app.get("/api/me", { preHandler: auth.authenticate }, async (request) => ({ user: request.auth!.user }));
  app.patch("/api/me", { preHandler: [auth.authenticate, auth.requireCsrf] }, async (request) => ({ user: await repository.updateProfile(request.auth!.user.id, profileBody.parse(request.body)) }));
  app.post("/api/auth/forgot-password", publicProtection(5), async (request) => ({ accepted: true, ...await service.forgotPassword(z.object({ email }).parse(request.body).email) }));
  app.post("/api/auth/reset-password", rateLimit(5), async (request) => { const body = z.object({ token, password }).parse(request.body); await service.resetPassword(body.token, body.password); return { success: true }; });
  app.post("/api/auth/verify-email", rateLimit(10), async (request) => ({ user: await service.verifyEmail(z.object({ token }).parse(request.body).token) }));
  app.post("/api/auth/resend-verification", { preHandler: [auth.authenticate, auth.requireCsrf], ...rateLimit(3) }, async (request) => ({ accepted: true, ...await service.resendVerification(request.auth!.user.id, request.auth!.user.email) }));

  app.get("/api/account/users/:userId", { preHandler: auth.authenticate }, async (request) => {
    const { userId } = z.object({ userId: uuid }).parse(request.params);
    if (!ownsResource(request.auth!.user.id, userId)) throw new AppError(403, "FORBIDDEN", "You may only access your own profile");
    return { user: await repository.findSafeUserById(userId) };
  });
  app.get("/api/account/users/:userId/addresses", { preHandler: auth.authenticate }, async (request) => {
    const { userId } = z.object({ userId: uuid }).parse(request.params);
    if (!ownsResource(request.auth!.user.id, userId)) throw new AppError(403, "FORBIDDEN", "You may only access your own addresses");
    return { items: await repository.listAddresses(userId) };
  });
  app.get("/api/account/users/:userId/addresses/:addressId", { preHandler: auth.authenticate }, async (request) => {
    const { userId, addressId } = z.object({ userId: uuid, addressId: uuid }).parse(request.params);
    if (!ownsResource(request.auth!.user.id, userId)) throw new AppError(403, "FORBIDDEN", "You may only access your own addresses");
    const address = await repository.getAddress(userId, addressId);
    if (!address) throw new AppError(404, "ADDRESS_NOT_FOUND", "Address not found");
    return { address };
  });

  app.get("/api/admin/security-check", { preHandler: [auth.authenticate, auth.requirePermission("audit.read")] }, async () => ({ allowed: true }));
  app.patch("/api/admin/users/:userId/role", { preHandler: [auth.authenticate, auth.requireCsrf, auth.requirePermission("roles.manage")] }, async (request) => {
    const { userId } = z.object({ userId: uuid }).parse(request.params); const { role } = roleBody.parse(request.body);
    const user = await repository.updateRole(userId, role); await repository.writeAudit({ actorId: request.auth!.user.id, action: "user.role.changed", targetType: "User", targetId: userId, requestId: request.id, metadata: { role } }); return { user };
  });
  app.patch("/api/admin/users/:userId/status", { preHandler: [auth.authenticate, auth.requireCsrf, auth.requirePermission("roles.manage")] }, async (request) => {
    const { userId } = z.object({ userId: uuid }).parse(request.params); const { status } = statusBody.parse(request.body);
    const user = await repository.updateStatus(userId, status); if (status === "SUSPENDED" || status === "DISABLED") await repository.revokeUserSessions(userId); await repository.writeAudit({ actorId: request.auth!.user.id, action: `user.status.${status.toLowerCase()}`, targetType: "User", targetId: userId, requestId: request.id, metadata: { status } }); return { user };
  });
}

function setSessionCookies(reply: FastifyReply, env: AppEnv, session: { token: string; csrfToken: string; expiresAt: Date }) {
  const common = { path: "/", secure: env.NODE_ENV === "production", sameSite: "strict" as const, expires: session.expiresAt };
  reply.setCookie(env.SESSION_COOKIE_NAME, session.token, { ...common, httpOnly: true });
  reply.setCookie("fc_csrf", session.csrfToken, { ...common, httpOnly: false });
}
function clearSessionCookies(reply: FastifyReply, env: AppEnv) {
  const options = { path: "/", secure: env.NODE_ENV === "production", sameSite: "strict" as const };
  reply.clearCookie(env.SESSION_COOKIE_NAME, options); reply.clearCookie("fc_csrf", options);
}
