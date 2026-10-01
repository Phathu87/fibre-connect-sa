import type { AppEnv } from "../config/env.js";

export type TransactionalEmailType = "VERIFY_EMAIL" | "RESET_PASSWORD";

export type TransactionalEmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  type: TransactionalEmailType;
  metadata?: { requestId?: string | undefined };
};

export type EmailDeliveryResult =
  | { status: "SENT"; providerMessageId?: string | undefined }
  | { status: "FAILED"; reason: "TIMEOUT" | "PROVIDER_REJECTED" | "NETWORK_ERROR" | "MALFORMED_RESPONSE" }
  | { status: "NOT_CONFIGURED" };

export interface TransactionalEmailProvider {
  readonly configured: boolean;
  send(message: TransactionalEmailMessage): Promise<EmailDeliveryResult>;
}

export class DevelopmentEmailProvider implements TransactionalEmailProvider {
  readonly configured = true;
  readonly messages: TransactionalEmailMessage[] = [];

  async send(message: TransactionalEmailMessage): Promise<EmailDeliveryResult> {
    this.messages.push(structuredClone(message));
    return { status: "SENT", providerMessageId: `development-${this.messages.length}` };
  }
}

export class UnconfiguredEmailProvider implements TransactionalEmailProvider {
  readonly configured = false;
  async send(): Promise<EmailDeliveryResult> {
    return { status: "NOT_CONFIGURED" };
  }
}

type FetchLike = typeof fetch;

export class ResendEmailProvider implements TransactionalEmailProvider {
  readonly configured = true;

  constructor(
    private readonly config: { apiKey: string; fromAddress: string; fromName: string; timeoutMs: number },
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async send(message: TransactionalEmailMessage): Promise<EmailDeliveryResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await this.fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: `${this.config.fromName} <${this.config.fromAddress}>`,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
          tags: [{ name: "email_type", value: message.type.toLowerCase() }],
        }),
        signal: controller.signal,
      });
      if (!response.ok) return { status: "FAILED", reason: "PROVIDER_REJECTED" };
      const payload = await response.json().catch(() => null) as { id?: unknown } | null;
      if (!payload || typeof payload.id !== "string" || !payload.id) {
        return { status: "FAILED", reason: "MALFORMED_RESPONSE" };
      }
      return { status: "SENT", providerMessageId: payload.id };
    } catch (error) {
      if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
        return { status: "FAILED", reason: "TIMEOUT" };
      }
      return { status: "FAILED", reason: "NETWORK_ERROR" };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createProductionEmailProvider(env: AppEnv, fetchImpl: FetchLike = fetch): TransactionalEmailProvider {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM_ADDRESS) return new UnconfiguredEmailProvider();
  return new ResendEmailProvider({
    apiKey: env.RESEND_API_KEY,
    fromAddress: env.EMAIL_FROM_ADDRESS,
    fromName: env.EMAIL_FROM_NAME,
    timeoutMs: env.EMAIL_PROVIDER_TIMEOUT_MS,
  }, fetchImpl);
}
