import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../server/app.js";
import type { AppEnv } from "../server/config/env.js";

const env: AppEnv = {
  NODE_ENV: "test",
  SESSION_COOKIE_NAME: "fc_session",
  SESSION_TTL_HOURS: 168,
  HOST: "127.0.0.1",
  PORT: 3000,
  LOG_LEVEL: "silent",
  DATABASE_URL: "postgresql://user:password@localhost:5432/fibreconnect",
  PUBLIC_APP_URL: "https://fibreconnect.example",
  CORS_ORIGINS: "https://fibreconnect.example",
  TRUST_PROXY: false,
};

const apps: ReturnType<typeof createApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("HTTP foundation", () => {
  it("returns health and request-correlation evidence", async () => {
    const app = createApp(env);
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/api/health" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBeTruthy();
    expect(response.json()).toMatchObject({ status: "ok", service: "fibreconnect-api" });
  }, 30_000);

  it("uses the standard error envelope for missing routes", async () => {
    const app = createApp(env);
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/api/missing" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "not_found",
        message: "Resource not found",
        requestId: response.headers["x-request-id"],
      },
    });
  });

  it("rejects unapproved browser origins", async () => {
    const app = createApp(env);
    apps.push(app);
    const response = await app.inject({
      method: "GET",
      url: "/api/health",
      headers: { origin: "https://attacker.example" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("origin_forbidden");
  });

  it("validates coverage requests without echoing private address data", async () => {
    const app = createApp(env);
    apps.push(app);
    const response = await app.inject({ method: "POST", url: "/api/coverage/check", payload: { street: "42 Private Road" } });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("validation_error");
    expect(response.body).not.toContain("42 Private Road");
  });

  it("accepts an empty optional postal code from browser forms", async () => {
    const app = createApp(env);
    apps.push(app);
    const response = await app.inject({ method: "POST", url: "/api/coverage/check", payload: { suburb: "Unknown", postalCode: "" } });
    expect(response.statusCode).not.toBe(400);
  }, 15_000);

  it("denies anonymous account and administration access", async () => {
    const app = createApp(env);
    apps.push(app);
    const account = await app.inject({ method: "GET", url: "/api/me" });
    const admin = await app.inject({ method: "GET", url: "/api/admin/security-check" });

    expect(account.statusCode).toBe(401);
    expect(account.json().error.code).toBe("AUTHENTICATION_REQUIRED");
    expect(admin.statusCode).toBe(401);
    expect(admin.json().error.code).toBe("AUTHENTICATION_REQUIRED");
  });
});
