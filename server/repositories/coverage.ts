import type { PrismaClient } from "../../src/generated/prisma/client.js";
import type { CoverageResultType } from "../../src/generated/prisma/enums.js";
import type { CoverageResult, SafeLocation } from "../coverage/types.js";
import { serializePackage } from "./catalogue.js";

export function createCoverageRepository(database: PrismaClient) {
  return {
    async findCoverage(location: SafeLocation) {
      const areas = await database.coverageArea.findMany({
        where: {
          status: "available",
          ...(location.suburb ? { suburb: { equals: location.suburb, mode: "insensitive" as const } } : {}),
          ...(location.city ? { city: { equals: location.city, mode: "insensitive" as const } } : {}),
          ...(location.province ? { province: { equals: location.province, mode: "insensitive" as const } } : {}),
        },
        include: { network: true, availability: { where: { available: true }, include: { package: { include: { provider: true, network: true } } } } },
      });
      const packages = areas.flatMap((area) => area.availability.map((entry) => entry.package)).filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
      const networks = areas.map((area) => area.network).filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
      return { networks, packages: packages.map(serializePackage) };
    },
    async recordSearch(location: SafeLocation, result: CoverageResult) {
      const resultType: CoverageResultType = result.status === "AVAILABLE" || result.status === "PARTIAL" ? "FIBRE" : result.status === "WIRELESS_ONLY" ? "WIRELESS" : "NONE";
      await database.coverageSearch.create({ data: {
        address: { suburb: location.suburb ?? null, city: location.city ?? null, province: location.province ?? null, postalCode: location.postalCode ?? null },
        suburb: location.suburb ?? null, city: location.city ?? null, province: location.province ?? null, postalCode: location.postalCode ?? null,
        latitude: location.latitude ?? null, longitude: location.longitude ?? null, resultType, resultStatus: result.status,
        networksFound: result.networks.length, packagesFound: result.packages.length, source: result.source,
      } });
    },
  };
}
