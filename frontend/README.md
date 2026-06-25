# Cine Reservas - Frontend Client

El cliente web del sistema Cine Reservas, desarrollado sobre **React, Vite y TypeScript**, utilizando CSS nativo para lograr una interfaz moderna y fluida sin dependencias de frameworks CSS externos.

## 🎨 Principios de Diseño y Estética
* **Tema Oscuro Premium:** Paleta de colores basada en tonalidades oscuras armoniosas, gradients y acentos violeta/rosa neón para una experiencia de usuario inmersiva.
* **Glassmorphism:** Tarjetas y contenedores con fondos translúcidos, desenfoque de fondo y bordes sutiles.
* **Mapa de Asientos Interactivo:** Representación interactiva de la sala del cine que muestra butacas en estados:
  * `Disponible` (interactiva y seleccionable).
  * `Seleccionada` (estado actual con color de acento).
  * `Reservada` (deshabilitada y tachada).
* **Navegación Dinámica:** Navbar que responde al estado de la sesión, mostrando las opciones protegidas y el email del usuario logueado en tiempo real.
* **Diseño Responsivo:** Adaptabilidad completa para dispositivos móviles y escritorio usando Media Queries y grids de CSS.

---

## 📂 Estructura de Directorios

La estructura bajo la carpeta `src/` se organiza de la siguiente manera:

* **`api/`:** Cliente HTTP para la comunicación con la API. Agrupa los métodos para llamadas a películas, funciones y reservas.
* **`pages/`:** Vistas principales de la aplicación:
  * `Movies.tsx`: Cartelera principal con buscador y filtros por género.
  * `MovieDetails.tsx`: Detalle de película y horarios de funciones futuras.
  * `SeatsSelection.tsx`: Grilla interactiva de selección de asientos y cálculo de total.
  * `Login.tsx`: Formularios unificados de inicio de sesión y registro.
  * `MyReservations.tsx`: Historial de compras y reservas del usuario.
  * `ReservationDetail.tsx`: Detalle y desglose de una reserva confirmada.
* **`types/`:** Tipados estricto de datos que reflejan el modelo de la API.
* **`index.css`:** Sistema de diseño centralizado con variables personalizadas (`--accent`, `--bg`, etc.) y estilos globales.

---

## 🚀 Comandos del Proyecto

Todos los comandos listados a continuación deben ser ejecutados en la carpeta `frontend/`:

### Instalación de dependencias
```bash
npm install
```

### Ejecutar Servidor de Desarrollo
```bash
npm run dev
```
*El servidor arrancará por defecto en `http://localhost:5173`. Las llamadas a `/api` se redirigen por proxy automático hacia el backend (`http://localhost:3000`) según se especifica en `vite.config.ts`.*

### Construcción para Producción
```bash
npm run build
```

### Testing y Calidad de Código
```bash
# Ejecutar pruebas unitarias de enrutamiento y componentes (Vitest)
npm run test

# Ejecutar el linter para validación estática rápida (Oxlint)
npm run lint
```
