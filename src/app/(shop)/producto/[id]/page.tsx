"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL, Product } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function ProductoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [producto, setProducto] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [agregado, setAgregado] = useState(false);
  const [esFavorito, setEsFavorito] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`${API_URL}/products/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProducto(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  const handleToggleFavorite = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!producto) return;

    const res = await fetch(`${API_URL}/users/me/favorites/${producto.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setEsFavorito(data.status === "added");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Cargando producto...</div>;
  }

  if (!producto) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
        <Link href="/" className="text-blue-600 hover:underline">Volver a la tienda</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagenUrl: producto.imagen_url,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        ← Volver al catálogo
      </Link>

      <div className="flex flex-col md:flex-row gap-12 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-full md:w-1/2 bg-gray-50 rounded-2xl flex items-center justify-center p-8">
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full max-w-md object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">
                {producto.category.nombre}
              </span>
              {producto.brand && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-semibold">
                  {producto.brand.nombre}
                </span>
              )}
            </div>

            <button
              onClick={handleToggleFavorite}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                esFavorito
                  ? "bg-pink-50 border-pink-200 text-pink-600"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-pink-300"
              }`}
            >
              {esFavorito ? "♥ Guardado" : "♡ Favorito"}
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {producto.nombre}
          </h1>
          <p className="text-4xl font-black text-blue-600 mb-2">
            ${producto.precio.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Disponibles: <span className="font-semibold text-gray-800">{producto.stock} unidades</span>
          </p>

          <div className="border-t border-gray-100 py-5 mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Descripción</h3>
            <p className="text-gray-600 leading-relaxed">{producto.descripcion}</p>
          </div>

          {producto.atributos && Object.keys(producto.atributos).length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Especificaciones
              </h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(producto.atributos).map(([clave, valor]) => (
                  <div key={clave} className="flex justify-between bg-white px-3 py-2 rounded-lg border border-gray-100">
                    <dt className="text-gray-500 capitalize">{clave.replace("_", " ")}:</dt>
                    <dd className="font-semibold text-gray-800">
                      {typeof valor === "boolean" ? (valor ? "Sí" : "No") : String(valor)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={agregado || producto.stock === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              agregado
                ? "bg-green-500 text-white shadow-green-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
            }`}
          >
            {agregado ? "Agregado al carrito" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}