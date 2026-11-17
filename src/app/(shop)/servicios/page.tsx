"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Service {
  id: number;
  tipo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion_minutos: number;
}

interface Appointment {
  id: number;
  nombre_mascota: string;
  fecha_hora: string;
  estado: string;
  service: Service;
}

interface ServiceStyle {
  label: string;
  card: string;
  headerBg: string;
  badge: string;
  titleText: string;
  descText: string;
  priceText: string;
  durationBadge: string;
  button: string;
}

const SERVICE_STYLES: Record<string, ServiceStyle> = {
  // Grooming: limpio, azul claro, blanco y tipografía gris
  estetica: {
    label: "Grooming y Estética",
    card: "bg-white border-sky-200 hover:border-sky-400",
    headerBg: "bg-sky-50/70",
    badge: "bg-sky-100 text-sky-700",
    titleText: "text-slate-800",
    descText: "text-slate-600",
    priceText: "text-sky-600",
    durationBadge: "bg-slate-100 text-slate-600",
    button: "bg-sky-500 text-white hover:bg-sky-600",
  },
  // Consultas Veterinarias: verde salud/médico
  veterinaria: {
    label: "Consulta Veterinaria",
    card: "bg-white border-emerald-200 hover:border-emerald-500",
    headerBg: "bg-emerald-50/70",
    badge: "bg-emerald-100 text-emerald-800",
    titleText: "text-gray-900",
    descText: "text-gray-600",
    priceText: "text-emerald-600",
    durationBadge: "bg-emerald-50 text-emerald-700",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  // Adiestramiento
  adiestramiento: {
    label: "Adiestramiento",
    card: "bg-white border-teal-200 hover:border-teal-400",
    headerBg: "bg-teal-50/60",
    badge: "bg-teal-100 text-teal-800",
    titleText: "text-gray-900",
    descText: "text-gray-600",
    priceText: "text-teal-600",
    durationBadge: "bg-gray-100 text-gray-600",
    button: "bg-teal-600 text-white hover:bg-teal-700",
  },
};

export default function ServiciosPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [nombreMascota, setNombreMascota] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [agendando, setAgendando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/services`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Service[]) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Appointment[]) => setAppointments(data))
      .catch(() => {});
  }, [token]);

  const handleOpenBooking = (service: Service) => {
    if (!token) {
      router.push("/login");
      return;
    }
    setSelectedService(service);
    setMensaje("");
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !token) return;

    setAgendando(true);
    setMensaje("");

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_id: selectedService.id,
          nombre_mascota: nombreMascota,
          fecha_hora: new Date(fechaHora).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error al agendar cita");

      setAppointments((prev) => [data, ...prev]);
      setSelectedService(null);
      setNombreMascota("");
      setFechaHora("");
      setMensaje("Cita agendada correctamente.");
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "No se pudo agendar");
    } finally {
      setAgendando(false);
    }
  };

  const filteredServices =
    filtroTipo === "todos" ? services : services.filter((s) => s.tipo === filtroTipo);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
          Servicios, Grooming y Consultas
        </h1>
        <p className="text-slate-500">
          Estética limpia y relajante para tu mascota o atención médica veterinaria certificada.
        </p>
      </div>

      {/* Filtros con colores temáticos */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFiltroTipo("todos")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
            filtroTipo === "todos"
              ? "bg-slate-800 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
          }`}
        >
          Todos
        </button>

        <button
          onClick={() => setFiltroTipo("estetica")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
            filtroTipo === "estetica"
              ? "bg-sky-500 text-white shadow-md shadow-sky-200"
              : "bg-white text-sky-700 border border-sky-200 hover:bg-sky-50"
          }`}
        >
          Grooming y Estética
        </button>

        <button
          onClick={() => setFiltroTipo("veterinaria")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
            filtroTipo === "veterinaria"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          Consultas Veterinarias
        </button>

        <button
          onClick={() => setFiltroTipo("adiestramiento")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
            filtroTipo === "adiestramiento"
              ? "bg-teal-600 text-white shadow-md"
              : "bg-white text-teal-700 border border-teal-200 hover:bg-teal-50"
          }`}
        >
          Adiestramiento
        </button>
      </div>

      {mensaje && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-5 py-3 rounded-2xl mb-6 font-medium">
          {mensaje}
        </div>
      )}

      {/* Tarjetas de servicios */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Cargando servicios...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {filteredServices.map((service) => {
            const style = SERVICE_STYLES[service.tipo] || SERVICE_STYLES.estetica;

            return (
              <div
                key={service.id}
                className={`rounded-3xl overflow-hidden shadow-sm border ${style.card} flex flex-col justify-between hover:shadow-md transition`}
              >
                <div className={`p-6 ${style.headerBg}`}>
                  <span
                    className={`inline-block px-3 py-1 ${style.badge} text-xs font-extrabold rounded-full uppercase mb-3`}
                  >
                    {style.label}
                  </span>
                  <h2 className={`text-xl font-bold ${style.titleText} mb-2`}>{service.nombre}</h2>
                  <p className={`${style.descText} text-sm`}>{service.descripcion}</p>
                </div>

                <div className="p-6 pt-4 bg-white border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-2xl font-black ${style.priceText}`}>
                      ${service.precio.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-semibold ${style.durationBadge} px-3 py-1 rounded-full`}
                    >
                      {service.duracion_minutos} min
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenBooking(service)}
                    className={`w-full py-3 ${style.button} font-bold rounded-xl transition`}
                  >
                    Agendar cita
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de reserva */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Agendar Cita</h3>
            <p
              className={`text-sm font-semibold mb-6 ${
                selectedService.tipo === "veterinaria" ? "text-emerald-600" : "text-sky-600"
              }`}
            >
              {selectedService.nombre}
            </p>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nombre de tu mascota
                </label>
                <input
                  type="text"
                  required
                  value={nombreMascota}
                  onChange={(e) => setNombreMascota(e.target.value)}
                  placeholder="Ej. Rocky"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Fecha y hora deseada
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="w-1/2 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={agendando}
                  className={`w-1/2 py-3 rounded-xl text-white font-bold disabled:opacity-50 ${
                    selectedService.tipo === "veterinaria"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-sky-500 hover:bg-sky-600"
                  }`}
                >
                  {agendando ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Citas agendadas del usuario */}
      {token && appointments.length > 0 && (
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Mis Citas Agendadas</h2>
          <div className="divide-y divide-slate-100">
            {appointments.map((appt) => {
              const isVet = appt.service.tipo === "veterinaria";
              return (
                <div
                  key={appt.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-wrap justify-between items-center gap-4"
                >
                  <div>
                    <p className="font-bold text-slate-800">
                      {appt.service.nombre} —{" "}
                      <span className={isVet ? "text-emerald-600" : "text-sky-600"}>
                        {appt.nombre_mascota}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(appt.fecha_hora).toLocaleString("es-MX", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                      isVet
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {appt.estado}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}