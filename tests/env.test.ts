import { describe, expect, it } from "vitest";
import { corsOrigins, parseEnv } from "../server/config/env.js";

const validEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:password@localhost:5432/fibreconnect",
  PUBLIC_APP_URL: "https://fibreconnect.example",
  CORS_ORIGINS: "https://fibreconnect.example, https://admin.fibreconnect.example",
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
    const env = parseEnv({ ...validEnv, NODE_ENV: "development" });
    expect(corsOrigins(env)).toContain("http://127.0.0.1:5173");
    expect(corsOrigins(parseEnv(validEnv))).not.toContain("http://127.0.0.1:5173");
  });

  it("fails without a database URL", () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: undefined })).toThrow(
      "Invalid environment configuration: DATABASE_URL",
    );
  });

  it("does not expose rejected values in its error", () => {
    const secret = "not-a-valid-database-secret";
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: secret })).toThrowError(
      new Error("Invalid environment configuration: DATABASE_URL"),
    );
  });
});
