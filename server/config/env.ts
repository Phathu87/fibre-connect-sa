import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const optionalSecret = z.preprocess((value) => value === "" ? undefined : value, z.string().min(1).optional());
const optionalEmail = z.preprocess((value) => value === "" ? undefined : value, z.string().email().optional());

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
  BOT_PROTECTION_SECRET: optionalSecret,
  RESEND_API_KEY: optionalSecret,
  EMAIL_FROM_ADDRESS: optionalEmail,
  EMAIL_FROM_NAME: z.string().trim().min(1).max(100).regex(/^[^\r\n]+$/).default("FibreConnect SA"),
  EMAIL_PROVIDER_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(20_000).default(8_000),
}).superRefine((env, context) => {
  const url = new URL(env.PUBLIC_APP_URL);
  if (!['http:', 'https:'].includes(url.protocol)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["PUBLIC_APP_URL"], message: "must use HTTP or HTTPS" });
  }
  if (env.NODE_ENV === "production" && url.protocol !== "https:") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["PUBLIC_APP_URL"], message: "must use HTTPS in production" });
  }
  if (url.username || url.password) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["PUBLIC_APP_URL"], message: "must not contain credentials" });
  }
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
