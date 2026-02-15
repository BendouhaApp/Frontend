const DEFAULT_API_URL = "http://localhost:3000/api";
const FALLBACK_IMAGE = "/vite.svg";

const apiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const publicUrl = import.meta.env.VITE_PUBLIC_URL || apiUrl;

const safeOrigin = (value?: string): string | null => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const backendOrigins = new Set(
  [safeOrigin(apiUrl), safeOrigin(publicUrl)].filter(
    (origin): origin is string => Boolean(origin),
  ),
);

const ensureLeadingSlash = (value: string): string =>
  value.startsWith("/") ? value : `/${value}`;

export const resolveMediaUrl = (
  value?: string | null,
  fallback = FALLBACK_IMAGE,
): string => {
  if (!value || typeof value !== "string") return fallback;

  const raw = value.trim();
  if (!raw) return fallback;

  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);

      if (
        import.meta.env.DEV &&
        backendOrigins.has(parsed.origin) &&
        parsed.pathname.startsWith("/uploads/")
      ) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      if (parsed.pathname === "/placeholder.jpg") return fallback;
    } catch {
      return fallback;
    }

    return raw;
  }

  const normalized = ensureLeadingSlash(raw);
  if (normalized === "/placeholder.jpg") return fallback;
  return normalized;
};

export const handleImageError = (
  event: { currentTarget: HTMLImageElement },
  fallback = FALLBACK_IMAGE,
) => {
  const element = event.currentTarget;
  if (element.dataset.fallbackApplied === "true") return;

  element.dataset.fallbackApplied = "true";
  element.src = fallback;
};
