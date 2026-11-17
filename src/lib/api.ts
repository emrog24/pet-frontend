export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Category {
  id: number;
  nombre: string;
  slug: string;
  parent_id?: number | null;
}

export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen_url: string;
  atributos: Record<string, string | number | boolean>;
  category: Category;
  brand?: { id: number; nombre: string } | null;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  telefono?: string | null;
  rol: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}