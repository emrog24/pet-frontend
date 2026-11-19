"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_URL, Product } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedMsg, setAddedMsg] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const token = useAuthStore((state) => state.token);

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

  const getBrandBadgeStyle = (brandName?: string | null) => {
    if (!brandName) return "bg-slate-800 text-white";
    const key = brandName.toLowerCase();
    if (key.includes("proplan")) return "bg-black text-amber-400 border border-red-600";
    if (key.includes("kong")) return "bg-red-600 text-white";
    if (key.includes("nexgard")) return "bg-purple-700 text-white";
    return "bg-blue-900 text-white";
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

  const atributosEntries = Object.entries(product.atributos || {});

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link
        href="/categorias/todas"
        className="inline-block text-sm text-gray-400 hover:text-white mb-6 transition"
      >
        ← Volver al catálogo
      </Link>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Imagen */}
        <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center">
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="max-h-96 object-contain"
          />
        </div>

        {/* Información */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                {product.category?.nombre}
              </span>
              {product.brand && (
                <span
                  className={`text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full ${getBrandBadgeStyle(
                    product.brand.nombre
                  )}`}
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

          <p className="text-3xl font-black text-blue-600 mt-4">
            ${product.precio.toFixed(2)}
          </p>

          <p className="text-sm text-gray-600 mt-2">
            Disponibles:{" "}
            <strong className={product.stock <= 5 ? "text-amber-600" : "text-gray-900"}>
              {product.stock} unidades
            </strong>
          </p>

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
            disabled={product.stock === 0}
            onClick={() => {
              addItem(product);
              setAddedMsg(true);
              setTimeout(() => setAddedMsg(false), 2000);
            }}
            className="mt-6 w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {product.stock === 0
              ? "Agotado"
              : addedMsg
              ? "✓ Agregado al carrito"
              : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}