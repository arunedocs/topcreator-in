export interface ParsedYouTubeChannel {
  normalizedUrl: string;
  handle: string;
  channelId: string | null;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

export function isYouTubeHost(hostname: string): boolean {
  return YOUTUBE_HOSTS.has(hostname);
}

export function parseYouTubeChannel(raw: string): ParsedYouTubeChannel | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (!isYouTubeHost(parsed.hostname)) {
    return null;
  }

  parsed.search = "";
  parsed.hash = "";
  parsed.protocol = "https:";
  parsed.hostname = parsed.hostname.replace(/^m\./, "www.").replace(/^youtu\.be$/, "www.youtube.com");

  const parts = parsed.pathname.split("/").filter(Boolean);
  let handle = "";
  let channelId: string | null = null;

  if (parsed.hostname.includes("youtu.be") && parts[0]) {
    handle = parts[0];
  } else if (parts[0]?.startsWith("@")) {
    handle = parts[0].slice(1);
    parsed.pathname = `/@${handle}`;
  } else if (parts[0] === "channel" && parts[1]) {
    channelId = parts[1];
    handle = parts[1].slice(0, 18).toLowerCase();
    parsed.pathname = `/channel/${channelId}`;
  } else if ((parts[0] === "c" || parts[0] === "user") && parts[1]) {
    handle = parts[1];
    parsed.pathname = `/${parts[0]}/${parts[1]}`;
  } else if (parts[0]) {
    handle = parts[0].replace(/^@/, "");
    parsed.pathname = `/@${handle}`;
  }

  if (!handle) return null;

  const normalizedUrl = parsed.toString().replace(/\/$/, "");

  return {
    normalizedUrl,
    handle: handle.toLowerCase().replace(/[^a-z0-9._-]/g, ""),
    channelId,
  };
}

export function extractHandleFromUrl(url: string): string {
  return parseYouTubeChannel(url)?.handle ?? "creator";
}

export function generateVerificationCode(): string {
  const token = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TC-${token}`;
}
