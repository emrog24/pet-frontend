"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Adoption {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: string;
  descripcion: string;
  estado: string;
  fotos: string[];
}

export default function AdopcionesPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [pets, setPets] = useState<Adoption[]>([]);
  const [especieFiltro, setEspecieFiltro] = useState<string>("todas");
  const [loading, setLoading] = useState(true);

  const [selectedPet, setSelectedPet] = useState<Adoption | null>(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setLoading(true);
    const url =
      especieFiltro === "todas"
        ? `${API_URL}/adoptions`
        : `${API_URL}/adoptions?especie=${especieFiltro}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Adoption[]) => {
        setPets(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [especieFiltro]);

  const handleOpenApply = (pet: Adoption) => {
    if (!token) {
      router.push("/login");
      return;
    }
    setSelectedPet(pet);
    setMensaje("");
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !token) return;

    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/adoptions/${selectedPet.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "No se pudo enviar la solicitud");

      setSolicitudesEnviadas((prev) => [...prev, selectedPet.id]);
      setMensaje(`Solicitud de adopción enviada para ${selectedPet.nombre}.`);
      setSelectedPet(null);
      setMotivo("");
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "Error al enviar solicitud");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Encabezado cálido y amigable */}
      <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border border-amber-200 rounded-3xl p-8 mb-8">
        <span className="inline-block px-3 py-1 bg-amber-400/30 text-amber-900 text-xs font-extrabold rounded-full uppercase tracking-wider mb-2">
          Hogar Responsable
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-950 mb-2">
          Adopta una Mascota
        </h1>
        <p className="text-amber-900/80 max-w-2xl">
          Todos nuestros rescatados se entregan vacunados, desparasitados y llenos de cariño esperando una familia.
        </p>
      </div>

      {/* Filtro por especie */}
      <div className="flex gap-2 mb-8">
        {[
          { key: "todas", label: "Todos" },
          { key: "Perro", label: "Perros" },
          { key: "Gato", label: "Gatos" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setEspecieFiltro(tab.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
              especieFiltro === tab.key
                ? "bg-amber-400 text-amber-950 shadow-md shadow-amber-200/60"
                : "bg-white text-amber-900 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mensaje && (
        <div className="bg-amber-50 text-amber-900 border border-amber-300 px-5 py-3 rounded-2xl mb-6 font-medium">
          {mensaje}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-amber-800">Cargando mascotas en adopción...</div>
      ) : pets.length === 0 ? (
        <div className="bg-amber-50/50 rounded-3xl p-12 text-center border border-amber-200">
          <p className="text-amber-900">No hay mascotas disponibles con este filtro por el momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pets.map((pet) => {
            const yaSolicitado = solicitudesEnviadas.includes(pet.id);
            const fotoUrl =
              pet.fotos?.[0] || "https://placehold.co/600x600/fef3c7/92400e?text=Mascota";

            return (
              <div
                key={pet.id}
                className="bg-amber-50/40 rounded-3xl overflow-hidden shadow-sm border border-amber-200 flex flex-col hover:shadow-lg hover:border-amber-400 transition"
              >
                <div className="h-60 bg-amber-100/60 overflow-hidden">
                  <img src={fotoUrl} alt={pet.nombre} className="w-full h-full object-cover" />
                </div>

                <div className="p-6 flex flex-col flex-grow bg-white/80">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-extrabold text-amber-950">{pet.nombre}</h2>
                    <span className="px-3 py-1 bg-amber-200/70 text-amber-900 text-xs font-extrabold rounded-full">
                      {pet.especie}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-amber-700 mb-3">
                    {pet.raza} • {pet.edad}
                  </p>
                  <p className="text-gray-600 text-sm mb-6 flex-grow">{pet.descripcion}</p>

                  <button
                    onClick={() => handleOpenApply(pet)}
                    disabled={yaSolicitado}
                    className={`w-full py-3.5 rounded-xl font-bold transition shadow-sm ${
                      yaSolicitado
                        ? "bg-amber-100 text-amber-800 cursor-default"
                        : "bg-amber-400 text-amber-950 hover:bg-amber-500"
                    }`}
                  >
                    {yaSolicitado ? "Solicitud enviada" : `Adoptar a ${pet.nombre}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de solicitud */}
      {selectedPet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border-2 border-amber-200">
            <h3 className="text-2xl font-extrabold text-amber-950 mb-1">
              Solicitar adopción
            </h3>
            <p className="text-sm text-amber-700 font-semibold mb-6">
              Mascota: {selectedPet.nombre} ({selectedPet.raza})
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cuéntanos sobre tu hogar y experiencia con mascotas
                </label>
                <textarea
                  required
                  rows={4}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Tengo patio amplio, tiempo para paseos diarios..."
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPet(null)}
                  className="w-1/2 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-1/2 py-3 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-500 disabled:opacity-50"
                >
                  {enviando ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}