import { randomUUID } from "node:crypto";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { ZodError } from "zod";
import type { AppEnv } from "./config/env.js";
import { corsOrigins } from "./config/env.js";
import { getDatabase } from "./db/client.js";
import { AppError, errorEnvelope } from "./lib/errors.js";
import { registerCatalogueRoutes } from "./routes/catalogue.js";
import { registerCoverageRoutes } from "./routes/coverage.js";
import { registerAuthRoutes } from "./routes/auth.js";

export function createApp(env: AppEnv) {
  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
    genReqId: () => randomUUID(),
    trustProxy: env.TRUST_PROXY,
    requestIdHeader: "x-request-id",
  });

  app.register(helmet, { global: true });
  app.register(cookie);
  app.register(rateLimit, { global: false, errorResponseBuilder: (request, context) => errorEnvelope("RATE_LIMITED", `Too many requests. Try again in ${context.after}.`, request.id) });
  app.register(cors, {
    credentials: true,
    origin(origin, callback) {
      if (!origin || corsOrigins(env).includes(origin)) return callback(null, true);
      return callback(new AppError(403, "origin_forbidden", "Origin is not allowed"), false);
    },
  });

  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-request-id", request.id);
    return payload;
  });

  app.get("/api/health", async () => ({
    status: "ok",
    service: "fibreconnect-api",
    environment: env.NODE_ENV,
  }));

  app.get("/api/ready", async (_request, reply) => {
    try {
      await getDatabase(env.DATABASE_URL).$queryRaw`SELECT 1`;
      return { status: "ready", database: "available" };
    } catch {
      reply.code(503);
      return { status: "not_ready", database: "unavailable" };
    }
  });

  app.register(registerCatalogueRoutes, env);
  app.register(registerCoverageRoutes, env);
  app.register(registerAuthRoutes, env);

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send(errorEnvelope("not_found", "Resource not found", request.id));
  });

  app.setErrorHandler((error, request, reply) => {
    const appError = error instanceof AppError
      ? error
      : error instanceof ZodError
        ? new AppError(400, "validation_error", "Request validation failed")
        : null;
    const statusCode = appError?.statusCode ?? 500;
    if (statusCode >= 500) request.log.error({ err: error }, "request failed");
    else request.log.warn({ code: appError?.code, statusCode }, "request rejected");

    reply.code(statusCode).send(errorEnvelope(
      appError?.code ?? "internal_error",
      appError?.message ?? "An unexpected error occurred",
      request.id,
      appError?.details,
    ));
  });

  return app;
}
