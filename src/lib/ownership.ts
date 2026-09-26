import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { OWNER_COOKIE } from "./constants";

function getOwnershipSecret(): string {
  return (
    process.env.OWNERSHIP_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.RAZORPAY_KEY_SECRET?.trim() ||
    "topcreator-dev-ownership"
  );
}

export function signClaimTokens(tokens: string[]): string {
  const payload = Buffer.from(JSON.stringify(tokens)).toString("base64url");
  const sig = createHmac("sha256", getOwnershipSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readClaimTokens(value: string | undefined): string[] {
  if (!value) return [];
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return [];

  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  const expected = createHmac("sha256", getOwnershipSecret()).update(payload).digest("base64url");

  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length) return [];
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return [];

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function getOwnedClaimTokens(): Promise<string[]> {
  const store = await cookies();
  return readClaimTokens(store.get(OWNER_COOKIE)?.value);
}

export async function appendOwnedClaimToken(token: string): Promise<void> {
  const store = await cookies();
  const existing = readClaimTokens(store.get(OWNER_COOKIE)?.value);
  const next = Array.from(new Set([...existing, token]));
  store.set(OWNER_COOKIE, signClaimTokens(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
