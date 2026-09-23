import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import type { AppEnv } from "../config/env.js";
import { verifyPassword } from "../auth/crypto.js";
import { createAuthMiddleware } from "../auth/middleware.js";
import { getDatabase } from "../db/client.js";
import { AppError } from "../lib/errors.js";
import { createAuthRepository } from "../repositories/auth.js";
import { createPrivacyRepository } from "../repositories/privacy.js";

export async function registerPrivacyRoutes(app: FastifyInstance, env: AppEnv) {
  const database = getDatabase(env.DATABASE_URL);
  const authRepository = createAuthRepository(database);
  const repository = createPrivacyRepository(database);
  const auth = createAuthMiddleware(authRepository, env);

  app.get("/api/me/data-export", { preHandler: auth.authenticate }, async (request, reply) => {
    const data = await repository.exportUser(request.auth!.user.id);
    reply.header("content-disposition", `attachment; filename=FibreConnect-data-${new Date().toISOString().slice(0, 10)}.json`);
    return { exportedAt: new Date().toISOString(), data };
  });

  app.delete("/api/me/account", { preHandler: [auth.authenticate, auth.requireCsrf], config: { rateLimit: { max: 3, timeWindow: "1 hour" } } }, async (request, reply) => {
    const { password } = z.object({ password: z.string().min(1).max(128) }).strict().parse(request.body);
    const credentials = await authRepository.findCredentialsByEmail(request.auth!.user.email);
    const valid = credentials?.passwordHash ? await verifyPassword(credentials.passwordHash, password).catch(() => false) : false;
    if (!valid) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid password");
    await repository.deleteUser(request.auth!.user.id, request.id);
    clearCookies(reply, env);
    return { success: true };
  });

  app.get("/api/admin/audit-logs", { preHandler: [auth.authenticate, auth.requirePermission("audit.read")] }, async (request) => {
    const query = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50), cursor: z.string().uuid().optional() }).parse(request.query);
    const rows = await repository.listAudit(query.limit, query.cursor);
    const hasMore = rows.length > query.limit;
    const items = rows.slice(0, query.limit);
    return { items, nextCursor: hasMore ? items.at(-1)?.id ?? null : null };
  });
}

function clearCookies(reply: FastifyReply, env: AppEnv) {
  const options = { path: "/", secure: env.NODE_ENV === "production", sameSite: "strict" as const };
  reply.clearCookie(env.SESSION_COOKIE_NAME, options);
  reply.clearCookie("fc_csrf", options);
}
