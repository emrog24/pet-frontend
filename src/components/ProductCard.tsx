"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenUrl: string;
  marca?: string | null;
}

interface BrandTheme {
  cardBorder: string;
  topAccent: string;
  badgeBg: string;
  badgeText: string;
  priceText: string;
  button: string;
  imageBg: string;
}

const BRAND_THEMES: Record<string, BrandTheme> = {
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

const DEFAULT_THEME: BrandTheme = {
  cardBorder: "border-gray-100 hover:border-blue-300",
  topAccent: "bg-blue-600",
  badgeBg: "bg-blue-50",
  badgeText: "text-blue-600",
  priceText: "text-gray-900",
  button: "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500",
  imageBg: "bg-gray-50",
};

function getBrandTheme(marca?: string | null, nombre?: string): BrandTheme {
  const key = marca?.trim().toLowerCase();
  if (key && BRAND_THEMES[key]) return BRAND_THEMES[key];

  // Respaldo por nombre si el producto aún no tiene brand_id asignado
  const titleLower = (nombre || "").toLowerCase();
  for (const brandKey of Object.keys(BRAND_THEMES)) {
    if (titleLower.includes(brandKey)) return BRAND_THEMES[brandKey];
  }
  return DEFAULT_THEME;
}

export default function ProductCard({
  id,
  nombre,
  precio,
  categoria,
  imagenUrl,
  marca,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const theme = getBrandTheme(marca, nombre);

  const handleAddToCart = () => {
    addItem({
      id,
      nombre,
      precio,
      imagenUrl,
    });
  };

  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border ${theme.cardBorder} hover:shadow-xl transition-all duration-300 flex flex-col group`}
    >
      {/* Franja superior con los colores de la marca */}
      <div className={`h-1.5 w-full ${theme.topAccent}`} />

      <div className="p-4 flex flex-col flex-grow">
        {/* Imagen del Producto */}
        <Link
          href={`/producto/${id}`}
          className={`relative h-48 w-full mb-4 overflow-hidden rounded-xl ${theme.imageBg} flex items-center justify-center`}
        >
          <img
            src={imagenUrl}
            alt={`Imagen de ${nombre}`}
            className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
          />

          {/* Gatito/perrito mini asomándose en la esquina al hacer hover */}
          <span
            aria-hidden="true"
            className="absolute -bottom-6 right-2 text-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-6 transition-all duration-300"
          >
            🐾
          </span>
        </Link>

        {/* Detalles del Producto */}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {categoria}
            </span>
            {marca && (
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${theme.badgeBg} ${theme.badgeText}`}
              >
                {marca}
              </span>
            )}
          </div>

          <Link href={`/producto/${id}`}>
            <h3 className="text-gray-800 font-semibold text-lg leading-tight mb-2 hover:opacity-80 transition-opacity line-clamp-2">
              {nombre}
            </h3>
          </Link>

          <div className="mt-auto flex items-center justify-between pt-4">
            <span className={`text-xl font-extrabold ${theme.priceText}`}>
              ${precio.toFixed(2)}
            </span>

            <button
              onClick={handleAddToCart}
              aria-label={`Agregar ${nombre} al carrito`}
              className={`${theme.button} p-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}