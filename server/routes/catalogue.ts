import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AppEnv } from "../config/env.js";
import { getDatabase } from "../db/client.js";
import { AppError } from "../lib/errors.js";
import { createCatalogueRepository, type PackageFilters, type PackageSort } from "../repositories/catalogue.js";

const listQuery = z.object({
  connectivityType: z.string().optional(),
  providerId: z.string().optional(),
  networkId: z.string().optional(),
  minSpeed: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  uncapped: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  routerIncluded: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  promotional: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  contractMonths: z.coerce.number().int().nonnegative().optional(),
  classification: z.enum(["business", "residential"]).optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["recommended", "lowest-price", "highest-speed", "best-value", "most-popular", "newest"]).default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  all: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
});

const slugParams = z.object({ slug: z.string().trim().min(1).max(120) });

function csv(value: string | undefined) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean);
}

function connectivity(value: string | undefined): PackageFilters["connectivityType"] {
  const map: Record<string, "FIBRE" | "LTE" | "FIVE_G"> = { Fibre: "FIBRE", LTE: "LTE", "5G": "FIVE_G" };
  return csv(value)?.map((item) => map[item]).filter((item): item is "FIBRE" | "LTE" | "FIVE_G" => Boolean(item));
}

export async function registerCatalogueRoutes(app: FastifyInstance, env: AppEnv) {
  const repository = createCatalogueRepository(getDatabase(env.DATABASE_URL));

  app.get("/api/catalogue/packages", async (request) => {
    const query = listQuery.parse(request.query);
    if (query.all) return repository.listAllPackages();
    const filters: PackageFilters = {
      connectivityType: connectivity(query.connectivityType),
      providerId: csv(query.providerId),
      networkId: csv(query.networkId),
      minSpeed: query.minSpeed,
      maxPrice: query.maxPrice,
      uncapped: query.uncapped,
      routerIncluded: query.routerIncluded,
      promotional: query.promotional,
      contractMonths: query.contractMonths,
      classification: query.classification,
      search: query.search,
    };
    return repository.listPackages(filters, query.sort as PackageSort, query.page, query.pageSize);
  });

  app.get("/api/catalogue/packages/:slug", async (request) => {
    const { slug } = slugParams.parse(request.params);
    const item = await repository.getPackage(slug);
    if (!item) throw new AppError(404, "package_not_found", "Package not found");
    return item;
  });
  app.get("/api/catalogue/packages/:slug/related", async (request) => repository.relatedPackages(slugParams.parse(request.params).slug));

  app.get("/api/catalogue/providers", async () => repository.listProviders());
  app.get("/api/catalogue/providers/:slug", async (request) => {
    const { slug } = slugParams.parse(request.params);
    const item = await repository.getProvider(slug);
    if (!item) throw new AppError(404, "provider_not_found", "Provider not found");
    return item;
  });
  app.get("/api/catalogue/providers/:slug/packages", async (request) => repository.packagesForProvider(slugParams.parse(request.params).slug));

  app.get("/api/catalogue/networks", async () => repository.listNetworks());
  app.get("/api/catalogue/networks/:slug", async (request) => {
    const { slug } = slugParams.parse(request.params);
    const item = await repository.getNetwork(slug);
    if (!item) throw new AppError(404, "network_not_found", "Network not found");
    return item;
  });
  app.get("/api/catalogue/networks/:slug/packages", async (request) => repository.packagesForNetwork(slugParams.parse(request.params).slug));
}
