import { CATEGORIES, type CategoryId } from "./constants";
import { parseYouTubeChannel } from "./youtube";

export function isValidCategory(value: string): value is CategoryId {
  return CATEGORIES.some((category) => category.id === value);
}

export function validateYouTubeUrl(raw: string): {
  valid: boolean;
  normalized: string;
  error?: string;
} {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { valid: false, normalized: "", error: "Channel URL is required." };
  }

  const parsed = parseYouTubeChannel(trimmed);

  if (!parsed) {
    return {
      valid: false,
      normalized: trimmed,
      error: "Enter a valid YouTube channel URL (e.g. https://youtube.com/@channel).",
    };
  }

  return { valid: true, normalized: parsed.normalizedUrl };
}
