import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AppEnv } from "../config/env.js";
import { DemoGeocodingProvider } from "../coverage/geocoding.js";
import { DemoCoverageProvider } from "../coverage/provider.js";
import { getDatabase } from "../db/client.js";
import { createCoverageRepository } from "../repositories/coverage.js";
import { CoverageService } from "../services/coverage.js";

const optionalText = (max: number) => z.string().trim().max(max).optional();
const coverageInput = z.object({
  street: optionalText(160), suburb: optionalText(100), city: optionalText(100), province: optionalText(100),
  postalCode: z.string().trim().refine((value) => value === "" || /^\d{4}$/.test(value), "Postal code must contain four digits").transform((value) => value || undefined).optional(),
  latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(),
}).superRefine((value, context) => {
  if (!(value.suburb || value.city || value.province || value.postalCode) && !(value.latitude !== undefined && value.longitude !== undefined)) context.addIssue({ code: z.ZodIssueCode.custom, message: "A locality or coordinates are required" });
  if ((value.latitude === undefined) !== (value.longitude === undefined)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Latitude and longitude must be supplied together" });
});

export async function registerCoverageRoutes(app: FastifyInstance, env: AppEnv) {
  const repository = createCoverageRepository(getDatabase(env.DATABASE_URL));
  const service = new CoverageService(new DemoGeocodingProvider(), new DemoCoverageProvider(repository.findCoverage), repository.recordSearch);
  app.post("/api/coverage/check", async (request) => service.check(coverageInput.parse(request.body)));
}
