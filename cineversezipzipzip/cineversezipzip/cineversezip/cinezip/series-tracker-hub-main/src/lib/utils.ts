import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes image URLs to ensure they have a valid protocol (https://)
 * This fixes issues where OMDB returns URLs without protocols like "m.media-amazon.com/..."
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url || url === "N/A" || url.trim() === "") {
    return null;
  }

  let normalizedUrl = url.trim();

  // Handle protocol
  if (normalizedUrl.startsWith("http://")) {
    normalizedUrl = normalizedUrl.replace("http://", "https://");
  } else if (!normalizedUrl.startsWith("https://") && !normalizedUrl.startsWith("http://")) {
    // If it starts with //, add https:
    if (normalizedUrl.startsWith("//")) {
      normalizedUrl = `https:${normalizedUrl}`;
    } else {
      normalizedUrl = `https://${normalizedUrl}`;
    }
  }

  // Validate URL format
  try {
    new URL(normalizedUrl);
    return normalizedUrl;
  } catch {
    // If URL is invalid, return null
    return null;
  }
}

/**
 * Language mapping to match backend logic
 */
const LANGUAGE_MAP: Record<string, string[]> = {
  all: [],
  en: ["english", "eng"],
  hi: ["hindi"],
  es: ["spanish", "espanol"],
  fr: ["french", "francais"],
  de: ["german", "deutsch"],
  ja: ["japanese"],
  ko: ["korean"],
  zh: ["chinese", "mandarin", "cantonese"],
  pt: ["portuguese"],
  it: ["italian"],
  ru: ["russian"],
  ar: ["arabic"],
  tr: ["turkish"],
};

/**
 * Matches language code with item language string (same logic as backend)
 */
export function matchesLanguage(langCode: string, itemLanguage: string | null | undefined): boolean {
  if (!langCode || langCode === "all") return true;
  if (!itemLanguage) return false;

  const normalized = itemLanguage.toLowerCase();
  const variants = LANGUAGE_MAP[langCode] || [langCode.toLowerCase()];
  return variants.some((variant) => normalized.includes(variant));
}
