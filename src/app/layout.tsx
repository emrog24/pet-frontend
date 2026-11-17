import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Importamos tu Navbar
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PetMarket | E-commerce",
  description: "Todo para tu mascota: tienda, servicios y adopciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ¡Aquí están las etiquetas que faltaban!
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        
        {/* Tu Navbar global */}
        <Navbar />

        {/* El contenido de tus páginas (como el Login) */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

      </body>
    </html>
  );
}