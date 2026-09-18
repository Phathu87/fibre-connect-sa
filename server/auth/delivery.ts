export type AuthDelivery = {
  readonly configured: boolean;
  deliverVerification(email: string, token: string): Promise<void>;
  deliverPasswordReset(email: string, token: string): Promise<void>;
};

export class DevelopmentAuthDelivery implements AuthDelivery {
  readonly configured = true;
  async deliverVerification(_email: string, _token: string) {}
  async deliverPasswordReset(_email: string, _token: string) {}
}

export class UnconfiguredProductionAuthDelivery implements AuthDelivery {
  readonly configured = false;
  async deliverVerification() { throw new Error("production auth email delivery is not configured"); }
  async deliverPasswordReset() { throw new Error("production auth email delivery is not configured"); }
}
