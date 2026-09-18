import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to seed the database");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const providers = [
  { slug: "afrihost", name: "Afrihost", logoText: "afrihost", color: "#e87722", description: "Demo ISP record for development and integration testing.", connectivity: ["FIBRE" as const, "LTE" as const, "FIVE_G" as const] },
  { slug: "cool-ideas", name: "Cool Ideas", logoText: "CI", color: "#0ea5e9", description: "Demo ISP record for development and integration testing.", connectivity: ["FIBRE" as const] },
  { slug: "vox", name: "Vox", logoText: "VOX", color: "#7c3aed", description: "Demo ISP record for development and integration testing.", connectivity: ["FIBRE" as const, "LTE" as const] },
];

const networks = [
  { slug: "vumatel", name: "Vumatel", logoText: "Vuma", color: "#7c3aed", infrastructure: "FTTH GPON", description: "Demo fibre network record for development and integration testing.", supportedProviders: ["afrihost", "cool-ideas"], coverageLocations: ["Gauteng", "Western Cape"] },
  { slug: "openserve", name: "Openserve", logoText: "OS", color: "#dc2626", infrastructure: "FTTH GPON", description: "Demo fibre network record for development and integration testing.", supportedProviders: ["afrihost", "vox"], coverageLocations: ["Gauteng", "Western Cape", "KwaZulu-Natal"] },
  { slug: "frogfoot", name: "Frogfoot", logoText: "FF", color: "#16a34a", infrastructure: "FTTH GPON", description: "Demo fibre network record for development and integration testing.", supportedProviders: ["afrihost", "cool-ideas"], coverageLocations: ["Gauteng", "Western Cape", "Eastern Cape"] },
  { slug: "mtn-fixed-wireless", name: "MTN Fixed Wireless", logoText: "MTN", color: "#ffcc00", infrastructure: "5G / LTE FWA", description: "Demo wireless network record for development and integration testing.", supportedProviders: ["afrihost"], coverageLocations: ["Limpopo"] },
];

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.appSetting.upsert({
      where: { key: "catalogue_mode" },
      update: { value: { mode: "demo", liveProviderData: false } },
      create: { key: "catalogue_mode", value: { mode: "demo", liveProviderData: false } },
    });

    for (const provider of providers) {
      await tx.provider.upsert({ where: { slug: provider.slug }, update: provider, create: provider });
    }
    for (const network of networks) {
      await tx.networkOperator.upsert({ where: { slug: network.slug }, update: network, create: network });
    }

    const afrihost = await tx.provider.findUniqueOrThrow({ where: { slug: "afrihost" } });
    const coolIdeas = await tx.provider.findUniqueOrThrow({ where: { slug: "cool-ideas" } });
    const vox = await tx.provider.findUniqueOrThrow({ where: { slug: "vox" } });
    const vumatel = await tx.networkOperator.findUniqueOrThrow({ where: { slug: "vumatel" } });
    const openserve = await tx.networkOperator.findUniqueOrThrow({ where: { slug: "openserve" } });
    const frogfoot = await tx.networkOperator.findUniqueOrThrow({ where: { slug: "frogfoot" } });
    const mtnWireless = await tx.networkOperator.findUniqueOrThrow({ where: { slug: "mtn-fixed-wireless" } });

    const packages = [
      { slug: "demo-afrihost-50-50", providerId: afrihost.id, networkId: vumatel.id, name: "Demo Afrihost Fibre 50/50", downloadMbps: 50, uploadMbps: 50, monthlyPrice: 699, routerIncluded: true, featured: true, recommended: true, mostPopular: true, description: "DEMO / DEVELOPMENT DATA - not a live commercial offer.", extras: ["Demo router"] },
      { slug: "demo-cool-ideas-100-100", providerId: coolIdeas.id, networkId: frogfoot.id, name: "Demo Cool Ideas Fibre 100/100", downloadMbps: 100, uploadMbps: 100, monthlyPrice: 849, routerIncluded: true, featured: true, bestValue: true, description: "DEMO / DEVELOPMENT DATA - not a live commercial offer.", extras: ["Demo installation"] },
      { slug: "demo-vox-200-100", providerId: vox.id, networkId: openserve.id, name: "Demo Vox Fibre 200/100", downloadMbps: 200, uploadMbps: 100, monthlyPrice: 1099, routerIncluded: true, featured: true, description: "DEMO / DEVELOPMENT DATA - not a live commercial offer.", extras: ["Demo support"] },
      { slug: "demo-afrihost-5g-100", providerId: afrihost.id, networkId: mtnWireless.id, name: "Demo Afrihost 5G 100/30", connectivityType: "FIVE_G" as const, downloadMbps: 100, uploadMbps: 30, monthlyPrice: 799, routerIncluded: true, featured: false, description: "DEMO / DEVELOPMENT DATA - not a live commercial offer.", extras: ["Demo 5G router"] },
      { slug: "demo-afrihost-lte-50", providerId: afrihost.id, networkId: mtnWireless.id, name: "Demo Afrihost LTE 50/10", connectivityType: "LTE" as const, downloadMbps: 50, uploadMbps: 10, monthlyPrice: 499, routerIncluded: true, featured: false, description: "DEMO / DEVELOPMENT DATA - not a live commercial offer.", extras: ["Demo LTE router"] },
    ];

    for (const broadbandPackage of packages) {
      await tx.broadbandPackage.upsert({
        where: { slug: broadbandPackage.slug },
        update: broadbandPackage,
        create: { ...broadbandPackage, connectivityType: broadbandPackage.connectivityType ?? "FIBRE" },
      });
    }

    const areas = [
      { networkId: vumatel.id, province: "Gauteng", city: "Johannesburg", suburb: "Fourways", postalCode: "2055", source: "DEMO", lastVerifiedAt: new Date("2026-09-17T00:00:00Z") },
      { networkId: openserve.id, province: "Western Cape", city: "Cape Town", suburb: "Claremont", postalCode: "7708", source: "DEMO", lastVerifiedAt: new Date("2026-09-17T00:00:00Z") },
      { networkId: mtnWireless.id, province: "Limpopo", city: "Polokwane", suburb: "Polokwane Central", postalCode: "0699", source: "DEMO", lastVerifiedAt: new Date("2026-09-17T00:00:00Z") },
    ];
    for (const area of areas) {
      await tx.coverageArea.upsert({
        where: { networkId_province_city_suburb: { networkId: area.networkId, province: area.province, city: area.city, suburb: area.suburb } },
        update: area,
        create: area,
      });
    }

    const allAreas = await tx.coverageArea.findMany({ where: { source: "DEMO" } });
    const allPackages = await tx.broadbandPackage.findMany({ where: { slug: { startsWith: "demo-" } } });
    for (const area of allAreas) {
      for (const broadbandPackage of allPackages.filter((item) => item.networkId === area.networkId)) {
        await tx.packageAvailability.upsert({
          where: { packageId_coverageAreaId: { packageId: broadbandPackage.id, coverageAreaId: area.id } },
          update: { available: true },
          create: { packageId: broadbandPackage.id, coverageAreaId: area.id, available: true },
        });
      }
    }
  }, { timeout: 30_000 });
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
