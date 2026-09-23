import type { EnquiryStatus, Prisma, PrismaClient } from "../../src/generated/prisma/client.js";

const packageInclude = { provider: { select: { id: true, slug: true, name: true, logoText: true, color: true } }, network: { select: { id: true, slug: true, name: true, logoText: true, color: true } } } as const;

export function createUserDataRepository(database: PrismaClient) {
  return {
    listAddresses(userId: string) { return database.userAddress.findMany({ where: { userId }, orderBy: [{ preferred: "desc" }, { createdAt: "desc" }] }); },
    createAddress(userId: string, data: { street: string; suburb: string; city: string; province: string; postalCode?: string | undefined }) { return database.userAddress.create({ data: { userId, ...data, postalCode: data.postalCode || null } }); },
    async preferAddress(userId: string, id: string) {
      return database.$transaction(async (tx) => {
        const owned = await tx.userAddress.findFirst({ where: { id, userId } });
        if (!owned) return null;
        await tx.userAddress.updateMany({ where: { userId }, data: { preferred: false } });
        return tx.userAddress.update({ where: { id }, data: { preferred: true } });
      });
    },
    deleteAddress(userId: string, id: string) { return database.userAddress.deleteMany({ where: { id, userId } }); },

    listSaved(userId: string) { return database.savedPackage.findMany({ where: { userId }, include: { package: { include: packageInclude } }, orderBy: { createdAt: "desc" } }); },
    async toggleSaved(userId: string, packageId: string) {
      const existing = await database.savedPackage.findUnique({ where: { userId_packageId: { userId, packageId } } });
      if (existing) { await database.savedPackage.delete({ where: { id: existing.id } }); return false; }
      await database.savedPackage.create({ data: { userId, packageId } }); return true;
    },

    getComparison(userId: string) { return database.comparison.findFirst({ where: { userId }, include: { items: { include: { package: { include: packageInclude } }, orderBy: { position: "asc" } } }, orderBy: { updatedAt: "desc" } }); },
    async setComparison(userId: string, packageIds: string[]) {
      return database.$transaction(async (tx) => {
        const validPackages = await tx.broadbandPackage.count({ where: { id: { in: packageIds }, active: true } });
        if (validPackages !== packageIds.length) return null;
        const current = await tx.comparison.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } });
        const comparison = current ?? await tx.comparison.create({ data: { userId, name: "Current comparison" } });
        await tx.comparisonItem.deleteMany({ where: { comparisonId: comparison.id } });
        if (packageIds.length) await tx.comparisonItem.createMany({ data: packageIds.map((packageId, position) => ({ comparisonId: comparison.id, packageId, position })) });
        return tx.comparison.findUniqueOrThrow({ where: { id: comparison.id }, include: { items: { include: { package: { include: packageInclude } }, orderBy: { position: "asc" } } } });
      });
    },

    getPreferences(userId: string) { return database.notificationPreference.findUnique({ where: { userId } }); },
    setPreferences(userId: string, data: { email: boolean; sms: boolean; push: boolean; marketing: boolean }) { return database.notificationPreference.upsert({ where: { userId }, create: { userId, ...data }, update: data }); },

    findPackage(id: string) { return database.broadbandPackage.findFirst({ where: { id, active: true }, select: { id: true, name: true, slug: true, provider: { select: { name: true } } } }); },
    findRecentDuplicate(deduplicationKey: string, since: Date) { return database.enquiry.findFirst({ where: { deduplicationKey, createdAt: { gte: since } }, orderBy: { createdAt: "desc" } }); },
    createEnquiry(data: Prisma.EnquiryUncheckedCreateInput) {
      return database.enquiry.create({ data, include: { package: { select: { name: true, slug: true, provider: { select: { name: true } } } }, history: { orderBy: { createdAt: "asc" } } } });
    },
    addInitialHistory(enquiryId: string) { return database.enquiryStatusHistory.create({ data: { enquiryId, status: "SUBMITTED", note: "Enquiry submitted." } }); },
    listUserEnquiries(userId: string) { return database.enquiry.findMany({ where: { userId }, include: { package: { select: { name: true, slug: true, provider: { select: { name: true } } } }, history: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } }); },
    listAdminEnquiries() { return database.enquiry.findMany({ include: { package: { select: { name: true, slug: true, provider: { select: { name: true } } } }, assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } }, history: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" }, take: 200 }); },
    findEnquiry(id: string) { return database.enquiry.findUnique({ where: { id } }); },
    async updateEnquiry(id: string, data: { status?: EnquiryStatus | undefined; assignedToId?: string | null | undefined; note?: string | undefined }, actorId: string) {
      return database.$transaction(async (tx) => {
        const current = await tx.enquiry.findUnique({ where: { id } });
        if (!current) return null;
        const update: Prisma.EnquiryUpdateInput = {};
        if (data.status !== undefined) update.status = data.status;
        if (data.assignedToId !== undefined) update.assignedTo = data.assignedToId ? { connect: { id: data.assignedToId } } : { disconnect: true };
        const enquiry = await tx.enquiry.update({ where: { id }, data: update, include: { package: { select: { name: true, slug: true, provider: { select: { name: true } } } }, assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } }, history: { orderBy: { createdAt: "asc" } } } });
        if ((data.status && data.status !== current.status) || data.note) await tx.enquiryStatusHistory.create({ data: { enquiryId: id, status: data.status ?? current.status, note: data.note || null, createdById: actorId } });
        return tx.enquiry.findUniqueOrThrow({ where: { id }, include: { package: { select: { name: true, slug: true, provider: { select: { name: true } } } }, assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } }, history: { orderBy: { createdAt: "asc" } } } });
      });
    },
    writeAudit(data: Prisma.AuditLogUncheckedCreateInput) { return database.auditLog.create({ data }); },
  };
}
