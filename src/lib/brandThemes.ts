export interface BrandTheme {
  cardBorder: string;
  topAccent: string;
  badgeBg: string;
  badgeText: string;
  priceText: string;
  button: string;
  imageBg: string;
}

export const BRAND_THEMES: Record<string, BrandTheme> = {
  proplan: {
    cardBorder: "border-red-200 hover:border-red-500",
    topAccent: "bg-gradient-to-r from-neutral-900 via-red-600 to-amber-500",
    badgeBg: "bg-neutral-900",
    badgeText: "text-amber-400",
    priceText: "text-red-700",
    button: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500",
    imageBg: "bg-red-50/40",
  },
  nexgard: {
    cardBorder: "border-purple-200 hover:border-purple-500",
    topAccent: "bg-gradient-to-r from-purple-700 to-orange-500",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    priceText: "text-purple-900",
    button: "bg-purple-50 text-purple-700 hover:bg-purple-700 hover:text-white focus:ring-purple-500",
    imageBg: "bg-purple-50/40",
  },
  kong: {
    cardBorder: "border-rose-200 hover:border-red-600",
    topAccent: "bg-red-600",
    badgeBg: "bg-red-600",
    badgeText: "text-white",
    priceText: "text-red-600",
    button: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500",
    imageBg: "bg-rose-50/40",
  },
  "scoop away": {
    cardBorder: "border-indigo-200 hover:border-indigo-500",
    topAccent: "bg-gradient-to-r from-indigo-600 to-sky-500",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
    priceText: "text-indigo-900",
    button: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white focus:ring-indigo-500",
    imageBg: "bg-indigo-50/40",
  },
  "royal canin": {
    cardBorder: "border-red-200 hover:border-red-500",
    topAccent: "bg-red-600",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    priceText: "text-gray-900",
    button: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500",
    imageBg: "bg-gray-50",
  },
};

export const DEFAULT_THEME: BrandTheme = {
  cardBorder: "border-gray-100 hover:border-blue-300",
  topAccent: "bg-blue-600",
  badgeBg: "bg-blue-50",
  badgeText: "text-blue-600",
  priceText: "text-gray-900",
  button: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500",
  imageBg: "bg-gray-50",
};

export const GHOST_THEME: BrandTheme = {
  cardBorder: "border-gray-200",
  topAccent: "bg-gray-400",
  badgeBg: "bg-gray-200",
  badgeText: "text-gray-600",
  priceText: "text-gray-500",
  button: "bg-gray-100 text-gray-400 cursor-not-allowed",
  imageBg: "bg-gray-100",
};

export function getBrandTheme(
  marca?: string | null,
  nombre?: string,
  isOutOfStock = false
): BrandTheme {
  if (isOutOfStock) return GHOST_THEME;

  const key = marca?.trim().toLowerCase();
  if (key && BRAND_THEMES[key]) return BRAND_THEMES[key];

  const titleLower = (nombre || "").toLowerCase();
  for (const brandKey of Object.keys(BRAND_THEMES)) {
    if (titleLower.includes(brandKey)) return BRAND_THEMES[brandKey];
  }
  return DEFAULT_THEME;
}
