import { describe, expect, it } from "vitest";
import { corsOrigins, parseEnv } from "../server/config/env.js";

const validEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:password@localhost:5432/fibreconnect",
  PUBLIC_APP_URL: "https://fibreconnect.example",
  CORS_ORIGINS: "https://fibreconnect.example, https://admin.fibreconnect.example",
  APP_DEPLOYMENT_CONTEXT: "production",
  DATABASE_DEPLOYMENT_CONTEXT: "production",
  TRUST_PROXY: "true",
};

describe("environment validation", () => {
  it("treats an empty optional bot secret as disabled", () => {
    expect(parseEnv({ ...validEnv, BOT_PROTECTION_SECRET: "" }).BOT_PROTECTION_SECRET).toBeUndefined();
  });
  it("parses required production-facing configuration", () => {
    const env = parseEnv(validEnv);
    expect(env.PORT).toBe(3000);
    expect(corsOrigins(env)).toEqual([
      "https://fibreconnect.example",
      "https://admin.fibreconnect.example",
    ]);
  });

  it("adds loopback Vite origins only outside production", () => {
    const env = parseEnv({ ...validEnv, NODE_ENV: "development", APP_DEPLOYMENT_CONTEXT: "local", DATABASE_DEPLOYMENT_CONTEXT: undefined });
    expect(corsOrigins(env)).toContain("http://127.0.0.1:5173");
    expect(corsOrigins(parseEnv(validEnv))).not.toContain("http://127.0.0.1:5173");
  });

  it("fails without a database URL", () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: undefined })).toThrow(
      "Invalid environment configuration: DATABASE_URL",
    );
  });

  it("fails closed when a preview database is absent or labelled for production", () => {
    const preview = { ...validEnv, APP_DEPLOYMENT_CONTEXT: "preview", PUBLIC_APP_URL: "https://deploy-preview-12--fibreconnect.netlify.app", CORS_ORIGINS: "https://deploy-preview-12--fibreconnect.netlify.app" };
    expect(() => parseEnv({ ...preview, DATABASE_URL: undefined, DATABASE_DEPLOYMENT_CONTEXT: undefined })).toThrow("Invalid environment configuration: DATABASE_URL");
    expect(() => parseEnv(preview)).toThrow("Invalid environment configuration: DATABASE_DEPLOYMENT_CONTEXT");
    expect(parseEnv({ ...preview, DATABASE_DEPLOYMENT_CONTEXT: "preview" }).DATABASE_DEPLOYMENT_CONTEXT).toBe("preview");
  });

  it("requires branch deploys to use explicitly labelled branch database configuration", () => {
    expect(() => parseEnv({ ...validEnv, APP_DEPLOYMENT_CONTEXT: "branch" })).toThrow("Invalid environment configuration: DATABASE_DEPLOYMENT_CONTEXT");
    expect(parseEnv({ ...validEnv, APP_DEPLOYMENT_CONTEXT: "branch", DATABASE_DEPLOYMENT_CONTEXT: "branch" }).APP_DEPLOYMENT_CONTEXT).toBe("branch");
  });

  it("rejects non-deployed context labels and disabled proxy trust in production mode", () => {
    expect(() => parseEnv({ ...validEnv, APP_DEPLOYMENT_CONTEXT: "test", DATABASE_DEPLOYMENT_CONTEXT: undefined })).toThrow("Invalid environment configuration: APP_DEPLOYMENT_CONTEXT");
    expect(() => parseEnv({ ...validEnv, TRUST_PROXY: "false" })).toThrow("Invalid environment configuration: TRUST_PROXY");
  });

  it("rejects wildcard or non-origin CORS configuration", () => {
    expect(() => parseEnv({ ...validEnv, CORS_ORIGINS: "*" })).toThrow("Invalid environment configuration: CORS_ORIGINS");
    expect(() => parseEnv({ ...validEnv, CORS_ORIGINS: "https://fibreconnect.example/api" })).toThrow("Invalid environment configuration: CORS_ORIGINS");
    expect(() => parseEnv({ ...validEnv, CORS_ORIGINS: "https://admin.fibreconnect.example" })).toThrow("Invalid environment configuration: CORS_ORIGINS");
  });

  it("requires trusted deployed application URLs and CORS origins to use HTTPS", () => {
    expect(() => parseEnv({ ...validEnv, PUBLIC_APP_URL: "http://fibreconnect.example" })).toThrow("Invalid environment configuration: PUBLIC_APP_URL");
    expect(() => parseEnv({ ...validEnv, CORS_ORIGINS: "http://fibreconnect.example" })).toThrow("Invalid environment configuration: CORS_ORIGINS");
  });

  it("does not expose rejected values in its error", () => {
    const secret = "not-a-valid-database-secret";
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: secret })).toThrow("Invalid environment configuration: DATABASE_URL");
  });
});
