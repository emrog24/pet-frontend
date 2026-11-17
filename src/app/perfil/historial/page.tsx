"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL, Product } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface OrderItem {
  id: number;
  product_id: string;
  precio_comprado: number;
  cantidad: number;
  product: Product;
}

interface Order {
  id: number;
  total: number;
  estado: string;
  fecha: string;
  items: OrderItem[];
}

export default function HistorialPedidosPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Order[]) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isMounted, token, router]);

  if (!isMounted || loading) {
    return <div className="py-20 text-center text-gray-500">Cargando tu historial de compras...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mis Compras</h1>
          {user && <p className="text-gray-500 text-sm mt-1">Cuenta: {user.email}</p>}
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-full hover:bg-blue-100 transition"
        >
          Seguir comprando
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes pedidos</h2>
          <p className="text-gray-500 mb-6">Cuando confirmes una compra en tu carrito, aparecerá aquí con su detalle.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const fechaFormateada = new Date(order.fecha).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Encabezado de la orden */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block">Pedido</span>
                      <span className="font-extrabold text-gray-900">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block">Fecha</span>
                      <span className="text-sm text-gray-700">{fechaFormateada}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                      {order.estado}
                    </span>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 uppercase font-bold block">Total</span>
                      <span className="text-lg font-black text-blue-600">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Lista de artículos comprados */}
                <div className="p-6 divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <img
                        src={item.product.imagen_url}
                        alt={item.product.nombre}
                        className="w-16 h-16 object-contain bg-gray-50 rounded-xl p-1 flex-shrink-0"
                      />
                      <div className="flex-grow">
                        <Link
                          href={`/producto/${item.product_id}`}
                          className="font-bold text-gray-800 hover:text-blue-600 transition"
                        >
                          {item.product.nombre}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.cantidad} × ${item.precio_comprado.toFixed(2)}
                        </p>
                      </div>
                      <div className="font-bold text-gray-900">
                        ${(item.cantidad * item.precio_comprado).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}