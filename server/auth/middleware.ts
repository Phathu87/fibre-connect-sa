import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "../../src/generated/prisma/enums.js";
import type { AppEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { hasPermission, type Permission } from "./permissions.js";
import { hashOpaqueToken } from "./crypto.js";
import type { createAuthRepository } from "../repositories/auth.js";

export type AuthPrincipal = { sessionId: string; csrfTokenHash: string; user: { id: string; email: string; role: UserRole; status: string; firstName: string | null; lastName: string | null; phone: string | null; emailVerifiedAt: Date | null; marketingConsent: boolean; lastLoginAt: Date | null; createdAt: Date; updatedAt: Date } };

declare module "fastify" { interface FastifyRequest { auth?: AuthPrincipal } }

export function createAuthMiddleware(repository: ReturnType<typeof createAuthRepository>, env: AppEnv) {
  const authenticate = async (request: FastifyRequest, _reply: FastifyReply) => {
    const rawToken = request.cookies[env.SESSION_COOKIE_NAME];
    if (!rawToken) throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required");
    const session = await repository.findSession(hashOpaqueToken(rawToken));
    if (!session) throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required");
    if (session.user.status === "SUSPENDED" || session.user.status === "DISABLED") throw new AppError(403, "ACCOUNT_DISABLED", "This account is not available");
    request.auth = { sessionId: session.id, csrfTokenHash: session.csrfTokenHash, user: session.user };
  };
  const requireCsrf = async (request: FastifyRequest) => {
    const token = request.headers["x-csrf-token"];
    if (!request.auth || typeof token !== "string" || hashOpaqueToken(token) !== request.auth.csrfTokenHash) throw new AppError(403, "CSRF_VALIDATION_FAILED", "Request security validation failed");
  };
  const requirePermission = (permission: Permission) => async (request: FastifyRequest) => {
    if (!request.auth) throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required");
    if (!hasPermission(request.auth.user.role, permission)) throw new AppError(403, "FORBIDDEN", "You do not have permission to perform this action");
  };
  return { authenticate, requireCsrf, requirePermission };
}
