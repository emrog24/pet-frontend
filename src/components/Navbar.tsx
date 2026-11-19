"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  const firstName = user?.nombre.split(" ")[0];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              PetMarket
            </Link>
          </div>

          {/* Menú de Escritorio */}
          <div className="hidden md:flex space-x-8">
            <Link href="/categorias/todas" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Tienda
            </Link>
            <Link href="/servicios" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Servicios
            </Link>
            <Link href="/adopciones" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Adopciones
            </Link>
          </div>

          {/* Acciones de Escritorio */}
          <div className="hidden md:flex items-center space-x-5">
            {isMounted && user ? (
              <>
                {user.rol === "admin" && (
                  <Link
                    href="/admin"
                    className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-700 transition shadow-sm"
                  >
                    Panel Admin
                  </Link>
                )}
                <Link
                  href="/perfil"
                  className="text-gray-700 hover:text-blue-600 font-semibold transition"
                >
                  Hola, {firstName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">
                Iniciar sesión
              </Link>
            )}

            <Link href="/carrito" className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition">
              <span>Carrito</span>
              <span className="ml-1.5 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {isMounted ? totalItems : 0}
              </span>
            </Link>
          </div>

          {/* Controles Móviles */}
          <div className="flex items-center md:hidden space-x-4">
            <Link href="/carrito" className="flex items-center text-gray-600 hover:text-blue-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <span className="ml-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {isMounted ? totalItems : 0}
              </span>
            </Link>

            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-blue-600 focus:outline-none">
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/categorias/todas" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              Tienda
            </Link>
            <Link href="/servicios" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              Servicios
            </Link>
            <Link href="/adopciones" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              Adopciones
            </Link>

            {isMounted && user ? (
              <>
                {user.rol === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-bold text-slate-900 bg-slate-100 hover:bg-slate-200"
                  >
                    Panel Admin
                  </Link>
                )}
                <Link href="/perfil" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-semibold text-blue-600 hover:bg-gray-50">
                  Mi Perfil ({firstName})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}