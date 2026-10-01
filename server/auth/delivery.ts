import type { EmailDeliveryResult, TransactionalEmailProvider } from "../email/provider.js";
import { passwordResetEmail, verificationEmail } from "../email/templates.js";

export type AuthDelivery = {
  readonly configured: boolean;
  deliverVerification(email: string, token: string, requestId?: string): Promise<EmailDeliveryResult>;
  deliverPasswordReset(email: string, token: string, requestId?: string): Promise<EmailDeliveryResult>;
};

type DeliveryLogger = {
  info(data: Record<string, unknown>, message: string): void;
  warn(data: Record<string, unknown>, message: string): void;
};

export class TransactionalAuthDelivery implements AuthDelivery {
  constructor(
    private readonly provider: TransactionalEmailProvider,
    private readonly publicAppUrl: string,
    private readonly logger: DeliveryLogger,
  ) {}

  get configured(): boolean {
    return this.provider.configured;
  }

  deliverVerification(email: string, token: string, requestId?: string): Promise<EmailDeliveryResult> {
    return this.deliver(verificationEmail({ to: email, token, publicAppUrl: this.publicAppUrl, requestId }));
  }

  deliverPasswordReset(email: string, token: string, requestId?: string): Promise<EmailDeliveryResult> {
    return this.deliver(passwordResetEmail({ to: email, token, publicAppUrl: this.publicAppUrl, requestId }));
  }

  private async deliver(message: ReturnType<typeof verificationEmail>): Promise<EmailDeliveryResult> {
    const result = await this.provider.send(message);
    const evidence = {
      emailType: message.type,
      deliveryResult: result.status,
      ...(result.status === "FAILED" ? { deliveryReason: result.reason } : {}),
      requestId: message.metadata?.requestId,
    };
    if (result.status === "SENT") this.logger.info(evidence, "transactional email delivered");
    else this.logger.warn(evidence, "transactional email delivery failed");
    return result;
  }
}
