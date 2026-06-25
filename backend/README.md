# Cine Reservas - Backend API

Esta es la API RESTful del sistema Cine Reservas, desarrollada sobre el framework **NestJS** y con persistencia a base de datos **PostgreSQL** mediante **TypeORM**.

## 🛠️ Tecnologías Utilizadas
* **NestJS** (v11) con TypeScript.
* **TypeORM** (v0.3+) para mapeo objeto-relacional.
* **PostgreSQL** (v15) como motor de base de datos relacional.
* **Passport.js & JWT** para el sistema de autenticación y protección de rutas.
* **Class-validator & Class-transformer** para validación declarativa de datos de entrada.

---

## 📂 Estructura de Directorios

El backend está estructurado en módulos autocontenidos bajo la carpeta `src/`:

* **`auth/`:** Lógica de registro, login y estrategias de autenticación (JWT & Local) junto con los guards de roles (`ADMIN` y `CLIENT`).
* **`users/`:** Entidad y servicio de usuarios.
* **`movies/`:** Gestión del catálogo de películas. Incluye carga multipart del póster y lógica de filtros en la cartelera.
* **`rooms/`:** Gestión de salas físicas y autogeneración atómica de butacas (filas x columnas).
* **`showtimes/`:** Programación horaria de las películas en las salas, aplicando la validación de no-solapamiento de horarios en intervalos semiabiertos `[startsAt, endsAt)`.
* **`reservations/`:** Motor transaccional de reservas que bloquea la doble reserva de asientos concurrentes por función (`UNIQUE(showtime_id, seat_id)`).
* **`database/`:** Migraciones históricas de TypeORM y la semilla de inicialización (`seeds/`).

---

## ⚙️ Configuración (Variables de Entorno)

Para levantar el backend, se necesita configurar el archivo `backend/.env`. Puedes tomar como base el archivo `backend/example.env`:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=password123
DB_DATABASE=cine_reservas
JWT_SECRET=super-secret-key-123
PORT=3000
```

---

## 🚀 Comandos del Proyecto

Todos los comandos listados a continuación deben ser ejecutados en la carpeta `backend/`:

### Instalación de dependencias
```bash
npm install
```

### Ejecutar Servidor
```bash
# Desarrollo con recarga automática
npm run start:dev

# Producción
npm run start:prod
```

### Base de Datos y Migraciones
```bash
# Correr todas las migraciones pendientes
npm run migration:run

# Revertir la última migración aplicada
npm run migration:revert

# Correr la semilla de datos (Admin por defecto)
npm run seed:run
```

### Testing
```bash
# Pruebas unitarias
npm run test

# Pruebas E2E (Integración Completa)
npm run test:e2e
```
*Las pruebas E2E validan de principio a fin el flujo de registro, autenticación, programación y confirmación de reservas transaccionales.*
