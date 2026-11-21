import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
const COOKIE_NAME = "gensa_session";
const COOKIE_PATH = "/";

export interface HashPasswordResult {
  hash: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export function getAuthCookieOptions(isProduction: boolean) {
  return {
    name: COOKIE_NAME,
    path: COOKIE_PATH,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION_MS / 1000,
  };
}

export function getAuthCookieValue(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=${COOKIE_PATH}; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_MS / 1000}`;
}

export function getClearAuthCookieValue(): string {
  return `${COOKIE_NAME}=; Path=${COOKIE_PATH}; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { SESSION_DURATION_MS, COOKIE_NAME };
