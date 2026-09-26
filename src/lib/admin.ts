import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "./constants";

function getAdminSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) return password;
  if (process.env.NODE_ENV !== "production") return "admin";
  return null;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim()) || process.env.NODE_ENV !== "production";
}

export function verifyAdminPassword(password: string): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;
  return password === secret;
}

export function createAdminToken(): string | null {
  const secret = getAdminSecret();
  if (!secret) return null;
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `admin.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret || !token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return false;

  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export async function writeAdminAudit(action: string, target?: string, details?: string) {
  const { prisma } = await import("./prisma");
  await prisma.adminAudit.create({
    data: { action, target, details },
  });
}
