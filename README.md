# PetMarket — Frontend Web

Aplicación web de comercio electrónico, reserva de servicios veterinarios/grooming y adopciones de mascotas para **PetMarket**, desarrollada con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** y **Zustand**.

---

## Tecnologías y Herramientas Utilizadas

* **Framework:** Next.js 16 (App Router) + React 19
* **Lenguaje:** TypeScript
* **Estilos y Animaciones:** Tailwind CSS v4 + animaciones CSS personalizadas
* **Estado Global:** Zustand (con persistencia en `localStorage` para sesión JWT y carrito de compras)
* **Comunicación HTTP:** Fetch API nativa conectada al backend en FastAPI

---

## Prerrequisitos (Qué necesitas descargar)

Para ejecutar el frontend en local necesitas:
1. **Git** (para clonar el repositorio).
2. **Node.js v20 LTS o superior** y **npm** (incluido con Node.js).
3. **El servidor `pet-backend` corriendo** en `http://localhost:8000` y con los datos iniciales cargados (`POST /seed`).

---

## Cómo verificar si ya tienes las herramientas instaladas

Abre una terminal y ejecuta:

```bash
git --version
node -v
npm -v
```

* Asegúrate de que `node -v` muestre **`v20.x.x` o superior**.
* Si alguno de los comandos no se reconoce, sigue los pasos de instalación.

---

## Cómo descargar e instalar los prerrequisitos

### En Ubuntu / Debian
1. Instala **Git** y **curl**:
   ```bash
   sudo apt update
   sudo apt install -y git curl
   ```

2. Instala **Node.js 20 LTS** (incluye `npm`):
   ```bash
   curl -fsSL [https://deb.nodesource.com/setup_20.x](https://deb.nodesource.com/setup_20.x) | sudo -E bash -
   sudo apt install -y nodejs
   ```

### En Windows o macOS
* **Git:** Descárgalo desde [git-scm.com](https://git-scm.com/).
* **Node.js LTS:** Descarga el instalador LTS desde [nodejs.org](https://nodejs.org/).

---

## Cómo correr el proyecto

### 1. Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO_FRONTEND>
cd pet-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea tu archivo `.env.local` a partir de `.env.example`:
```bash
cp .env.example .env.local
```

Verifica que apunte a la URL donde corre tu backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre **`http://localhost:3000`** en tu navegador. *(Recuerda tener encendido `pet-backend` y haber ejecutado `POST /seed` para visualizar los productos, servicios y adopciones).*

---

## Rutas Principales de la Aplicación

* `/` — Página de inicio con banner animado, categorías rápidas y productos destacados.
* `/categorias/todas` — Tienda completa con filtros dinámicos (`Perros`, `Gatos`, `Farmacia`) e identidad visual por marca.
* `/producto/[id]` — Ficha técnica del producto, atributos dinámicos y guardado en favoritos.
* `/servicios` — Reserva de citas para Grooming, Consultas Veterinarias y Adiestramiento.
* `/adopciones` — Catálogo de mascotas disponibles y envío de solicitudes de adopción.
* `/carrito` — Carrito de compras persistente con ajuste de cantidades, selección de dirección de envío y checkout.
* `/perfil` y `/perfil/historial` — Administración de direcciones, productos favoritos, métodos de pago e historial de órdenes.
* `/login` y `/registro` — Inicio de sesión y registro de usuarios con autenticación JWT.
