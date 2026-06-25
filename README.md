# Cine Reservas - Monorepo

Sistema web completo para la reserva de entradas de cine, programado como un monorepositorio de Node.js estructurado en un backend con **NestJS** y un frontend con **React, Vite y TypeScript**.

## 🚀 Arquitectura y Tecnologías
* **Backend:** [NestJS](https://nestjs.com/) (v11) + [TypeORM](https://typeorm.io/) con PostgreSQL.
* **Frontend:** [React](https://react.dev/) (v19) + [Vite](https://vite.dev/) + TypeScript + CSS nativo (sin frameworks de utilidad CSS para diseño a medida).
* **Base de Datos:** PostgreSQL (v15) corriendo en contenedor Docker.
* **Control de Concurrencia:** Integridad transaccional a nivel base de datos para evitar la doble reserva de asientos en solicitudes concurrentes.
* **Gestión del Repositorio:** [Kaddo CLI](https://github.com/kaddo-dev) para control del ciclo de vida y bitácora del conocimiento del desarrollo.

---

## 📋 Requisitos Previos
* **Node.js** (versión 18 o superior recomendada)
* **npm** (gestor de paquetes de Node)
* **Docker y Docker Compose** (para levantar la base de datos PostgreSQL)

---

## ⚡ Guía de Inicio Rápido

Sigue estos sencillos pasos para tener todo el entorno corriendo en pocos minutos:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Mario-pereyra/practico4.git
cd practico4
```

### 2. Configurar Variables de Entorno
Copia el archivo de plantilla `.env` en la carpeta del backend:
```bash
cp backend/example.env backend/.env
```
*(Nota: En Windows/PowerShell puedes usar: `copy backend/example.env backend/.env`)*. El archivo `.env` por defecto viene preconfigurado para apuntar a la base de datos de Docker en el puerto `5433`.

### 3. Levantar Base de Datos e Inicializar el Proyecto
Desde la **raíz del proyecto**, instala las herramientas y realiza la inicialización completa:
```bash
# Instala concurrently y utilidades de la raíz
npm install

# Levanta la base de datos, ejecuta migraciones y la semilla de administrador
npm run setup
```

### 4. Iniciar Servidores de Desarrollo
Arranca el backend y el frontend concurrentemente con un solo comando:
```bash
npm start
```
* **Frontend:** Disponible en `http://localhost:5173`
* **Backend API:** Disponible en `http://localhost:3000`

## 🐳 Método Alternativo: Inicialización Completa con Docker Compose (Recomendado)

Si prefieres no instalar Node.js o dependencias locales en tu máquina, puedes levantar **toda la aplicación** (base de datos, backend y frontend) con un único comando de Docker:

```bash
docker-compose up --build
```

Este comando automatiza el siguiente flujo:
1. Construye las imágenes Docker del Backend y Frontend.
2. Inicia el contenedor de base de datos PostgreSQL.
3. Espera a que la base de datos acepte conexiones de red, ejecuta las migraciones de TypeORM y la semilla del usuario administrador de forma automática.
4. Arranca el Backend y el Frontend (este último servido por Nginx en producción y proxificado al backend).

* **Frontend (Nginx):** Disponible en `http://localhost:8080` (puerto 8080)
* **Backend API:** Disponible en `http://localhost:3000`

---


## 🔐 Credenciales del Sistema

Una vez levantada la aplicación, puedes ingresar con la cuenta de administrador semilla:
* **Usuario (Admin):** `admin@cinema.com`
* **Contraseña:** `admin123`

Si quieres probar el flujo de clientes, haz clic en **"Registrarse"** en la barra de navegación para crear una nueva cuenta de cliente. Para probar las funciones administrativas, inicia sesión como Administrador y haz clic en **"Panel Admin"** en la Navbar.

---

## 📂 Estructura del Proyecto
* `/backend`: Aplicación NestJS (API Rest).
* `/frontend`: Aplicación React + Vite (SPA cliente).
* `/scripts`: Scripts de ayuda (ej. `wait-for-db.js` para sincronización de arranque).
* `/knowledge`: Documentación del ciclo de vida de desarrollo de Kaddo.

---

## 🧪 Ejecución de Pruebas
Puedes correr las suites de pruebas automatizadas desde la raíz del monorepositorio:

* **Pruebas de Backend (Unitarias y E2E):**
  ```bash
  npm run test:backend
  ```
* **Pruebas de Frontend (Unitarias con Vitest):**
  ```bash
  npm run test:frontend
  ```
