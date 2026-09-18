import type { PrismaClient } from "../../src/generated/prisma/client.js";
import type { Prisma } from "../../src/generated/prisma/client.js";

export type PackageFilters = {
  connectivityType?: Array<"FIBRE" | "LTE" | "FIVE_G"> | undefined;
  providerId?: string[] | undefined;
  networkId?: string[] | undefined;
  minSpeed?: number | undefined;
  maxPrice?: number | undefined;
  uncapped?: boolean | undefined;
  routerIncluded?: boolean | undefined;
  promotional?: boolean | undefined;
  contractMonths?: number | undefined;
  classification?: "business" | "residential" | undefined;
  search?: string | undefined;
};

export type PackageSort = "recommended" | "lowest-price" | "highest-speed" | "best-value" | "most-popular" | "newest";

function connectivityLabel(value: "FIBRE" | "LTE" | "FIVE_G") {
  return value === "FIVE_G" ? "5G" : value[0] + value.slice(1).toLowerCase();
}

function serializeProvider<T extends { connectivity: Array<"FIBRE" | "LTE" | "FIVE_G">; rating: { toNumber(): number } | null }>(provider: T) {
  return { ...provider, connectivity: provider.connectivity.map(connectivityLabel), rating: provider.rating?.toNumber() ?? null };
}

export function serializePackage<T extends { connectivityType: "FIBRE" | "LTE" | "FIVE_G"; monthlyPrice: { toNumber(): number }; promotionalPrice: { toNumber(): number } | null; promotionStart: Date | null; promotionEnd: Date | null; installationFee: { toNumber(): number }; routerFee: { toNumber(): number }; rating: { toNumber(): number } | null; provider: Parameters<typeof serializeProvider>[0] }>(item: T) {
  const now = Date.now();
  const promotionActive = item.promotionalPrice !== null
    && (!item.promotionStart || item.promotionStart.getTime() <= now)
    && (!item.promotionEnd || item.promotionEnd.getTime() >= now);
  return {
    ...item,
    connectivityType: connectivityLabel(item.connectivityType),
    monthlyPrice: item.monthlyPrice.toNumber(),
    promotionalPrice: promotionActive ? item.promotionalPrice?.toNumber() ?? null : null,
    installationFee: item.installationFee.toNumber(),
    routerFee: item.routerFee.toNumber(),
    rating: item.rating?.toNumber() ?? null,
    provider: serializeProvider(item.provider),
  };
}

const packageInclude = { provider: true, network: true } satisfies Prisma.BroadbandPackageInclude;

function packageWhere(filters: PackageFilters): Prisma.BroadbandPackageWhereInput {
  const where: Prisma.BroadbandPackageWhereInput = { active: true };
  if (filters.connectivityType?.length) where.connectivityType = { in: filters.connectivityType };
  if (filters.providerId?.length) where.providerId = { in: filters.providerId };
  if (filters.networkId?.length) where.networkId = { in: filters.networkId };
  if (filters.minSpeed !== undefined) where.downloadMbps = { gte: filters.minSpeed };
  if (filters.maxPrice !== undefined) where.OR = [{ promotionalPrice: { lte: filters.maxPrice } }, { promotionalPrice: null, monthlyPrice: { lte: filters.maxPrice } }];
  if (filters.uncapped !== undefined) where.uncapped = filters.uncapped;
  if (filters.routerIncluded !== undefined) where.routerIncluded = filters.routerIncluded;
  if (filters.promotional) where.promotionalPrice = { not: null };
  if (filters.contractMonths !== undefined) where.contractMonths = filters.contractMonths;
  if (filters.classification === "business") where.business = true;
  if (filters.classification === "residential") where.residential = true;
  if (filters.search) {
    const search = { contains: filters.search, mode: "insensitive" as const };
    where.AND = [{ OR: [{ name: search }, { provider: { name: search } }] }];
  }
  return where;
}

function packageOrder(sort: PackageSort): Prisma.BroadbandPackageOrderByWithRelationInput[] {
  const orders: Record<PackageSort, Prisma.BroadbandPackageOrderByWithRelationInput[]> = {
    recommended: [{ recommended: "desc" }, { monthlyPrice: "asc" }],
    "lowest-price": [{ promotionalPrice: { sort: "asc", nulls: "last" } }, { monthlyPrice: "asc" }],
    "highest-speed": [{ downloadMbps: "desc" }],
    "best-value": [{ bestValue: "desc" }, { monthlyPrice: "asc" }],
    "most-popular": [{ mostPopular: "desc" }, { reviewCount: "desc" }],
    newest: [{ createdAt: "desc" }],
  };
  return orders[sort];
}

export function createCatalogueRepository(database: PrismaClient) {
  return {
    async listPackages(filters: PackageFilters, sort: PackageSort, page: number, pageSize: number) {
      const where = packageWhere(filters);
      const [items, total] = await Promise.all([
        database.broadbandPackage.findMany({ where, include: packageInclude, orderBy: packageOrder(sort), skip: (page - 1) * pageSize, take: pageSize }),
        database.broadbandPackage.count({ where }),
      ]);
      return { items: items.map(serializePackage), total, page, pageSize, hasMore: page * pageSize < total };
    },
    async listAllPackages() {
      return (await database.broadbandPackage.findMany({ where: { active: true }, include: packageInclude, orderBy: { name: "asc" } })).map(serializePackage);
    },
    async getPackage(slug: string) {
      const item = await database.broadbandPackage.findFirst({ where: { slug, active: true }, include: packageInclude });
      return item ? serializePackage(item) : null;
    },
    async relatedPackages(slug: string) {
      const source = await database.broadbandPackage.findFirst({ where: { slug, active: true } });
      if (!source) return [];
      return (await database.broadbandPackage.findMany({ where: { active: true, id: { not: source.id }, connectivityType: source.connectivityType }, include: packageInclude, take: 4, orderBy: [{ recommended: "desc" }, { monthlyPrice: "asc" }] })).map(serializePackage);
    },
    async listProviders() {
      const items = await database.provider.findMany({ where: { active: true }, include: { _count: { select: { packages: { where: { active: true } } } } }, orderBy: { name: "asc" } });
      const networks = await database.networkOperator.findMany({ where: { active: true }, orderBy: { name: "asc" } });
      return items.map((provider) => ({ ...serializeProvider(provider), packageCount: provider._count.packages, networks: networks.filter((network) => network.supportedProviders.includes(provider.slug)), _count: undefined }));
    },
    async getProvider(slug: string) {
      return (await this.listProviders()).find((provider) => provider.slug === slug) ?? null;
    },
    async packagesForProvider(slug: string) {
      return (await database.broadbandPackage.findMany({ where: { active: true, provider: { slug, active: true } }, include: packageInclude, orderBy: { monthlyPrice: "asc" } })).map(serializePackage);
    },
    async listNetworks() {
      const [networks, providers] = await Promise.all([
        database.networkOperator.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
        database.provider.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
      ]);
      return networks.map((network) => ({ ...network, coverageAreas: network.coverageLocations, providers: providers.filter((provider) => network.supportedProviders.includes(provider.slug)).map(serializeProvider) }));
    },
    async getNetwork(slug: string) {
      return (await this.listNetworks()).find((network) => network.slug === slug) ?? null;
    },
    async packagesForNetwork(slug: string) {
      return (await database.broadbandPackage.findMany({ where: { active: true, network: { slug, active: true } }, include: packageInclude, orderBy: { monthlyPrice: "asc" } })).map(serializePackage);
    },
  };
}
