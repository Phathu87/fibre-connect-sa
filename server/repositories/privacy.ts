import type { PrismaClient } from "../../src/generated/prisma/client.js";

export function createPrivacyRepository(database: PrismaClient) {
  return {
    exportUser(userId: string) {
      return database.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, firstName: true, lastName: true, phone: true, status: true, emailVerifiedAt: true, marketingConsent: true, createdAt: true, updatedAt: true,
          addresses: true,
          savedPackages: { select: { createdAt: true, package: { select: { id: true, slug: true, name: true } } } },
          comparisons: { select: { id: true, name: true, createdAt: true, updatedAt: true, items: { select: { position: true, package: { select: { id: true, slug: true, name: true } } } } } },
          coverageSearches: { select: { suburb: true, city: true, province: true, postalCode: true, resultStatus: true, source: true, createdAt: true } },
          enquiries: { select: { reference: true, address: true, firstName: true, lastName: true, email: true, phone: true, contactMethod: true, propertyType: true, dwelling: true, unit: true, accessNotes: true, status: true, privacyConsentAt: true, termsConsentAt: true, providerContactConsentAt: true, marketingConsentAt: true, createdAt: true, updatedAt: true, package: { select: { slug: true, name: true } }, history: { select: { status: true, note: true, createdAt: true }, orderBy: { createdAt: "asc" } } } },
          notificationPrefs: { select: { email: true, sms: true, push: true, marketing: true, updatedAt: true } },
        },
      });
    },
    async deleteUser(userId: string, requestId: string) {
      return database.$transaction(async (tx) => {
        await tx.auditLog.create({ data: { actorId: userId, action: "privacy.account.deleted", targetType: "User", targetId: userId, requestId, metadata: { enquiriesAnonymized: true } } });
        await tx.enquiry.updateMany({ where: { userId }, data: { firstName: "Deleted", lastName: "User", email: `deleted-${userId}@invalid.local`, phone: "REDACTED", address: {}, unit: null, accessNotes: null, marketingConsentAt: null } });
        await tx.user.delete({ where: { id: userId } });
      });
    },
    listAudit(limit: number, cursor?: string) {
      return database.auditLog.findMany({
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { id: true, action: true, targetType: true, targetId: true, requestId: true, metadata: true, createdAt: true, actor: { select: { id: true, email: true, firstName: true, lastName: true } } },
      });
    },
  };
}
