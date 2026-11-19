"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { getBrandTheme } from "@/lib/brandThemes";

interface ProductCardProps {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagenUrl: string;
  marca?: string | null;
  stock?: number;
}

export default function ProductCard({
  id,
  nombre,
  precio,
  categoria,
  imagenUrl,
  marca,
  stock,
}: ProductCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const inCartQty = useCartStore((state) => state.getItemQuantity(id));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isOutOfStock = stock !== undefined && stock <= 0;
  const reachedMaxStock =
    isMounted && stock !== undefined && stock > 0 && inCartQty >= stock;
  const theme = getBrandTheme(marca, nombre, isOutOfStock);

  const handleAddToCart = () => {
    if (isOutOfStock || reachedMaxStock) return;
    addItem({
      id,
      nombre,
      precio,
      imagenUrl,
      stock,
    });
  };

  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border ${
        theme.cardBorder
      } transition-all duration-300 flex flex-col group ${
        isOutOfStock
          ? "grayscale opacity-65 select-none"
          : "hover:shadow-xl"
      }`}
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
            className={`object-contain h-full w-full transition-transform duration-300 ${
              isOutOfStock ? "opacity-80" : "group-hover:scale-105"
            }`}
          />

          {isOutOfStock ? (
            <span className="absolute top-2.5 left-2.5 bg-neutral-900/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
              Agotado
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="absolute -bottom-6 right-2 text-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-6 transition-all duration-300"
            >
              🐾
            </span>
          )}
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
            <div>
              <span className={`text-xl font-extrabold ${theme.priceText}`}>
                ${precio.toFixed(2)}
              </span>
              {reachedMaxStock && (
                <p className="text-[10px] font-bold text-amber-600">
                  Máx. en carrito ({stock})
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={isOutOfStock || reachedMaxStock}
              onClick={handleAddToCart}
              aria-label={
                isOutOfStock
                  ? `${nombre} agotado`
                  : reachedMaxStock
                  ? `Límite de stock alcanzado para ${nombre}`
                  : `Agregar ${nombre} al carrito`
              }
              title={
                isOutOfStock
                  ? "Producto agotado"
                  : reachedMaxStock
                  ? `Ya tienes las ${stock} unidades disponibles en tu carrito`
                  : "Agregar al carrito"
              }
              className={`${
                isOutOfStock || reachedMaxStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : theme.button
              } p-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
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