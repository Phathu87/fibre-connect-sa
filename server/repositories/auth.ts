import type { Prisma, PrismaClient } from "../../src/generated/prisma/client.js";
import type { AccountStatus, AuthTokenType, UserRole } from "../../src/generated/prisma/enums.js";

const safeUserSelect = { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, status: true, emailVerifiedAt: true, marketingConsent: true, lastLoginAt: true, createdAt: true, updatedAt: true } as const;
export type SafeUser = Awaited<ReturnType<ReturnType<typeof createAuthRepository>["findSafeUserById"]>>;

export function createAuthRepository(database: PrismaClient) {
  return {
    findCredentialsByEmail(email: string) { return database.user.findUnique({ where: { email } }); },
    findSafeUserById(id: string) { return database.user.findUnique({ where: { id }, select: safeUserSelect }); },
    async createUser(data: { email: string; passwordHash: string; firstName: string; lastName: string; phone?: string | undefined }) {
      return database.user.create({ data: { email: data.email, passwordHash: data.passwordHash, firstName: data.firstName, lastName: data.lastName, phone: data.phone ?? null, role: "USER", status: "UNVERIFIED" }, select: safeUserSelect });
    },
    updateLastLogin(id: string) { return database.user.update({ where: { id }, data: { lastLoginAt: new Date() }, select: safeUserSelect }); },
    updateProfile(id: string, data: { firstName?: string | undefined; lastName?: string | undefined; phone?: string | undefined; marketingConsent?: boolean | undefined }) {
      const update: Prisma.UserUpdateInput = {};
      if (data.firstName !== undefined) update.firstName = data.firstName;
      if (data.lastName !== undefined) update.lastName = data.lastName;
      if (data.phone !== undefined) update.phone = data.phone;
      if (data.marketingConsent !== undefined) update.marketingConsent = data.marketingConsent;
      return database.user.update({ where: { id }, data: update, select: safeUserSelect });
    },
    updateRole(id: string, role: UserRole) { return database.user.update({ where: { id }, data: { role }, select: safeUserSelect }); },
    updateStatus(id: string, status: AccountStatus) { return database.user.update({ where: { id }, data: { status }, select: safeUserSelect }); },
    createSession(data: { userId: string; tokenHash: string; csrfTokenHash: string; expiresAt: Date }) { return database.authSession.create({ data }); },
    findSession(tokenHash: string) { return database.authSession.findFirst({ where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } }, include: { user: { select: safeUserSelect } } }); },
    revokeSession(id: string) { return database.authSession.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } }); },
    revokeUserSessions(userId: string) { return database.authSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }); },
    createAuthToken(data: { userId: string; type: AuthTokenType; tokenHash: string; expiresAt: Date }) { return database.authToken.create({ data }); },
    consumeAuthToken(tokenHash: string, type: AuthTokenType) { return database.authToken.findFirst({ where: { tokenHash, type, usedAt: null, expiresAt: { gt: new Date() } } }); },
    async verifyEmail(tokenId: string, userId: string) { return database.$transaction([database.authToken.update({ where: { id: tokenId }, data: { usedAt: new Date() } }), database.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date(), status: "ACTIVE" }, select: safeUserSelect })]); },
    async resetPassword(tokenId: string, userId: string, passwordHash: string) { return database.$transaction([database.authToken.update({ where: { id: tokenId }, data: { usedAt: new Date() } }), database.user.update({ where: { id: userId }, data: { passwordHash } }), database.authSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })]); },
    listAddresses(userId: string) { return database.userAddress.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }); },
    getAddress(userId: string, id: string) { return database.userAddress.findFirst({ where: { id, userId } }); },
    writeAudit(data: { actorId: string; action: string; targetType: string; targetId?: string; requestId?: string; metadata?: Prisma.InputJsonValue }) { return database.auditLog.create({ data: { ...data, targetId: data.targetId ?? null, requestId: data.requestId ?? null, metadata: data.metadata ?? {} } }); },
  };
}
