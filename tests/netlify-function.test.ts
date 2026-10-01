import { afterEach, describe, expect, it } from "vitest";
import { handler } from "../netlify/functions/api.js";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("Netlify environment isolation", () => {
  it("reports not ready when a preview has no explicitly approved preview database", async () => {
    Object.assign(process.env, {
      NODE_ENV: "production",
      APP_DEPLOYMENT_CONTEXT: "preview",
      DATABASE_URL: "postgresql://preview-test:preview-test@127.0.0.1:5432/preview-test",
      DATABASE_DEPLOYMENT_CONTEXT: "production",
      PUBLIC_APP_URL: "https://deploy-preview-12--fibreconnect.netlify.app",
      CORS_ORIGINS: "https://deploy-preview-12--fibreconnect.netlify.app",
      TRUST_PROXY: "true",
      LOG_LEVEL: "silent",
    });

    const response = await handler({ httpMethod: "GET", path: "/api/ready", headers: {} });

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body)).toMatchObject({ status: "not_ready", reason: "environment_configuration" });
    expect(response.body).not.toContain("postgresql://");
  });

  it("rejects an inherited production origin on a preview host", async () => {
    Object.assign(process.env, {
      NODE_ENV: "production",
      APP_DEPLOYMENT_CONTEXT: "production",
      DATABASE_URL: "postgresql://production-test:production-test@127.0.0.1:5432/production-test",
      DATABASE_DEPLOYMENT_CONTEXT: "production",
      PUBLIC_APP_URL: "https://fibreconnect.example",
      CORS_ORIGINS: "https://fibreconnect.example",
      TRUST_PROXY: "true",
      LOG_LEVEL: "silent",
    });

    const response = await handler({ httpMethod: "GET", path: "/api/ready", headers: { host: "deploy-preview-12--fibreconnect.netlify.app" } });

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body)).toMatchObject({ status: "not_ready", reason: "environment_configuration" });
    expect(response.body).not.toContain("fibreconnect.example");
  });
});
