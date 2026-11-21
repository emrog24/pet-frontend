"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/lib/api";

interface Address {
  id: number;
  calle: string;
  ciudad: string;
  estado: string;
  cp: string;
  es_predeterminada: boolean;
}

export default function CarritoPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !token) return;
    fetch(`${API_URL}/users/me/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Address[]) => {
        setAddresses(data);
        const predeterminada = data.find((a) => a.es_predeterminada) || data[0];
        if (predeterminada) setSelectedAddressId(predeterminada.id);
      })
      .catch(() => {});
  }, [isMounted, token]);

  if (!isMounted) return null;

  const handleCheckout = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setProcesando(true);
    setErrorPago("");

    try {
      const payload = {
        address_id: selectedAddressId,
        items: items.map((item) => ({
          product_id: item.id,
          cantidad: item.cantidad,
        })),
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "No se pudo procesar la orden");
      }

      clearCart();
      router.push("/perfil/historial");
    } catch (err) {
      setErrorPago(err instanceof Error ? err.message : "Error al procesar el pago");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Tu Carrito</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Aún no has agregado productos, servicios o medicamentos. ¡Explora nuestro catálogo!
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            Ir a la Tienda
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-grow space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="w-32 h-32 bg-gray-50 rounded-xl flex-shrink-0 p-2 flex items-center justify-center">
                  <img src={item.imagenUrl} alt={item.nombre} className="max-w-full max-h-full object-contain" />
                </div>

                <div className="flex-grow text-center sm:text-left">
                  <Link
                    href={`/producto/${item.id}`}
                    className="text-lg font-bold text-gray-800 hover:text-blue-600 transition line-clamp-2 mb-2 block"
                  >
                    {item.nombre}
                  </Link>

                  <p className="text-sm text-gray-500 mb-3">
                    Precio unitario: <span className="font-semibold text-gray-700">${item.precio.toFixed(2)}</span>
                  </p>

                  {/* Controles de cantidad (- / cantidad / +) */}
                  <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 mb-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="w-7 h-7 rounded-full bg-white text-gray-700 font-bold shadow-sm hover:bg-blue-600 hover:text-white transition flex items-center justify-center"
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>
                    <span className="font-bold text-gray-900 min-w-[1.5rem] text-center">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      className="w-7 h-7 rounded-full bg-white text-gray-700 font-bold shadow-sm hover:bg-blue-600 hover:text-white transition flex items-center justify-center disabled:cursor-not-allowed"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                    {item.stock !== undefined && item.cantidad >= item.stock && (
                      <span className="text-[11px] font-semibold text-amber-600 block mt-1">
                        Máx. {item.stock} disponibles
                      </span>
                    )}
                  </div>

                  <p className="text-blue-600 font-extrabold text-xl">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-full transition-colors flex-shrink-0"
                  title="Eliminar producto"
                >
                  Eliminar
                </button>
              </div>
            ))}

            <div className="flex justify-end">
              <button onClick={clearCart} className="text-red-500 font-medium hover:underline px-4 py-2">
                Vaciar carrito
              </button>
            </div>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen</h2>

              {errorPago && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                  {errorPago}
                </div>
              )}

              {token && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Dirección de envío</label>
                    <Link href="/perfil" className="text-xs text-blue-600 font-semibold hover:underline">
                      + Gestionar
                    </Link>
                  </div>

                  {addresses.length === 0 ? (
                    <Link
                      href="/perfil"
                      className="block text-center text-xs bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 rounded-xl hover:bg-blue-100 transition"
                    >
                      Agrega una dirección en tu perfil
                    </Link>
                  ) : (
                    <select
                      value={selectedAddressId ?? ""}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {addresses.map((dir) => (
                        <option key={dir.id} value={dir.id}>
                          {dir.calle}, {dir.ciudad} (CP {dir.cp})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="space-y-4 text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="text-green-500 font-bold">Gratis</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8">
                <div className="flex justify-between items-center text-gray-900">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-extrabold text-blue-600">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={procesando}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {procesando ? "Procesando orden..." : token ? "Confirmar y pagar" : "Inicia sesión para pagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}