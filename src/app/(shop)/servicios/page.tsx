"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface ServiceItem {
  id: number;
  tipo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
}

interface DayAvailability {
  ocupadas: number;
  disponibles: number;
  lleno: boolean;
}

interface AvailabilityResponse {
  tipo: string;
  limite_diario: number;
  dias: Record<string, DayAvailability>;
}

const DAILY_LIMITS_LABEL: Record<string, number> = {
  estetica: 3,
  veterinaria: 7,
  adiestramiento: 5,
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCurrentHHMM(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function ServiciosContent() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [nombreMascota, setNombreMascota] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("11:00");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fecha y hora actuales inicializadas en cliente (evita error de prerender con new Date())
  const [todayStr, setTodayStr] = useState<string>("");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [viewYear, setViewYear] = useState<number | null>(null);
  const [viewMonth, setViewMonth] = useState<number | null>(null); // 0 - 11
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  useEffect(() => {
    const now = new Date();
    setTodayStr(formatLocalDate(now));
    setCurrentTimeStr(getCurrentHHMM());
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/services`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ServiceItem[]) => {
        setServices(data);
        if (data.length > 0) setSelectedService(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchAvailability = async (tipo: string, year: number, monthZeroIndexed: number) => {
    setLoadingCalendar(true);
    try {
      const res = await fetch(
        `${API_URL}/services/availability?tipo=${encodeURIComponent(tipo)}&year=${year}&month=${
          monthZeroIndexed + 1
        }`
      );
      if (res.ok) {
        const data: AvailabilityResponse = await res.json();
        setAvailability(data);

        setSelectedDate((prevDate) =>
          prevDate && data.dias[prevDate]?.lleno ? "" : prevDate
        );
      }
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (!selectedService || viewYear === null || viewMonth === null) return;
    fetchAvailability(selectedService.tipo, viewYear, viewMonth);
  }, [selectedService, viewYear, viewMonth]);

  if (loading || viewYear === null || viewMonth === null) {
    return <div className="py-20 text-center text-gray-500">Cargando servicios...</div>;
  }

  const [minYearStr, minMonthStr] = todayStr.split("-");
  const minYear = Number(minYearStr);
  const minMonth = Number(minMonthStr) - 1;
  const isAtCurrentMonth = viewYear === minYear && viewMonth === minMonth;

  const handlePrevMonth = () => {
    if (isAtCurrentMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => (y !== null ? y - 1 : null));
    } else {
      setViewMonth((m) => (m !== null ? m - 1 : null));
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => (y !== null ? y + 1 : null));
    } else {
      setViewMonth((m) => (m !== null ? m + 1 : null));
    }
  };

  const isSelectedDateToday = Boolean(todayStr) && selectedDate === todayStr;
  const isTimeInPast =
    isSelectedDateToday && Boolean(currentTimeStr) && selectedTime <= currentTimeStr;

  const handleSelectDate = (dateStr: string) => {
    setErrorMsg("");
    setSelectedDate(dateStr);

    if (dateStr === todayStr) {
      const now = new Date();
      const nowHHMM = getCurrentHHMM();
      setCurrentTimeStr(nowHHMM);
      if (selectedTime <= nowHHMM) {
        const nextHour = Math.min(20, now.getHours() + 1);
        setSelectedTime(`${String(nextHour).padStart(2, "0")}:00`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedService) return;

    if (!selectedDate) {
      setErrorMsg("Selecciona un día disponible en el calendario.");
      return;
    }

    if (selectedDate < todayStr) {
      setErrorMsg("No puedes seleccionar una fecha anterior al día de hoy.");
      return;
    }

    const liveNowHHMM = getCurrentHHMM();
    if (selectedDate === todayStr && selectedTime <= liveNowHHMM) {
      setCurrentTimeStr(liveNowHHMM);
      setErrorMsg(`Para citas hoy debes elegir una hora posterior a las ${liveNowHHMM} hrs.`);
      return;
    }

    if (availability?.dias[selectedDate]?.lleno) {
      setErrorMsg("El día seleccionado ya alcanzó el máximo de citas permitidas.");
      return;
    }

    setSubmitting(true);
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
          fecha_hora: `${selectedDate}T${selectedTime}:00-06:00`,
        }),
      });

      if (res.ok) {
        setSuccessMsg(
          `¡Solicitud enviada para ${nombreMascota}! El equipo confirmará tu cita de ${selectedService.nombre} en tu perfil.`
        );
        setNombreMascota("");
        setSelectedDate("");
        fetchAvailability(selectedService.tipo, viewYear, viewMonth);
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMsg(errData?.detail || "No se pudo agendar la cita.");
      }
    } catch {
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  // Construcción de celdas del calendario (lunes a domingo)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const limiteDiario =
    availability?.limite_diario ??
    DAILY_LIMITS_LABEL[selectedService?.tipo.toLowerCase() || ""] ??
    5;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
          Cuidado y Bienestar
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
          Servicios Veterinarios, Estética y Adiestramiento
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Elige un servicio y consulta los días con lugares disponibles en nuestro calendario.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Tarjetas de Servicios */}
        <div className="lg:col-span-5 space-y-4">
          {services.map((srv) => {
            const isSelected = selectedService?.id === srv.id;
            const tipoKey = srv.tipo.toLowerCase();
            const cap = DAILY_LIMITS_LABEL[tipoKey] ?? 5;

            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => {
                  setSelectedService(srv);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`w-full text-left p-6 rounded-3xl border transition-all ${
                  isSelected
                    ? "bg-white border-blue-500 ring-2 ring-blue-500/30 shadow-lg"
                    : "bg-white/95 border-gray-100 hover:border-blue-300 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full ${
                      tipoKey === "veterinaria"
                        ? "bg-emerald-100 text-emerald-800"
                        : tipoKey === "estetica"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {srv.tipo}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    Cupo: {cap} citas/día
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-gray-900">{srv.nombre}</h2>
                <p className="text-sm text-gray-600 mt-1">{srv.descripcion}</p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-2xl font-black text-blue-600">
                    ${srv.precio.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    Duración: {srv.duracion_minutos} min
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Columna Derecha: Calendario de Disponibilidad + Formulario */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          {selectedService && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase text-blue-600">
                    Reservando cita para
                  </span>
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {selectedService.nombre}
                  </h2>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full self-start">
                  Máximo {limiteDiario} citas por día en {selectedService.tipo}
                </span>
              </div>

              {/* Nombre de la mascota */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Nombre de tu mascota
                </label>
                <input
                  type="text"
                  required
                  value={nombreMascota}
                  onChange={(e) => setNombreMascota(e.target.value)}
                  placeholder="Ej. Max, Luna, Toby"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Calendario Interactivo con Días Llenos Marcados */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    1. Elige una fecha disponible
                  </label>

                  {/* Leyenda de estados */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Disponible
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                      Cupo lleno
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
                      Pasado
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                  {/* Cabecera Mes / Año */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      disabled={isAtCurrentMonth}
                      onClick={handlePrevMonth}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>

                    <span className="font-extrabold text-gray-900 text-base">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                      {loadingCalendar && (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          Actualizando...
                        </span>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100"
                    >
                      Siguiente →
                    </button>
                  </div>

                  {/* Nombres de los días */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-gray-400 uppercase mb-2">
                    {WEEK_DAYS.map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  {/* Celdas de días */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: startOffset }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="h-14" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dateObj = new Date(viewYear, viewMonth, dayNum);
                      const dateStr = formatLocalDate(dateObj);

                      const isPast = dateStr < todayStr;
                      const info = availability?.dias[dateStr];
                      const isFull = Boolean(info?.lleno);
                      const ocupadas = info?.ocupadas ?? 0;
                      const disponibles = Math.max(0, limiteDiario - ocupadas);
                      const isSelected = selectedDate === dateStr;
                      const isDisabled = isPast || isFull;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleSelectDate(dateStr)}
                          title={
                            isPast
                              ? "Fecha pasada"
                              : isFull
                              ? `Sin disponibilidad (${ocupadas}/${limiteDiario} citas ocupadas)`
                              : `${disponibles} lugares disponibles`
                          }
                          className={`h-14 rounded-xl border flex flex-col items-center justify-center p-1 transition text-xs ${
                            isPast
                              ? "bg-gray-100/70 border-gray-100 text-gray-300 cursor-not-allowed"
                              : isFull
                              ? "bg-red-50 border-red-200 text-red-700 cursor-not-allowed"
                              : isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md font-extrabold"
                              : "bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50/40"
                          }`}
                        >
                          <span className={`text-sm font-extrabold ${isFull ? "line-through" : ""}`}>
                            {dayNum}
                          </span>

                          {isFull ? (
                            <span className="text-[9px] font-black uppercase tracking-tight text-red-600">
                              Lleno
                            </span>
                          ) : !isPast ? (
                            <span
                              className={`text-[9px] font-semibold ${
                                isSelected ? "text-blue-100" : "text-emerald-600"
                              }`}
                            >
                              {disponibles} disp.
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selector de Hora */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  2. Elige la hora de atención
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="time"
                    required
                    min={isSelectedDateToday ? currentTimeStr : undefined}
                    value={selectedTime}
                    onChange={(e) => {
                      setErrorMsg("");
                      setSelectedTime(e.target.value);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedDate ? (
                    <p className="text-xs text-gray-600">
                      Fecha seleccionada:{" "}
                      <strong className="text-gray-900">{selectedDate}</strong> a las{" "}
                      <strong className="text-gray-900">{selectedTime} hrs</strong>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 font-semibold">
                      Selecciona primero un día en el calendario de arriba.
                    </p>
                  )}
                </div>

                {isTimeInPast && (
                  <p className="text-xs text-red-600 font-bold mt-1.5">
                    ⚠️ Esa hora ya pasó el día de hoy. Elige una hora posterior a las{" "}
                    {currentTimeStr} hrs.
                  </p>
                )}
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-2xl">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold px-4 py-3 rounded-2xl">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedDate || isTimeInPast}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Agendando cita..." : "Confirmar solicitud de cita"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServiciosPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Cargando servicios...</div>}>
      <ServiciosContent />
    </Suspense>
  );
}