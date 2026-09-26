export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "creator";
}

export function uniqueSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}
