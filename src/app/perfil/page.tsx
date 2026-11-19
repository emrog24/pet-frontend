"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL, Product } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Address {
  id: number;
  calle: string;
  ciudad: string;
  estado: string;
  cp: string;
  es_predeterminada: boolean;
}

interface PaymentMethod {
  id: number;
  stripe_payment_id: string;
  ultimos_4_digitos: string;
  marca: string;
}

interface UserNotification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: "adopcion" | "cita" | "sistema";
  leida: boolean;
  creado_en: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"direcciones" | "favoritos" | "pagos" | "mensajes">("direcciones");
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  // Formulario nueva dirección
  const [calle, setCalle] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [cp, setCp] = useState("");
  const [esPredeterminada, setEsPredeterminada] = useState(false);
  const [guardandoDir, setGuardandoDir] = useState(false);

  // Formulario método de pago
  const [marcaTarjeta, setMarcaTarjeta] = useState("Visa");
  const [ultimos4, setUltimos4] = useState("");
  const [guardandoPago, setGuardandoPago] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!token) {
      router.push("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/users/me/addresses`, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/users/me/favorites`, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/users/me/payments`, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_URL}/users/me/notifications`, { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([addrData, favData, payData, notifData]) => {
        setAddresses(addrData);
        setFavorites(favData);
        setPayments(payData);
        setNotifications(notifData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isMounted, token, router]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setGuardandoDir(true);

    try {
      const res = await fetch(`${API_URL}/users/me/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          calle,
          ciudad,
          estado,
          cp,
          es_predeterminada: esPredeterminada,
        }),
      });

      if (res.ok) {
        const nueva: Address = await res.json();
        setAddresses((prev) => [...prev, nueva]);
        setCalle("");
        setCiudad("");
        setEstado("");
        setCp("");
        setEsPredeterminada(false);
      }
    } finally {
      setGuardandoDir(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    if (!token) return;
    const res = await fetch(`${API_URL}/users/me/favorites/${productId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || ultimos4.length !== 4) return;
    setGuardandoPago(true);

    try {
      const res = await fetch(`${API_URL}/users/me/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stripe_payment_id: `pm_sim_${Date.now()}`,
          ultimos_4_digitos: ultimos4,
          marca: marcaTarjeta,
        }),
      });

      if (res.ok) {
        const nuevo: PaymentMethod = await res.json();
        setPayments((prev) => [...prev, nuevo]);
        setUltimos4("");
      }
    } finally {
      setGuardandoPago(false);
    }
  };

  const handleMarkRead = async (notifId: number) => {
    if (!token) return;
    const res = await fetch(`${API_URL}/users/me/notifications/${notifId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, leida: true } : n))
      );
    }
  };

  if (!isMounted || loading) {
    return <div className="py-20 text-center text-gray-500">Cargando perfil...</div>;
  }

  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Cabecera del usuario */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Mi Cuenta</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{user?.nombre}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.email} {user?.telefono ? `• ${user.telefono}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/perfil/historial"
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition text-sm"
          >
            Historial de compras
          </Link>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-full hover:bg-red-100 transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "direcciones", label: `Direcciones (${addresses.length})` },
          { key: "favoritos", label: `Favoritos (${favorites.length})` },
          { key: "pagos", label: `Métodos de Pago (${payments.length})` },
          { key: "mensajes", label: `Mensajes (${unreadCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECCIÓN 1: DIRECCIONES */}
      {activeTab === "direcciones" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Direcciones guardadas</h2>
            {addresses.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-gray-500 text-sm">
                Aún no tienes direcciones de envío registradas.
              </div>
            ) : (
              addresses.map((dir) => (
                <div key={dir.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-900">{dir.calle}</p>
                    {dir.es_predeterminada && (
                      <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2.5 py-0.5 rounded-full">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {dir.ciudad}, {dir.estado} • CP {dir.cp}
                  </p>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleAddAddress}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">Agregar nueva dirección</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Calle y número</label>
              <input
                type="text"
                required
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                placeholder="Av. Tecnológico 100, Col. Centro"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  required
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Querétaro"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  required
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  placeholder="Querétaro"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Código Postal</label>
              <input
                type="text"
                required
                maxLength={10}
                value={cp}
                onChange={(e) => setCp(e.target.value)}
                placeholder="76000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={esPredeterminada}
                onChange={(e) => setEsPredeterminada(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Usar como dirección predeterminada
            </label>

            <button
              type="submit"
              disabled={guardandoDir}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {guardandoDir ? "Guardando..." : "Guardar dirección"}
            </button>
          </form>
        </div>
      )}

      {/* SECCIÓN 2: FAVORITOS */}
      {activeTab === "favoritos" && (
        <div>
          {favorites.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center border border-gray-100">
              <p className="text-gray-500 mb-4">No tienes productos guardados en favoritos.</p>
              <Link href="/categorias/todas" className="text-blue-600 font-bold hover:underline">
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={prod.imagen_url}
                      alt={prod.nombre}
                      className="w-full h-40 object-contain bg-gray-50 rounded-xl mb-4 p-2"
                    />
                    <Link
                      href={`/producto/${prod.id}`}
                      className="font-bold text-gray-900 hover:text-blue-600 line-clamp-2"
                    >
                      {prod.nombre}
                    </Link>
                    <p className="text-blue-600 font-extrabold text-lg mt-2">
                      ${prod.precio.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveFavorite(prod.id)}
                    className="mt-4 w-full py-2 text-sm font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition"
                  >
                    Quitar de favoritos
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 3: MÉTODOS DE PAGO */}
      {activeTab === "pagos" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Tarjetas guardadas</h2>
            {payments.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-gray-500 text-sm">
                No tienes tarjetas registradas.
              </div>
            ) : (
              payments.map((pay) => (
                <div
                  key={pay.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-900">{pay.marca}</p>
                    <p className="text-sm text-gray-500">•••• •••• •••• {pay.ultimos_4_digitos}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">Activa</span>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleAddPayment}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">Vincular tarjeta</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Red de pago</label>
              <select
                value={marcaTarjeta}
                onChange={(e) => setMarcaTarjeta(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="American Express">American Express</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Últimos 4 dígitos
              </label>
              <input
                type="text"
                required
                pattern="\d{4}"
                maxLength={4}
                value={ultimos4}
                onChange={(e) => setUltimos4(e.target.value.replace(/\D/g, ""))}
                placeholder="4242"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={guardandoPago || ultimos4.length !== 4}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {guardandoPago ? "Guardando..." : "Guardar tarjeta"}
            </button>
          </form>
        </div>
      )}

      {/* SECCIÓN 4: MENSAJES Y NOTIFICACIONES */}
      {activeTab === "mensajes" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Notificaciones y Confirmaciones</h2>
          {notifications.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-gray-500 text-sm">
              No tienes mensajes ni notificaciones por el momento.
            </div>
          ) : (
            notifications.map((notif) => {
              const isCancelled = notif.titulo.toLowerCase().includes("cancelada");
              return (
                <div
                  key={notif.id}
                  className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    notif.leida
                      ? "bg-white border-gray-100"
                      : isCancelled
                      ? "bg-red-50/70 border-red-300 shadow-sm"
                      : notif.tipo === "adopcion"
                      ? "bg-amber-50/70 border-amber-300 shadow-sm"
                      : "bg-emerald-50/70 border-emerald-300 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          isCancelled
                            ? "bg-red-200 text-red-900"
                            : notif.tipo === "adopcion"
                            ? "bg-amber-200 text-amber-900"
                            : "bg-emerald-200 text-emerald-900"
                        }`}
                      >
                        {isCancelled
                          ? "Cita Cancelada"
                          : notif.tipo === "adopcion"
                          ? "Adopción"
                          : "Cita / Servicio"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(notif.creado_en).toLocaleDateString("es-MX", {
                          dateStyle: "medium",
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{notif.titulo}</h3>
                    <p className="text-sm text-gray-700 mt-1">{notif.mensaje}</p>
                  </div>

                  {!notif.leida && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-100 transition flex-shrink-0"
                    >
                      Marcar como leído
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}