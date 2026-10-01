import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const optionalSecret = z.preprocess((value) => value === "" ? undefined : value, z.string().min(1).optional());
const optionalEmail = z.preprocess((value) => value === "" ? undefined : value, z.string().email().optional());
const optionalDeploymentContext = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.enum(["local", "test", "preview", "branch", "production"]).optional(),
);
const optionalDatabaseContext = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.enum(["production", "preview", "branch"]).optional(),
);

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
  APP_DEPLOYMENT_CONTEXT: optionalDeploymentContext,
  DATABASE_DEPLOYMENT_CONTEXT: optionalDatabaseContext,
  RESEND_API_KEY: optionalSecret,
  EMAIL_FROM_ADDRESS: optionalEmail,
  EMAIL_FROM_NAME: z.string().trim().min(1).max(100).regex(/^[^\r\n]+$/).default("FibreConnect SA"),
  EMAIL_PROVIDER_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(20_000).default(8_000),
}).superRefine((env, context) => {
  const deployment = deploymentEnvironment(env);
  const url = new URL(env.PUBLIC_APP_URL);
  if (!['http:', 'https:'].includes(url.protocol)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["PUBLIC_APP_URL"], message: "must use HTTP or HTTPS" });
  }
  if (["production", "preview", "branch"].includes(deployment) && url.protocol !== "https:") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["PUBLIC_APP_URL"], message: "must use HTTPS in production" });
  }
  if (url.username || url.password) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["PUBLIC_APP_URL"], message: "must not contain credentials" });
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["PUBLIC_APP_URL"], message: "must be an origin without a path, query, or fragment" });
  }

  for (const origin of configuredOrigins(env.CORS_ORIGINS)) {
    if (origin === "*") {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["CORS_ORIGINS"], message: "must not contain a wildcard" });
      continue;
    }
    try {
      const parsed = new URL(origin);
      if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin || parsed.username || parsed.password) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["CORS_ORIGINS"], message: "must contain exact HTTP or HTTPS origins" });
      }
      if (["production", "preview", "branch"].includes(deployment) && parsed.protocol !== "https:") {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["CORS_ORIGINS"], message: "must use HTTPS for deployed contexts" });
      }
    } catch {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["CORS_ORIGINS"], message: "must contain valid origins" });
    }
  }

  if (["production", "preview", "branch"].includes(deployment) && env.DATABASE_DEPLOYMENT_CONTEXT !== deployment) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["DATABASE_DEPLOYMENT_CONTEXT"], message: `must explicitly match the ${deployment} deployment` });
  }
  if (env.NODE_ENV === "production" && !env.APP_DEPLOYMENT_CONTEXT) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["APP_DEPLOYMENT_CONTEXT"], message: "is required for deployed runtime classification" });
  }
  if (env.NODE_ENV === "production" && env.APP_DEPLOYMENT_CONTEXT && !["production", "preview", "branch"].includes(env.APP_DEPLOYMENT_CONTEXT)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["APP_DEPLOYMENT_CONTEXT"], message: "must identify a deployed context in production mode" });
  }
  if (["production", "preview", "branch"].includes(deployment) && !env.TRUST_PROXY) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["TRUST_PROXY"], message: "must be true for deployed contexts" });
  }
  if (["production", "preview", "branch"].includes(deployment) && !configuredOrigins(env.CORS_ORIGINS).includes(url.origin)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["CORS_ORIGINS"], message: "must include PUBLIC_APP_URL origin" });
  }
});

export type AppEnv = z.infer<typeof envSchema>;
export type DeploymentEnvironment = "local" | "test" | "preview" | "branch" | "production";

export class EnvironmentConfigurationError extends Error {
  constructor(readonly fields: string[]) {
    super(`Invalid environment configuration: ${fields.join(", ")}`);
    this.name = "EnvironmentConfigurationError";
  }
}

export function parseEnv(source: NodeJS.ProcessEnv): AppEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join(".") || "environment");
    throw new EnvironmentConfigurationError([...new Set(fields)]);
  }
  return result.data;
}

export function loadEnv(): AppEnv {
  return parseEnv(process.env);
}

export function corsOrigins(env: AppEnv): string[] {
  const configured = configuredOrigins(env.CORS_ORIGINS);
  if (deploymentEnvironment(env) !== "local") return configured;
  return [...new Set([...configured, "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"])];
}

export function deploymentEnvironment(env: Pick<AppEnv, "NODE_ENV" | "APP_DEPLOYMENT_CONTEXT">): DeploymentEnvironment {
  if (env.NODE_ENV === "test") return "test";
  if (env.APP_DEPLOYMENT_CONTEXT) return env.APP_DEPLOYMENT_CONTEXT;
  if (env.NODE_ENV === "development") return "local";
  return "production";
}

function configuredOrigins(value: string): string[] {
  return value.split(",").map((origin) => origin.trim()).filter(Boolean);
}
