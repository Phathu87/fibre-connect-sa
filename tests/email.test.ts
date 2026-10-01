import { describe, expect, it, vi } from "vitest";
import { TransactionalAuthDelivery } from "../server/auth/delivery.js";
import {
  createProductionEmailProvider,
  DevelopmentEmailProvider,
  ResendEmailProvider,
  UnconfiguredEmailProvider,
} from "../server/email/provider.js";
import { passwordResetEmail, verificationEmail } from "../server/email/templates.js";
import { parseEnv } from "../server/config/env.js";

const templateInput = {
  to: "person@example.test",
  token: "secure-token-value",
  publicAppUrl: "https://fibreconnect.example/base",
  requestId: "request-123",
};

describe("transactional email templates", () => {
  it("builds verification links from the trusted public application origin", () => {
    const message = verificationEmail(templateInput);
    expect(message.type).toBe("VERIFY_EMAIL");
    expect(message.text).toContain("https://fibreconnect.example/verify-email?token=secure-token-value");
    expect(message.text).not.toContain("/base");
  });

  it("builds single-purpose reset content and escapes link markup", () => {
    const message = passwordResetEmail({ ...templateInput, token: "token<script>alert(1)</script>" });
    expect(message.type).toBe("RESET_PASSWORD");
    expect(message.text).toContain("expires in 1 hour");
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("reset-password?token=");
  });
});

describe("transactional email providers", () => {
  it("captures deterministic development messages without external delivery", async () => {
    const provider = new DevelopmentEmailProvider();
    await expect(provider.send(verificationEmail(templateInput))).resolves.toEqual({ status: "SENT", providerMessageId: "development-1" });
    expect(provider.messages).toHaveLength(1);
    expect(provider.messages[0]?.metadata?.requestId).toBe("request-123");
  });

  it("fails honestly when production configuration is absent", async () => {
    const env = parseEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:password@localhost:5432/fibreconnect",
      PUBLIC_APP_URL: "https://fibreconnect.example",
      CORS_ORIGINS: "https://fibreconnect.example",
    });
    const provider = createProductionEmailProvider(env);
    expect(provider).toBeInstanceOf(UnconfiguredEmailProvider);
    await expect(provider.send(verificationEmail(templateInput))).resolves.toEqual({ status: "NOT_CONFIGURED" });
  });

  it("sends the canonical message through the Resend HTTPS contract", async () => {
    const fetchMock = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify({ id: "email-123" }), { status: 200 }));
    const provider = new ResendEmailProvider({ apiKey: "test-api-key", fromAddress: "no-reply@example.test", fromName: "FibreConnect SA", timeoutMs: 1_000 }, fetchMock as unknown as typeof fetch);
    await expect(provider.send(verificationEmail(templateInput))).resolves.toEqual({ status: "SENT", providerMessageId: "email-123" });
    const [, init] = fetchMock.mock.calls[0]!;
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.resend.com/emails");
    expect(init?.headers).toMatchObject({ authorization: "Bearer test-api-key", "content-type": "application/json" });
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({ from: "FibreConnect SA <no-reply@example.test>", to: ["person@example.test"], subject: "Verify your FibreConnect SA email" });
  });

  it("normalizes provider rejection and malformed success responses", async () => {
    const rejected = new ResendEmailProvider({ apiKey: "key", fromAddress: "no-reply@example.test", fromName: "FibreConnect SA", timeoutMs: 1_000 }, vi.fn(async () => new Response("denied", { status: 429 })) as unknown as typeof fetch);
    const malformed = new ResendEmailProvider({ apiKey: "key", fromAddress: "no-reply@example.test", fromName: "FibreConnect SA", timeoutMs: 1_000 }, vi.fn(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch);
    await expect(rejected.send(verificationEmail(templateInput))).resolves.toEqual({ status: "FAILED", reason: "PROVIDER_REJECTED" });
    await expect(malformed.send(verificationEmail(templateInput))).resolves.toEqual({ status: "FAILED", reason: "MALFORMED_RESPONSE" });
  });

  it("normalizes network failures without exposing provider details", async () => {
    const failedFetch = vi.fn(async () => { throw new Error("provider detail must stay internal"); }) as unknown as typeof fetch;
    const provider = new ResendEmailProvider({ apiKey: "key", fromAddress: "no-reply@example.test", fromName: "FibreConnect SA", timeoutMs: 1_000 }, failedFetch);
    await expect(provider.send(verificationEmail(templateInput))).resolves.toEqual({ status: "FAILED", reason: "NETWORK_ERROR" });
  });

  it("aborts provider calls at the configured timeout", async () => {
    const hangingFetch = vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
    })) as unknown as typeof fetch;
    const provider = new ResendEmailProvider({ apiKey: "key", fromAddress: "no-reply@example.test", fromName: "FibreConnect SA", timeoutMs: 5 }, hangingFetch);
    await expect(provider.send(passwordResetEmail(templateInput))).resolves.toEqual({ status: "FAILED", reason: "TIMEOUT" });
  });

  it("logs only operational metadata, never tokens or message bodies", async () => {
    const provider = new DevelopmentEmailProvider();
    const logger = { info: vi.fn(), warn: vi.fn() };
    const delivery = new TransactionalAuthDelivery(provider, templateInput.publicAppUrl, logger);
    await delivery.deliverVerification(templateInput.to, templateInput.token, templateInput.requestId);
    const logged = JSON.stringify(logger.info.mock.calls);
    expect(logged).toContain("VERIFY_EMAIL");
    expect(logged).toContain("request-123");
    expect(logged).not.toContain(templateInput.token);
    expect(logged).not.toContain(templateInput.to);
  });
});

describe("trusted email URL configuration", () => {
  it("requires HTTPS for production public links", () => {
    expect(() => parseEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:password@localhost:5432/fibreconnect",
      PUBLIC_APP_URL: "http://fibreconnect.example",
      CORS_ORIGINS: "https://fibreconnect.example",
    })).toThrow("Invalid environment configuration: PUBLIC_APP_URL");
  });
});
