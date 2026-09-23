import type { FastifyRequest } from "fastify";
import type { AppEnv } from "../config/env.js";
import { AppError } from "../lib/errors.js";

type TurnstileResponse = { success?: boolean };

export function createBotProtection(env: AppEnv) {
  return async function verifyBot(request: FastifyRequest) {
    if (!env.BOT_PROTECTION_SECRET) return;
    const token = request.headers["x-bot-token"];
    if (typeof token !== "string" || token.length < 10) throw new AppError(400, "BOT_VERIFICATION_REQUIRED", "Bot verification is required");
    const body = new URLSearchParams({ secret: env.BOT_PROTECTION_SECRET, response: token, remoteip: request.ip });
    let result: TurnstileResponse;
    try {
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
      result = await response.json() as TurnstileResponse;
    } catch {
      throw new AppError(503, "BOT_VERIFICATION_UNAVAILABLE", "Bot verification is temporarily unavailable");
    }
    if (!result.success) throw new AppError(400, "BOT_VERIFICATION_FAILED", "Bot verification failed");
  };
}
