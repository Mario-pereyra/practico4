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
  * `Login.tsx`: Formulario de inicio de sesión con redirección automática para administradores.
  * `Register.tsx`: Formulario de registro de nuevos clientes (`CLIENT`).
  * `Admin.tsx`: Panel administrativo de operaciones CRUD para películas (con carga de pósteres), salas y funciones (protegido para `ADMIN`).
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
*El servidor arrancará por defecto en `http://localhost:5173`. Las llamadas a `/api` y `/uploads` se redirigen por proxy automático hacia el backend (`http://localhost:3000`) según se especifica en `vite.config.ts`.*

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

---

## ✅ Ajustes incluidos en la versión corregida

Esta versión mantiene la misma arquitectura React + Vite + TypeScript, sin agregar dependencias nuevas, pero mejora la presentación visual y la compatibilidad general:

* Rediseño visual profesional con tema oscuro cinematográfico, tarjetas más limpias, botones consistentes y mejor jerarquía visual.
* Navbar responsivo con estados activos, usuario logueado visible y manejo seguro del usuario guardado en `localStorage`.
* Estilos móviles mejorados para cartelera, detalle de película, mapa de asientos, formularios y tablas administrativas.
* Botón secundario (`btn-secondary`) definido correctamente, porque ya se usaba en varias pantallas pero no tenía estilo base.
* Configuración centralizada de API en `src/api/config.ts` usando `VITE_API_BASE_URL` o `/api/v1` por defecto.
* Panel Admin corregido para cumplir reglas de hooks de React y pasar lint sin errores.
* Validado con:

```bash
npm run lint
npm run build
npm test
```

Para desarrollo local normal no necesitas definir variables extra. Si quieres apuntar a otro backend puedes crear un `.env` en `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

En Docker/Nginx se conserva el comportamiento compatible con `/api/v1` mediante proxy.
