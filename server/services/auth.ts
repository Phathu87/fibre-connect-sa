import type { AuthDelivery } from "../auth/delivery.js";
import { createOpaqueToken, hashOpaqueToken, hashPassword, verifyPassword } from "../auth/crypto.js";
import { AppError } from "../lib/errors.js";
import type { createAuthRepository } from "../repositories/auth.js";

type Repository = ReturnType<typeof createAuthRepository>;
const hour = 60 * 60 * 1000;

export class AuthService {
  constructor(private readonly repository: Repository, private readonly delivery: AuthDelivery, private readonly sessionTtlHours: number, private readonly exposeDevelopmentTokens: boolean) {}

  async register(input: { email: string; password: string; firstName: string; lastName: string; phone?: string | undefined }) {
    this.requireDelivery();
    const email = input.email.trim().toLowerCase();
    const passwordHash = await hashPassword(input.password);
    let user;
    try { user = await this.repository.createUser({ ...input, email, passwordHash }); }
    catch (error) {
      if (isUniqueConstraint(error)) throw new AppError(409, "ACCOUNT_EXISTS", "An account already exists for this email address");
      throw error;
    }
    const verificationToken = await this.issueToken(user.id, "EMAIL_VERIFICATION", 24);
    await this.delivery.deliverVerification(email, verificationToken.rawToken);
    return { user, session: await this.createSession(user.id), ...(this.exposeDevelopmentTokens ? { developmentVerificationToken: verificationToken.rawToken } : {}) };
  }

  async login(emailInput: string, password: string) {
    const email = emailInput.trim().toLowerCase();
    const credentials = await this.repository.findCredentialsByEmail(email);
    const valid = credentials?.passwordHash ? await verifyPassword(credentials.passwordHash, password).catch(() => false) : false;
    if (!credentials || !valid) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    if (credentials.status === "SUSPENDED" || credentials.status === "DISABLED") throw new AppError(403, "ACCOUNT_DISABLED", "This account is not available");
    const user = await this.repository.updateLastLogin(credentials.id);
    return { user, session: await this.createSession(credentials.id) };
  }

  async forgotPassword(emailInput: string) {
    this.requireDelivery();
    const credentials = await this.repository.findCredentialsByEmail(emailInput.trim().toLowerCase());
    if (!credentials || credentials.status === "DISABLED") return {};
    const reset = await this.issueToken(credentials.id, "PASSWORD_RESET", 1);
    await this.delivery.deliverPasswordReset(credentials.email, reset.rawToken);
    return this.exposeDevelopmentTokens ? { developmentResetToken: reset.rawToken } : {};
  }

  async resetPassword(rawToken: string, password: string) {
    const token = await this.repository.consumeAuthToken(hashOpaqueToken(rawToken), "PASSWORD_RESET");
    if (!token) throw new AppError(400, "INVALID_TOKEN", "This reset link is invalid or expired");
    await this.repository.resetPassword(token.id, token.userId, await hashPassword(password));
  }

  async verifyEmail(rawToken: string) {
    const token = await this.repository.consumeAuthToken(hashOpaqueToken(rawToken), "EMAIL_VERIFICATION");
    if (!token) throw new AppError(400, "INVALID_TOKEN", "This verification link is invalid or expired");
    const [, user] = await this.repository.verifyEmail(token.id, token.userId);
    return user;
  }

  async resendVerification(userId: string, email: string) {
    this.requireDelivery();
    const verification = await this.issueToken(userId, "EMAIL_VERIFICATION", 24);
    await this.delivery.deliverVerification(email, verification.rawToken);
    return this.exposeDevelopmentTokens ? { developmentVerificationToken: verification.rawToken } : {};
  }

  private async createSession(userId: string) {
    const token = createOpaqueToken();
    const csrfToken = createOpaqueToken();
    const expiresAt = new Date(Date.now() + this.sessionTtlHours * hour);
    const record = await this.repository.createSession({ userId, tokenHash: hashOpaqueToken(token), csrfTokenHash: hashOpaqueToken(csrfToken), expiresAt });
    return { id: record.id, token, csrfToken, expiresAt };
  }

  private async issueToken(userId: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET", ttlHours: number) {
    const rawToken = createOpaqueToken();
    await this.repository.createAuthToken({ userId, type, tokenHash: hashOpaqueToken(rawToken), expiresAt: new Date(Date.now() + ttlHours * hour) });
    return { rawToken };
  }

  private requireDelivery() {
    if (!this.delivery.configured) throw new AppError(503, "AUTH_EMAIL_UNAVAILABLE", "Authentication email delivery is not configured");
  }
}

function isUniqueConstraint(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
