import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 });
}

export function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}
