"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_URL, Product } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { getBrandTheme } from "@/lib/brandThemes";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedMsg, setAddedMsg] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const inCartQty = useCartStore((state) =>
    productId ? state.getItemQuantity(productId) : 0
  );
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!productId) return;
    fetch(`${API_URL}/products/${productId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleToggleFavorite = async () => {
    if (!token || !product) return;
    const res = await fetch(`${API_URL}/users/me/favorites/${product.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setIsFav((prev) => !prev);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Cargando producto...</div>;
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 mb-4">Producto no encontrado.</p>
        <Link href="/categorias/todas" className="text-blue-600 font-bold hover:underline">
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const reachedMaxStock = isMounted && !isOutOfStock && inCartQty >= product.stock;
  const theme = getBrandTheme(product.brand?.nombre, product.nombre, isOutOfStock);
  const atributosEntries = Object.entries(product.atributos || {});

  // Botón principal sólido acorde a la marca
  const getPrimaryActionButton = () => {
    if (isOutOfStock || reachedMaxStock) {
      return "bg-gray-200 text-gray-500 cursor-not-allowed";
    }
    const key = (product.brand?.nombre || product.nombre).toLowerCase();
    if (key.includes("proplan") || key.includes("kong") || key.includes("royal canin")) {
      return "bg-red-600 hover:bg-red-700 text-white";
    }
    if (key.includes("nexgard")) {
      return "bg-purple-700 hover:bg-purple-800 text-white";
    }
    if (key.includes("scoop away")) {
      return "bg-indigo-600 hover:bg-indigo-700 text-white";
    }
    return "bg-blue-600 hover:bg-blue-700 text-white";
  };

  const handleAddToCart = () => {
    if (isOutOfStock || reachedMaxStock) return;
    const added = addItem({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagenUrl: product.imagen_url,
      stock: product.stock,
    });
    if (added) {
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link
        href="/categorias/todas"
        className="inline-block text-sm text-gray-400 hover:text-white mb-6 transition"
      >
        ← Volver al catálogo
      </Link>

      {/* Alerta cuando el producto está agotado */}
      {isOutOfStock && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-600 text-red-900 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
          <span className="text-xl leading-none">⚠️</span>
          <div>
            <p className="font-extrabold text-sm uppercase tracking-wide text-red-700">
              Producto no disponible
            </p>
            <p className="text-sm text-red-800 mt-0.5">
              Este artículo se encuentra agotado por el momento y no puede agregarse al carrito.
            </p>
          </div>
        </div>
      )}

      <div
        className={`bg-white rounded-3xl shadow-sm border overflow-hidden ${theme.cardBorder}`}
      >
        {/* Franja superior con los colores de la marca */}
        <div className={`h-2 w-full ${theme.topAccent}`} />

        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Imagen (en escala de grises si stock === 0) */}
          <div
            className={`relative ${theme.imageBg} rounded-2xl p-6 flex items-center justify-center ${
              isOutOfStock ? "grayscale opacity-65" : ""
            }`}
          >
            <img
              src={product.imagen_url}
              alt={product.nombre}
              className="max-h-96 object-contain"
            />
            {isOutOfStock && (
              <span className="absolute top-4 left-4 bg-neutral-900 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
                Agotado
              </span>
            )}
          </div>

          {/* Información */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  {product.category?.nombre}
                </span>
                {product.brand && (
                  <span
                    className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wide ${theme.badgeBg} ${theme.badgeText}`}
                  >
                    {product.brand.nombre}
                  </span>
                )}
              </div>

              {token && (
                <button
                  onClick={handleToggleFavorite}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                    isFav
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {isFav ? "♥ En favoritos" : "♡ Favorito"}
                </button>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {product.nombre}
            </h1>

            <p className={`text-3xl font-extrabold mt-4 ${theme.priceText}`}>
              ${product.precio.toFixed(2)}
            </p>

            <p className="text-sm text-gray-600 mt-2">
              Disponibles:{" "}
              {isOutOfStock ? (
                <strong className="text-red-600">0 unidades (Agotado)</strong>
              ) : (
                <strong className={product.stock <= 5 ? "text-amber-600" : "text-gray-900"}>
                  {product.stock} unidades
                </strong>
              )}
            </p>

            {!isOutOfStock && isMounted && inCartQty > 0 && (
              <p className="text-xs font-semibold text-gray-500 mt-1">
                Tienes <strong>{inCartQty}</strong>{" "}
                {inCartQty === 1 ? "unidad" : "unidades"} en tu carrito.
              </p>
            )}

            <hr className="my-5 border-gray-100" />

            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">Descripción</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.descripcion || "Sin descripción adicional."}
              </p>
            </div>

            {atributosEntries.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">
                  Especificaciones
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {atributosEntries.map(([clave, valor]) => (
                    <div
                      key={clave}
                      className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-xs"
                    >
                      <span className="text-gray-400 capitalize">{clave.replace("_", " ")}: </span>
                      <strong className="text-gray-800">{String(valor)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={isOutOfStock || reachedMaxStock}
              onClick={handleAddToCart}
              className={`mt-6 w-full py-3.5 font-bold rounded-xl transition ${getPrimaryActionButton()}`}
            >
              {isOutOfStock
                ? "Producto no disponible"
                : reachedMaxStock
                ? `Límite alcanzado (${product.stock} en carrito)`
                : addedMsg
                ? "✓ Agregado al carrito"
                : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}