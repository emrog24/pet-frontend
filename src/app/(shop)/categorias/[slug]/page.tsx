"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { API_URL, Category, Product } from "@/lib/api";

export default function CategoriaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ? decodeURIComponent(params.slug).toLowerCase() : "todas";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const productsEndpoint =
      slug === "todas" ? `${API_URL}/products` : `${API_URL}/products?categoria=${slug}`;

    Promise.all([
      fetch(`${API_URL}/categories`).then((res) => (res.ok ? res.json() : [])),
      fetch(productsEndpoint).then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([catsData, prodsData]: [Category[], Product[]]) => {
        // Excluimos la categoría padre "animales" para mostrar solo filtros directos
        setCategories(catsData.filter((c) => c.slug !== "animales"));
        setProducts(prodsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const currentCategory = categories.find((c) => c.slug === slug);
  const titulo =
    slug === "todas"
      ? "Toda la Tienda"
      : currentCategory
      ? currentCategory.nombre
      : slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{titulo}</h1>
        <p className="text-gray-500">
          Alimentos, accesorios y farmacia veterinaria disponibles para envío inmediato.
        </p>
      </div>

      {/* Barra de filtros por categoría */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/categorias/todas"
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
            slug === "todas"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
          }`}
        >
          Todos los productos
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${cat.slug}`}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${
              slug === cat.slug
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
            }`}
          >
            {cat.nombre}
          </Link>
        ))}
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Cargando catálogo...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sin productos en esta categoría</h2>
          <p className="text-gray-500 mb-6">Aún no hay artículos registrados bajo "{titulo}".</p>
          <Link
            href="/categorias/todas"
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition"
          >
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((producto) => (
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
      )}
    </div>
  );
}
