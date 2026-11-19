"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface AdminProduct {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  requiere_restock: boolean;
  imagen_url: string;
  category_id: number;
  brand_id: number | null;
  categoria: string;
  marca: string | null;
  atributos: Record<string, unknown>;
}

interface AdminAdoption {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: string;
  descripcion: string;
  estado: string;
  fotos: string[];
}

interface AdminAdoptionRequest {
  id: number;
  motivo: string;
  estado: string;
  fecha: string;
  usuario: { id: number; nombre: string; email: string; telefono?: string };
  mascota: { id: number; nombre: string; especie: string; raza: string; estado: string; foto?: string };
}

interface AdminAppointment {
  id: number;
  nombre_mascota: string;
  fecha_hora: string;
  estado: string;
  servicio: string;
  tipo: string;
  cliente: { id: number; nombre: string; email: string; telefono?: string };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState<"inventario" | "adopciones" | "citas" | "editar">("inventario");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  // Inventario
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; nombre: string }[]>([]);
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});

  // Nuevo producto
  const [prodNombre, setProdNombre] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrecio, setProdPrecio] = useState("");
  const [prodStock, setProdStock] = useState("10");
  const [prodImg, setProdImg] = useState("");
  const [prodCatId, setProdCatId] = useState<number>(1);
  const [prodBrandId, setProdBrandId] = useState<string>("");

  // Nueva marca
  const [brandNombre, setBrandNombre] = useState("");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [creandoMarca, setCreandoMarca] = useState(false);

  // Atributos dinámicos del producto (peso, sabor, talla, etc.)
  const [atributosList, setAtributosList] = useState<{ clave: string; valor: string }[]>([
    { clave: "", valor: "" },
  ]);

  // Adopciones
  const [requests, setRequests] = useState<AdminAdoptionRequest[]>([]);
  const [petNombre, setPetNombre] = useState("");
  const [petEspecie, setPetEspecie] = useState("Perro");
  const [petRaza, setPetRaza] = useState("");
  const [petEdad, setPetEdad] = useState("");
  const [petDesc, setPetDesc] = useState("");
  const [petFoto, setPetFoto] = useState("");

  // Modal aprobación adopción
  const [approvingReq, setApprovingReq] = useState<AdminAdoptionRequest | null>(null);
  const [modalidad, setModalidad] = useState<"sucursal" | "domicilio">("sucursal");
  const [mensajeAprobacion, setMensajeAprobacion] = useState("");

  const [aprobando, setAprobando] = useState(false);
  const [approveError, setApproveError] = useState("");

  // Citas
  const [citasSemana, setCitasSemana] = useState<AdminAppointment[]>([]);
  const [citasHistorial, setCitasHistorial] = useState<AdminAppointment[]>([]);

  // Modal de confirmación / cancelación de citas
  const [appointmentModal, setAppointmentModal] = useState<{
    cita: AdminAppointment;
    accion: "confirm" | "cancel";
  } | null>(null);
  const [mensajeCita, setMensajeCita] = useState("");
  const [enviandoCita, setEnviandoCita] = useState(false);

  // Lista completa de mascotas en adopción y estados de edición
const [adoptionsList, setAdoptionsList] = useState<AdminAdoption[]>([]);

// Edición de producto seleccionado
const [editingProductId, setEditingProductId] = useState<string>("");
const [editProdNombre, setEditProdNombre] = useState("");
const [editProdDesc, setEditProdDesc] = useState("");
const [editProdPrecio, setEditProdPrecio] = useState("");
const [editProdStock, setEditProdStock] = useState("0");
const [editProdImg, setEditProdImg] = useState("");
const [editProdCatId, setEditProdCatId] = useState<number>(1);
const [editProdBrandId, setEditProdBrandId] = useState<string>("");
const [editAtributosList, setEditAtributosList] = useState<{ clave: string; valor: string }[]>([
  { clave: "", valor: "" },
]);
const [guardandoEditProd, setGuardandoEditProd] = useState(false);

