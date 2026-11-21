import { Suspense } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import PeekingPets from "@/components/PeekingPets";
import { API_URL, Product } from "@/lib/api";

async function getProductosDestacados(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Componente separado para que Next.js 16 haga streaming de los productos dentro de <Suspense>
async function ProductosDestacadosGrid() {
  const productos = await getProductosDestacados();

  if (productos.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500">
        No se encontraron productos. Verifica que FastAPI esté corriendo y ejecuta{" "}
        <code>POST /seed</code>.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          id={producto.id}
          nombre={producto.nombre}
          precio={producto.precio}
          categoria={producto.category.nombre}
          imagenUrl={producto.imagen_url}
          marca={producto.brand?.nombre}
          stock={producto.stock}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* 1. HERO BANNER CON MASCOTAS ESCONDIÉNDOSE DETRÁS DEL BORDE SUPERIOR */}
      <div className="relative mt-12">
        {/* Capa trasera (z-10): mascotas detrás del bloque azul */}
        <div
          style={{ position: "absolute", top: "-64px", right: "2.5rem", zIndex: 10 }}
        >
          <PeekingPets />
        </div>

        {/* Capa delantera (z-20): bloque azul sólido que cubre el cuerpo al bajar */}
        <section
          style={{ position: "relative", zIndex: 20 }}
          className="bg-blue-600 rounded-3xl overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-90"></div>
          <div className="relative z-10 px-8 py-20 md:py-32 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Todo lo que tu mejor amigo necesita
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl">
              Desde el alimento más premium hasta servicios veterinarios y un nuevo integrante para tu familia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/categorias/todas"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition shadow-lg"
              >
                Comprar ahora
              </Link>
              <Link
                href="/adopciones"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600 transition"
              >
                Adoptar una mascota
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 2. CATEGORÍAS RÁPIDAS */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Explora por categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link href="/categorias/perros" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 font-bold text-xl group-hover:scale-110 transition-transform">
              P
            </div>
            <h3 className="font-semibold text-gray-800">Perros</h3>
          </Link>

          <Link href="/categorias/gatos" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4 font-bold text-xl group-hover:scale-110 transition-transform">
              G
            </div>
            <h3 className="font-semibold text-gray-800">Gatos</h3>
          </Link>

          <Link href="/categorias/farmacia" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4 font-bold text-xl group-hover:scale-110 transition-transform">
              +
            </div>
            <h3 className="font-semibold text-gray-800">Farmacia</h3>
          </Link>

          <Link href="/servicios" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4 font-bold text-xl group-hover:scale-110 transition-transform">
              S
            </div>
            <h3 className="font-semibold text-gray-800">Servicios</h3>
          </Link>
        </div>
      </section>

      {/* 3. PRODUCTOS DESTACADOS ENVUELTOS EN <Suspense> */}
      <section className="mt-4">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Productos Destacados</h2>
          <Link href="/categorias/todas" className="text-blue-600 hover:underline font-medium">
            Ver todos
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500">
              Cargando productos destacados...
            </div>
          }
        >
          <ProductosDestacadosGrid />
        </Suspense>
      </section>
    </div>
  );
}