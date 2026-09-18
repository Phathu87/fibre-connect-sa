import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  PUBLIC_APP_URL: z.string().url(),
  CORS_ORIGINS: z.string().min(1),
  TRUST_PROXY: booleanString,
  SESSION_COOKIE_NAME: z.string().min(1).default("fc_session"),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(168),
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv): AppEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join(".") || "environment");
    throw new Error(`Invalid environment configuration: ${[...new Set(fields)].join(", ")}`);
  }
  return result.data;
}

export function loadEnv(): AppEnv {
  return parseEnv(process.env);
}

export function corsOrigins(env: AppEnv): string[] {
  const configured = env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (env.NODE_ENV === "production") return configured;
  return [...new Set([...configured, "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"])];
}