// Edición de mascota seleccionada
const [editingAdoptionId, setEditingAdoptionId] = useState<number | null>(null);
const [editPetNombre, setEditPetNombre] = useState("");
const [editPetEspecie, setEditPetEspecie] = useState("Perro");
const [editPetRaza, setEditPetRaza] = useState("");
const [editPetEdad, setEditPetEdad] = useState("");
const [editPetEstado, setEditPetEstado] = useState("disponible");
const [editPetFoto, setEditPetFoto] = useState("");
const [editPetDesc, setEditPetDesc] = useState("");
const [guardandoEditPet, setGuardandoEditPet] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchAllAdminData = async (authToken: string) => {
    const headers = { Authorization: `Bearer ${authToken}` };
    const [prodRes, metaRes, reqRes, apptRes, adoptListRes] = await Promise.all([
      fetch(`${API_URL}/admin/products`, { headers }),
      fetch(`${API_URL}/admin/catalog-meta`, { headers }),
      fetch(`${API_URL}/admin/adoptions/requests`, { headers }),
      fetch(`${API_URL}/admin/appointments`, { headers }),
      fetch(`${API_URL}/admin/adoptions`, { headers }),
    ]);

    if (prodRes.status === 403) {
      router.push("/");
      return;
    }

    if (prodRes.ok) {
      const pData: AdminProduct[] = await prodRes.json();
      setProducts(pData);
      const drafts: Record<string, number> = {};
      pData.forEach((p) => (drafts[p.id] = p.stock));
      setStockDrafts(drafts);
    }
    if (metaRes.ok) {
      const mData = await metaRes.json();
      setCategories(mData.categories || []);
      setBrands(mData.brands || []);
      if (mData.categories?.[0]) setProdCatId(mData.categories[0].id);
    }
    if (reqRes.ok) setRequests(await reqRes.json());
    if (apptRes.ok) {
      const aData = await apptRes.json();
      setCitasSemana(aData.semanales || []);
      setCitasHistorial(aData.historial || []);
    }
    if (adoptListRes.ok) {
      setAdoptionsList(await adoptListRes.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isMounted) return;
    if (!token || user?.rol !== "admin") {
      router.push("/login");
      return;
    }
    fetchAllAdminData(token);
  }, [isMounted, token, user, router]);

  // --- HANDLERS INVENTARIO ---
  const handleUpdateStock = async (productId: string) => {
    if (!token) return;
    const res = await fetch(`${API_URL}/admin/products/${productId}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stock: Number(stockDrafts[productId] ?? 0) }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: updated.stock, requiere_restock: updated.requiere_restock }
            : p
        )
      );
      setFeedback("Stock actualizado correctamente.");
    }
  };

  const handleAddAtributo = (claveSugerida = "") => {
    setAtributosList((prev) => {
      const emptyIdx = prev.findIndex((item) => !item.clave.trim() && !item.valor.trim());
      if (claveSugerida && emptyIdx !== -1) {
        const copia = [...prev];
        copia[emptyIdx] = { clave: claveSugerida, valor: "" };
        return copia;
      }
      return [...prev, { clave: claveSugerida, valor: "" }];
    });
  };

  const handleAtributoChange = (index: number, field: "clave" | "valor", value: string) => {
    setAtributosList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveAtributo = (index: number) => {
    setAtributosList((prev) =>
      prev.length === 1 ? [{ clave: "", valor: "" }] : prev.filter((_, idx) => idx !== index)
    );
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !brandNombre.trim()) return;
    setCreandoMarca(true);

    try {
      const res = await fetch(`${API_URL}/admin/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: brandNombre.trim(),
          logo_url: brandLogoUrl.trim() || null,
        }),
      });

      if (res.ok) {
        const creada: { id: number; nombre: string } = await res.json();
        setBrands((prev) => [...prev, creada]);
        setProdBrandId(String(creada.id));
        setBrandNombre("");
        setBrandLogoUrl("");
        setFeedback(`Marca "${creada.nombre}" registrada y seleccionada para el nuevo producto.`);
      } else {
        const errData = await res.json().catch(() => null);
        setFeedback(errData?.detail || "No se pudo registrar la marca.");
      }
    } finally {
      setCreandoMarca(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const atributosObj: Record<string, string> = {};
    atributosList.forEach(({ clave, valor }) => {
      const k = clave.trim().toLowerCase();
      const v = valor.trim();
      if (k && v) {
        atributosObj[k] = v;
      }
    });

    const res = await fetch(`${API_URL}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: prodNombre,
        descripcion: prodDesc,
        precio: parseFloat(prodPrecio),
        stock: parseInt(prodStock, 10),
        imagen_url: prodImg,
        category_id: Number(prodCatId),
        brand_id: prodBrandId ? Number(prodBrandId) : null,
        atributos: atributosObj,
      }),
    });

    if (res.ok) {
      setProdNombre("");
      setProdDesc("");
      setProdPrecio("");
      setProdStock("10");
      setProdImg("");
      setAtributosList([{ clave: "", valor: "" }]);
      setFeedback("Producto agregado al catálogo con sus especificaciones.");
      fetchAllAdminData(token);
    }
  };

  // --- HANDLERS ADOPCIONES ---
  const handleCreateAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch(`${API_URL}/admin/adoptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: petNombre,
        especie: petEspecie,
        raza: petRaza || "Mestizo",
        edad: petEdad,
        descripcion: petDesc,
        foto_url: petFoto,
      }),
    });
    if (res.ok) {
      setPetNombre("");
      setPetRaza("");
      setPetEdad("");
      setPetDesc("");
      setPetFoto("");
      setFeedback("Mascota publicada en el catálogo de adopciones.");
      fetchAllAdminData(token);
    }
  };

  const handleApproveAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !approvingReq) return;
    setAprobando(true);
    setApproveError("");

    try {
        const res = await fetch(`${API_URL}/admin/adoptions/requests/${approvingReq.id}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            modalidad_entrega: modalidad,
            mensaje_personalizado: mensajeAprobacion,
        }),
        });

        if (res.ok) {
        setFeedback(
            `Solicitud aprobada. ${approvingReq.mascota.nombre} se ocultó del catálogo y se notificó a ${approvingReq.usuario.nombre}.`
        );
        setApprovingReq(null);
        setMensajeAprobacion("");
        fetchAllAdminData(token);
        } else {
        const errData = await res.json().catch(() => null);
        setApproveError(errData?.detail || `Error al aprobar solicitud (${res.status})`);
        }
    } catch {
        setApproveError("Error de conexión con el servidor.");
    } finally {
        setAprobando(false);
    }
  };

  // --- HANDLERS CITAS (MODAL) ---
  const openConfirmModal = (cita: AdminAppointment) => {
    setAppointmentModal({ cita, accion: "confirm" });
    setMensajeCita(
      `Tu espacio para ${cita.servicio} con ${cita.nombre_mascota} está reservado y listo. Te recomendamos llegar 10 minutos antes.`
    );
  };

  const openCancelModal = (cita: AdminAppointment) => {
    setAppointmentModal({ cita, accion: "cancel" });
    setMensajeCita(
      "Lo sentimos, no contamos con disponibilidad en ese horario. Por favor reagenda tu cita en otro momento desde la sección de Servicios."
    );
  };

  const handleAppointmentModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !appointmentModal) return;
    setEnviandoCita(true);

    const { cita, accion } = appointmentModal;
    const endpoint =
      accion === "confirm"
        ? `${API_URL}/admin/appointments/${cita.id}/confirm`
        : `${API_URL}/admin/appointments/${cita.id}/cancel`;

    const body =
      accion === "confirm"
        ? { mensaje_confirmacion: mensajeCita }
        : { motivo_cancelacion: mensajeCita };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFeedback(
          accion === "confirm"
            ? `Cita de ${cita.nombre_mascota} confirmada y notificación enviada a ${cita.cliente.nombre}.`
            : `Cita de ${cita.nombre_mascota} cancelada y notificación enviada a ${cita.cliente.nombre}.`
        );
        setAppointmentModal(null);
        setMensajeCita("");
        fetchAllAdminData(token);
      }
    } finally {
      setEnviandoCita(false);
    }
  };

  // --- HANDLERS EDICIÓN DE PRODUCTOS ---
  const handleSelectProductToEdit = (prod: AdminProduct) => {
    setEditingProductId(prod.id);
    setEditProdNombre(prod.nombre);
    setEditProdDesc(prod.descripcion || "");
    setEditProdPrecio(String(prod.precio));
    setEditProdStock(String(prod.stock));
    setEditProdImg(prod.imagen_url);
    setEditProdCatId(prod.category_id);
    setEditProdBrandId(prod.brand_id ? String(prod.brand_id) : "");

    const entries = Object.entries(prod.atributos || {});
    if (entries.length > 0) {
      setEditAtributosList(
        entries.map(([clave, valor]) => ({ clave, valor: String(valor) }))
      );
    } else {
      setEditAtributosList([{ clave: "", valor: "" }]);
    }
  };

  const handleEditAtributoChange = (index: number, field: "clave" | "valor", value: string) => {
    setEditAtributosList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddEditAtributo = () => {
    setEditAtributosList((prev) => [...prev, { clave: "", valor: "" }]);
  };

  const handleRemoveEditAtributo = (index: number) => {
    setEditAtributosList((prev) =>
      prev.length === 1 ? [{ clave: "", valor: "" }] : prev.filter((_, idx) => idx !== index)
    );
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProductId) return;
    setGuardandoEditProd(true);

    const atributosObj: Record<string, string> = {};
    editAtributosList.forEach(({ clave, valor }) => {
      const k = clave.trim().toLowerCase();
      const v = valor.trim();
      if (k && v) {
        atributosObj[k] = v;
      }
    });

    try {
      const res = await fetch(`${API_URL}/admin/products/${editingProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: editProdNombre,
          descripcion: editProdDesc,
          precio: parseFloat(editProdPrecio),
          stock: parseInt(editProdStock, 10),
          imagen_url: editProdImg,
          category_id: Number(editProdCatId),
          brand_id: editProdBrandId ? Number(editProdBrandId) : null,
          atributos: atributosObj,
        }),
      });

      if (res.ok) {
        setFeedback(`Producto "${editProdNombre}" actualizado correctamente.`);
        fetchAllAdminData(token);
      }
    } finally {
      setGuardandoEditProd(false);
    }
  };

  // --- HANDLERS EDICIÓN DE MASCOTAS ---
  const handleSelectAdoptionToEdit = (pet: AdminAdoption) => {
    setEditingAdoptionId(pet.id);
    setEditPetNombre(pet.nombre);
    setEditPetEspecie(pet.especie);
    setEditPetRaza(pet.raza);
    setEditPetEdad(pet.edad);
    setEditPetEstado(pet.estado);
    setEditPetFoto(pet.fotos?.[0] || "");
    setEditPetDesc(pet.descripcion);
  };

  const handleSaveEditedAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || editingAdoptionId === null) return;
    setGuardandoEditPet(true);

    try {
      const res = await fetch(`${API_URL}/admin/adoptions/${editingAdoptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: editPetNombre,
          especie: editPetEspecie,
          raza: editPetRaza || "Mestizo",
          edad: editPetEdad,
          estado: editPetEstado,
          foto_url: editPetFoto,
          descripcion: editPetDesc,
        }),
      });

      if (res.ok) {
        setFeedback(`Información de "${editPetNombre}" actualizada correctamente.`);
        fetchAllAdminData(token);
      }
    } finally {
      setGuardandoEditPet(false);
    }
  };

  if (!isMounted || loading) {
    return <div className="py-20 text-center text-gray-500">Cargando panel de administración...</div>;
  }

  const restockCount = products.filter((p) => p.requiere_restock).length;
  const pendingAdoptionsCount = requests.filter((r) => r.estado === "pendiente").length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Panel de Administración
          </span>
          <h1 className="text-3xl font-extrabold mt-1">Control Operativo PetMarket</h1>
          <p className="text-slate-300 text-sm mt-1">
            Gestión de inventario, solicitudes de adopción y agenda semanal de servicios.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-slate-800 px-4 py-3 rounded-2xl border border-slate-700">
            <p className="text-xs text-slate-400">Alertas Re-stock</p>
            <p className="text-2xl font-black text-amber-400">{restockCount}</p>
          </div>
          <div className="bg-slate-800 px-4 py-3 rounded-2xl border border-slate-700">
            <p className="text-xs text-slate-400">Adopciones Pendientes</p>
            <p className="text-2xl font-black text-emerald-400">{pendingAdoptionsCount}</p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-5 py-3 rounded-2xl mb-6 flex justify-between items-center text-sm font-semibold">
          <span>{feedback}</span>
          <button onClick={() => setFeedback("")} className="text-blue-500 hover:text-blue-800">
            Cerrar
          </button>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: "inventario", label: `Catálogo y Re-stock (${products.length})` },
          { key: "adopciones", label: `Adopciones y Solicitudes (${pendingAdoptionsCount})` },
          { key: "citas", label: `Agenda Semanal e Historial (${citasSemana.length})` },
          { key: "editar", label: "Editar Productos y Mascotas" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key as typeof tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
              tab === item.key
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-slate-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: INVENTARIO, ALERTA RE-STOCK Y NUEVO PRODUCTO      */}
      {/* ======================================================== */}
      {tab === "inventario" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Inventario Actual</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs">
                  <th className="py-3">Producto</th>
                  <th className="py-3">Precio</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Stock</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => (
                  <tr key={prod.id} className={prod.requiere_restock ? "bg-red-50/40" : ""}>
                    <td className="py-3 pr-3">
                      <p className="font-bold text-gray-900">{prod.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {prod.categoria} {prod.marca ? `• ${prod.marca}` : ""}
                      </p>
                    </td>
                    <td className="py-3 font-semibold text-gray-700">${prod.precio.toFixed(2)}</td>
                    <td className="py-3">
                      {prod.stock === 0 ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-extrabold rounded-full">
                          Agotado
                        </span>
                      ) : prod.requiere_restock ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full">
                          Re-stock urgente
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                          Óptimo
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        min={0}
                        value={stockDrafts[prod.id] ?? prod.stock}
                        onChange={(e) =>
                          setStockDrafts({ ...stockDrafts, [prod.id]: Number(e.target.value) })
                        }
                        className="w-20 px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-900 font-bold"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleUpdateStock(prod.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                      >
                        Guardar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Columna derecha: Nueva Marca + Nuevo Producto */}
          <div className="space-y-6">
            {/* Formulario nueva marca */}
            <form
              onSubmit={handleCreateBrand}
              className="bg-slate-50 rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Registrar Nueva Marca</h2>
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {brands.length} activas
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Nombre de la marca
                </label>
                <input
                  type="text"
                  required
                  value={brandNombre}
                  onChange={(e) => setBrandNombre(e.target.value)}
                  placeholder="Ej. Royal Canin, Hill's, Whiskas"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  URL del logotipo (opcional)
                </label>
                <input
                  type="url"
                  value={brandLogoUrl}
                  onChange={(e) => setBrandLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={creandoMarca}
                className="w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
              >
                {creandoMarca ? "Guardando marca..." : "Guardar marca"}
              </button>
            </form>

            {/* Formulario nuevo producto */}
            <form
              onSubmit={handleCreateProduct}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-900">Agregar Nuevo Producto</h2>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={prodNombre}
                  onChange={(e) => setProdNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrecio}
                    onChange={(e) => setProdPrecio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Stock inicial</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Categoría</label>
                  <select
                    value={prodCatId}
                    onChange={(e) => setProdCatId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-900 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Marca</label>
                  <select
                    value={prodBrandId}
                    onChange={(e) => setProdBrandId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-900 bg-white"
                  >
                    <option value="">Sin marca</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">URL de Imagen</label>
                <input
                  type="url"
                  required
                  value={prodImg}
                  onChange={(e) => setProdImg(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              {/* Especificaciones / Atributos JSONB */}
              <div className="border-t border-gray-100 pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-600 uppercase">
                    Especificaciones (opcional)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddAtributo()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    + Agregar campo
                  </button>
                </div>

                {/* Sugerencias rápidas */}
                <div className="flex flex-wrap gap-1.5">
                  {["peso", "sabor", "talla", "etapa"].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddAtributo(sug)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full hover:bg-blue-100 transition capitalize"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {atributosList.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={attr.clave}
                        onChange={(e) => handleAtributoChange(idx, "clave", e.target.value)}
                        placeholder="Ej. peso"
                        className="w-1/2 px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-900 text-xs"
                      />
                      <input
                        type="text"
                        value={attr.valor}
                        onChange={(e) => handleAtributoChange(idx, "valor", e.target.value)}
                        placeholder="Ej. 15 kg"
                        className="w-1/2 px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAtributo(idx)}
                        className="px-2 py-1 text-gray-400 hover:text-red-500 font-bold text-sm"
                        title="Quitar atributo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
              >
                Publicar producto
              </button>
            </form>
          </div>
        </div>
      )}

{/* ======================================================== */}
      {/* TAB 2: SOLICITUDES DE ADOPCIÓN Y NUEVO RESCATADO         */}
      {/* ======================================================== */}
      {tab === "adopciones" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4 min-w-0">
            <h2 className="text-xl font-bold text-white">Solicitudes Recibidas</h2>
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-gray-500">
                No hay solicitudes de adopción registradas.
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-extrabold text-lg text-amber-900">
                        {req.mascota.nombre} ({req.mascota.especie})
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          req.estado === "aprobada"
                            ? "bg-emerald-100 text-emerald-700"
                            : req.estado === "rechazada"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {req.estado}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      Solicitante: {req.usuario.nombre} ({req.usuario.email})
                    </p>
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-xl break-all">
                      “{req.motivo}”
                    </p>
                  </div>

                  {req.estado === "pendiente" && req.mascota.estado !== "adoptado" && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          setApproveError("");
                          setApprovingReq(req);
                          setMensajeAprobacion(
                            `Puedes pasar a recoger a ${req.mascota.nombre} este sábado a partir de las 11:00 AM en nuestra sucursal principal con tu identificación oficial.`
                          );
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 text-amber-950 font-bold rounded-xl hover:bg-amber-500 transition text-sm whitespace-nowrap"
                      >
                        Aprobar y notificar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Formulario alta de mascota */}
          <form
            onSubmit={handleCreateAdoption}
            className="bg-amber-50 rounded-3xl p-6 border border-amber-200 space-y-4 h-fit"
          >
            <h2 className="text-xl font-bold text-amber-950">Registrar Mascota en Adopción</h2>
            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Nombre</label>
              <input
                type="text"
                required
                value={petNombre}
                onChange={(e) => setPetNombre(e.target.value)}
                className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Especie</label>
                <select
                  value={petEspecie}
                  onChange={(e) => setPetEspecie(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white text-gray-900"
                >
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Conejo">Conejo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Edad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 8 meses"
                  value={petEdad}
                  onChange={(e) => setPetEdad(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Raza</label>
              <input
                type="text"
                placeholder="Mestizo"
                value={petRaza}
                onChange={(e) => setPetRaza(e.target.value)}
                className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase mb-1">URL de Fotografía</label>
              <input
                type="url"
                required
                value={petFoto}
                onChange={(e) => setPetFoto(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Historia y cuidados</label>
              <textarea
                required
                rows={3}
                value={petDesc}
                onChange={(e) => setPetDesc(e.target.value)}
                className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white text-gray-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-400 text-amber-950 font-bold rounded-xl hover:bg-amber-500 transition"
            >
              Publicar en adopciones
            </button>
          </form>
        </div>
      )}

      {/* Modal de Aprobación de Adopción */}
      {approvingReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleApproveAdoption}
            className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-4"
          >
            <h3 className="text-2xl font-extrabold text-gray-900">
              Aprobar adopción de {approvingReq.mascota.nombre}
            </h3>
            <p className="text-sm text-gray-600">
              Adoptante: <strong>{approvingReq.usuario.nombre}</strong>. Al confirmar, la mascota se ocultará de la tienda y se enviará este mensaje a su perfil.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Modalidad de entrega
              </label>
              <select
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value as "sucursal" | "domicilio")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900"
              >
                <option value="sucursal">Recoger en sucursal</option>
                <option value="domicilio">Envío / entrega a domicilio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Mensaje y fecha acordada para el usuario
              </label>
              <textarea
                required
                rows={4}
                value={mensajeAprobacion}
                onChange={(e) => setMensajeAprobacion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900"
              />
            </div>

            {approveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl">
                {approveError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={aprobando}
                onClick={() => setApprovingReq(null)}
                className="w-1/2 py-3 border border-gray-200 rounded-xl font-bold text-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={aprobando}
                className="w-1/2 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                {aprobando ? "Aprobando..." : "Confirmar aprobación"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: AGENDA DE CITAS SEMANALES E HISTORIAL             */}
      {/* ======================================================== */}
      {tab === "citas" && (
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Citas de esta Semana</h2>
            {citasSemana.length === 0 ? (
              <p className="text-sm text-gray-500">No hay citas programadas para esta semana.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {citasSemana.map((cita) => (
                  <div
                    key={cita.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <span
                        className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          cita.tipo === "veterinaria"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {cita.servicio}
                      </span>
                      <p className="font-bold text-gray-900 mt-1">
                        Mascota: {cita.nombre_mascota} • Cliente: {cita.cliente.nombre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(cita.fecha_hora).toLocaleString("es-MX", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                          cita.estado === "confirmada"
                            ? "bg-emerald-100 text-emerald-700"
                            : cita.estado === "cancelada"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cita.estado}
                      </span>
                      {cita.estado !== "confirmada" && cita.estado !== "cancelada" && (
                        <button
                          onClick={() => openConfirmModal(cita)}
                          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
                        >
                          Confirmar cita
                        </button>
                      )}
                      {cita.estado !== "cancelada" && (
                        <button
                          onClick={() => openCancelModal(cita)}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-100 transition"
                        >
                          Cancelar cita
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial y Próximas Citas</h2>
            {citasHistorial.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay citas en el historial.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {citasHistorial.map((cita) => (
                  <div
                    key={cita.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-bold text-gray-800">
                        {cita.servicio} — {cita.nombre_mascota} ({cita.cliente.nombre})
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(cita.fecha_hora).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          cita.estado === "confirmada"
                            ? "bg-emerald-100 text-emerald-700"
                            : cita.estado === "cancelada"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {cita.estado}
                      </span>
                      {cita.estado === "agendada" && (
                        <>
                          <button
                            onClick={() => openConfirmModal(cita)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => openCancelModal(cita)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modal de Confirmación o Cancelación de Cita */}
      {appointmentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAppointmentModalSubmit}
            className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full ${
                  appointmentModal.accion === "confirm"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {appointmentModal.accion === "confirm" ? "Confirmación de cita" : "Cancelación de cita"}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900">
              {appointmentModal.accion === "confirm"
                ? `Confirmar cita de ${appointmentModal.cita.nombre_mascota}`
                : `Cancelar cita de ${appointmentModal.cita.nombre_mascota}`}
            </h3>

            <div className="bg-gray-50 p-3.5 rounded-2xl text-sm text-gray-700 space-y-1 border border-gray-100">
              <p>
                <strong>Cliente:</strong> {appointmentModal.cita.cliente.nombre} ({appointmentModal.cita.cliente.email})
              </p>
              <p>
                <strong>Servicio:</strong> {appointmentModal.cita.servicio}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(appointmentModal.cita.fecha_hora).toLocaleString("es-MX", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {appointmentModal.accion === "confirm"
                  ? "Mensaje de confirmación para el cliente"
                  : "Motivo de cancelación para el cliente"}
              </label>
              <textarea
                required
                rows={4}
                value={mensajeCita}
                onChange={(e) => setMensajeCita(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={enviandoCita}
                onClick={() => setAppointmentModal(null)}
                className="w-1/2 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={enviandoCita}
                className={`w-1/2 py-3 text-white rounded-xl font-bold transition disabled:opacity-50 ${
                  appointmentModal.accion === "confirm"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {enviandoCita
                  ? "Enviando..."
                  : appointmentModal.accion === "confirm"
                  ? "Confirmar y notificar"
                  : "Cancelar y notificar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: EDITAR PRODUCTOS Y MASCOTAS PUBLICADAS            */}
      {/* ======================================================== */}
      {tab === "editar" && (
        <div className="space-y-10">
          {/* BLOQUE 1: EDITAR PRODUCTOS */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
              <h2 className="text-xl font-bold text-gray-900">1. Selecciona un Producto</h2>
              <p className="text-xs text-gray-500">
                Haz clic en un producto para modificar su precio, marca, categoría, imagen o especificaciones.
              </p>

              <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto pr-1">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectProductToEdit(prod)}
                    className={`w-full text-left py-3 px-3 rounded-2xl transition flex items-center gap-3 ${
                      editingProductId === prod.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <img
                      src={prod.imagen_url}
                      alt={prod.nombre}
                      className="w-12 h-12 object-contain bg-gray-50 rounded-xl p-1 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-gray-900 truncate">{prod.nombre}</p>
                      <p className="text-xs text-gray-500">
                        ${prod.precio.toFixed(2)} • {prod.categoria}
                        {prod.marca ? ` • ${prod.marca}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              {!editingProductId ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                  Selecciona un producto de la lista izquierda para editar sus datos.
                </div>
              ) : (
                <form onSubmit={handleSaveEditedProduct} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-xl font-bold text-gray-900">Editando Producto</h3>
                    <span className="text-xs font-mono text-gray-400">{editingProductId}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editProdNombre}
                      onChange={(e) => setEditProdNombre(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editProdPrecio}
                        onChange={(e) => setEditProdPrecio(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Stock</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={editProdStock}
                        onChange={(e) => setEditProdStock(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Categoría</label>
                      <select
                        value={editProdCatId}
                        onChange={(e) => setEditProdCatId(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Marca</label>
                      <select
                        value={editProdBrandId}
                        onChange={(e) => setEditProdBrandId(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-white"
                      >
                        <option value="">Sin marca</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">URL de Imagen</label>
                    <input
                      type="url"
                      required
                      value={editProdImg}
                      onChange={(e) => setEditProdImg(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descripción</label>
                    <textarea
                      rows={3}
                      value={editProdDesc}
                      onChange={(e) => setEditProdDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>

                  {/* Especificaciones editables */}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-600 uppercase">
                        Especificaciones (Peso, Sabor, Talla, etc.)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddEditAtributo}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        + Agregar campo
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editAtributosList.map((attr, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={attr.clave}
                            onChange={(e) => handleEditAtributoChange(idx, "clave", e.target.value)}
                            placeholder="Clave (ej. peso)"
                            className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-xs"
                          />
                          <input
                            type="text"
                            value={attr.valor}
                            onChange={(e) => handleEditAtributoChange(idx, "valor", e.target.value)}
                            placeholder="Valor (ej. 15 kg)"
                            className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveEditAtributo(idx)}
                            className="px-2 py-1 text-gray-400 hover:text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={guardandoEditProd}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {guardandoEditProd ? "Guardando cambios..." : "Guardar cambios del producto"}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* BLOQUE 2: EDITAR MASCOTAS EN ADOPCIÓN */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 space-y-3">
              <h2 className="text-xl font-bold text-amber-950">2. Selecciona una Mascota</h2>
              <p className="text-xs text-amber-800">
                Edita la historia, fotografía, edad o estado de publicación de cualquier animal registrado.
              </p>

              <div className="divide-y divide-amber-200/60 max-h-[520px] overflow-y-auto pr-1">
                {adoptionsList.map((pet) => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => handleSelectAdoptionToEdit(pet)}
                    className={`w-full text-left py-3 px-3 rounded-2xl transition flex items-center justify-between gap-3 ${
                      editingAdoptionId === pet.id
                        ? "bg-amber-200/70 border border-amber-400"
                        : "hover:bg-amber-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={pet.fotos?.[0] || "https://placehold.co/100x100?text=Mascota"}
                        alt={pet.nombre}
                        className="w-12 h-12 object-cover rounded-xl flex-shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-amber-950 truncate">{pet.nombre}</p>
                        <p className="text-xs text-amber-800">
                          {pet.especie} • {pet.edad}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                        pet.estado === "disponible"
                          ? "bg-emerald-100 text-emerald-800"
                          : pet.estado === "adoptado"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-200 text-amber-900"
                      }`}
                    >
                      {pet.estado}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              {editingAdoptionId === null ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                  Selecciona una mascota de la lista izquierda para editar su ficha.
                </div>
              ) : (
                <form onSubmit={handleSaveEditedAdoption} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-xl font-bold text-gray-900">Editando Ficha de Adopción</h3>
                    <span className="text-xs font-mono text-gray-400">ID #{editingAdoptionId}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={editPetNombre}
                        onChange={(e) => setEditPetNombre(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Estado</label>
                      <select
                        value={editPetEstado}
                        onChange={(e) => setEditPetEstado(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-white"
                      >
                        <option value="disponible">Disponible (Visible en tienda)</option>
                        <option value="en_proceso">En proceso</option>
                        <option value="adoptado">Adoptado (Oculto en tienda)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Especie</label>
                      <select
                        value={editPetEspecie}
                        onChange={(e) => setEditPetEspecie(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-white"
                      >
                        <option value="Perro">Perro</option>
                        <option value="Gato">Gato</option>
                        <option value="Conejo">Conejo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Raza</label>
                      <input
                        type="text"
                        value={editPetRaza}
                        onChange={(e) => setEditPetRaza(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Edad</label>
                      <input
                        type="text"
                        required
                        value={editPetEdad}
                        onChange={(e) => setEditPetEdad(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">URL de Fotografía</label>
                    <input
                      type="url"
                      required
                      value={editPetFoto}
                      onChange={(e) => setEditPetFoto(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Historia y cuidados</label>
                    <textarea
                      required
                      rows={3}
                      value={editPetDesc}
                      onChange={(e) => setEditPetDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={guardandoEditPet}
                    className="w-full py-3 bg-amber-400 text-amber-950 font-bold rounded-xl hover:bg-amber-500 transition disabled:opacity-50"
                  >
                    {guardandoEditPet ? "Guardando cambios..." : "Guardar cambios de la mascota"}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}