---
type: roadmap
id: roadmap
status: draft
generated_by: roadmap-agent
knowledge_level: K3
---

# Roadmap

Generated with Kaddo Roadmap Agent. Initiatives and work items below are **candidates** for
human review — not final commitments.

## Summary

Este roadmap establece la secuencia de desarrollo para el MVP de Cine Reservas, estructurando el trabajo desde la base del monorepositorio y la autenticación, pasando por la administración de catálogos (películas y salas) y programación (funciones), hasta llegar a la experiencia pública (cartelera) y protegida (reservas de asientos con control transaccional).

## Assumptions

* El desarrollo se realiza sobre una arquitectura monorepo de NestJS + React.
* Se asume la existencia de un único administrador pre-creado vía semilla de base de datos.
* El reloj del servidor es el validador exclusivo del tiempo en funciones y reservas.

## Roadmap Principles

* **Integridad primero:** Completar la lógica de negocio y las restricciones del backend antes de los flujos del frontend.
* **Integridad atómica:** Asegurar transaccionalidad robusta en base de datos para la generación de asientos y las reservas concurrentes.

## Initiatives

### RM-001: Base y Autenticación

**Goal:** Establecer la infraestructura del monorepositorio y la autenticación JWT para dar soporte a los diferentes roles (`CLIENT` y `ADMIN`).

**Related capabilities:**
- Autenticación y Roles

**Project area / domain:** Seguridad e Infraestructura

**Impact:** High

**Risk:** Low

**Suggested Knowledge Level:** K3

**Dependencies:** None

**Why this comes now:** Es la base técnica del proyecto; todas las capacidades posteriores dependen del sistema de roles y la estructura monorepo.

**Candidate Work Items:**

- WI-001: Inicializar la estructura del monorepositorio
  - type: chore
  - suggested knowledge level: K2
  - expected value: Directorios backend/ y frontend/ configurados con TypeScript, NestJS, React, y herramientas de testing (Jest y Vitest).
  - notes: Configurar el archivo .gitignore y la arquitectura del monorepositorio.

- WI-002: Implementar módulo de autenticación
  - type: feature
  - suggested knowledge level: K3
  - expected value: Registro de clientes, inicio de sesión y endpoints protegidos con roles de usuario en base a JWT.
  - notes: Implementar endpoints /auth/register, /auth/login y /auth/me.

- WI-003: Crear seed y configuración de base de datos
  - type: chore
  - suggested knowledge level: K2
  - expected value: Base de datos PostgreSQL inicializada con migraciones de TypeORM y usuario ADMIN pre-cargado.
  - notes: Crear script de seed para base de datos local y entorno de demo.

**Open questions:** None

---

### RM-002: Catálogo de Películas y Salas

**Goal:** Implementar las capacidades de administración del catálogo físico y de contenido del cine.

**Related capabilities:**
- Administración (ADMIN)
- Gestión de Películas
- Gestión de Salas

**Project area / domain:** Administración del Cine

**Impact:** Medium

**Risk:** Medium

**Suggested Knowledge Level:** K3

**Dependencies:** RM-001

**Why this comes now:** Las funciones de cartelera y reserva necesitan tener salas físicas y películas en el catálogo para ser asociadas.

**Candidate Work Items:**

- WI-004: Implementar CRUD de películas y carga de pósteres
  - type: feature
  - suggested knowledge level: K3
  - expected value: CRUD completo de películas bajo /admin/movies y carga multipart del póster.
  - notes: Implementar validación de cambio de duración y bloqueo de eliminación si tiene funciones asociadas.

- WI-005: Implementar CRUD de salas y generación de asientos
  - type: feature
  - suggested knowledge level: K3
  - expected value: CRUD de salas bajo /admin/rooms con generación atómica automática de asientos (capacidad = filas * columnas).
  - notes: Impedir cambios en filas/columnas y eliminación si la sala cuenta con funciones programadas.

**Open questions:** None

---

### RM-003: Programación de Funciones

**Goal:** Desarrollar la programación de las funciones en las salas y prevenir los solapamientos temporales de horarios.

**Related capabilities:**
- Programación de Funciones
- Regla de solapamiento

**Project area / domain:** Programación horaria

**Impact:** High

**Risk:** High

**Suggested Knowledge Level:** K4

**Dependencies:** RM-002

**Why this comes now:** Las funciones vinculan las películas y las salas, constituyendo el núcleo temporal de las reservas posteriores.

**Candidate Work Items:**

- WI-006: Implementar CRUD de funciones y prevención de solapamientos
  - type: feature
  - suggested knowledge level: K4
  - expected value: Programación de funciones bajo /admin/showtimes con cálculo automático de endsAt y prevención estricta de solapamientos en la sala.
  - notes: Aplicar la regla de solapamiento en intervalos semiabiertos [startsAt, endsAt) a nivel backend y bloquear modificaciones de funciones pasadas o con reservas.

**Open questions:** None

---

### RM-004: Cartelera Pública y Detalle

**Goal:** Implementar el acceso público para visitantes, permitiéndoles consultar qué películas y funciones hay disponibles.

**Related capabilities:**
- Descubrimiento y Cartelera

**Project area / domain:** Portal de Clientes (Público)

**Impact:** Medium

**Risk:** Low

**Suggested Knowledge Level:** K2

**Dependencies:** RM-003

**Why this comes now:** Permite a los usuarios finales descubrir el contenido antes de ingresar a los flujos autenticados de reserva.

**Candidate Work Items:**

- WI-007: Implementar listado de cartelera pública con filtros
  - type: feature
  - suggested knowledge level: K2
  - expected value: Vista pública /movies con buscador por título (búsqueda parcial) y filtros exactos por género.
  - notes: Excluir de la cartelera aquellas películas que no posean funciones futuras programadas.

- WI-008: Implementar detalle de película y horarios de funciones
  - type: feature
  - suggested knowledge level: K2
  - expected value: Vista de detalle /movies/:movieId que muestra la sinopsis, póster, y listado de funciones futuras asociadas a la película.
  - notes: Asegurar que solo se devuelvan funciones futuras.

**Open questions:** None

---

### RM-005: Selección de Asientos y Reservas

**Goal:** Desarrollar la visualización del mapa gráfico de butacas y el sistema de reservas atómicas libres de conflictos.

**Related capabilities:**
- Mapa de Asientos e Historial de Reservas
- Reserva atómica
- Unicidad de asiento por función

**Project area / domain:** Transacciones y Flujo de Clientes

**Impact:** High

**Risk:** High

**Suggested Knowledge Level:** K4

**Dependencies:** RM-004

**Why this comes now:** Es la capacidad cumbre del negocio. Requiere que todo el catálogo, la programación y las vistas públicas funcionen correctamente.

**Candidate Work Items:**

- WI-009: Implementar visualización gráfica del mapa de asientos
  - type: feature
  - suggested knowledge level: K3
  - expected value: Vista interactiva /showtimes/:showtimeId/seats que presenta el mapa de asientos en estados AVAILABLE o RESERVED.
  - notes: Los asientos RESERVED deben mostrarse deshabilitados.

- WI-010: Implementar confirmación transaccional de reservas
  - type: feature
  - suggested knowledge level: K4
  - expected value: Endpoint /reservations para reservar de 1 a 20 asientos de forma atómica y transaccional, previniendo carreras de solicitudes concurrentes.
  - notes: Proteger la doble reserva mediante restricción de unicidad UNIQUE(showtime_id, seat_id).

- WI-011: Implementar historial y detalle de reservas propias del cliente
  - type: feature
  - suggested knowledge level: K2
  - expected value: Vistas /my-reservations y /my-reservations/:reservationId para consultar el historial y los detalles de las reservas confirmadas del usuario.
  - notes: Validar rigurosamente que el usuario autenticado sea el propietario de la reserva (devolver 404 si es ajena).

**Open questions:** None

---

## Suggested Execution Order

1. **RM-001 (Base y Autenticación):** WI-001 -> WI-003 -> WI-002
2. **RM-002 (Catálogo):** WI-004 -> WI-005
3. **RM-003 (Programación):** WI-006
4. **RM-004 (Cartelera):** WI-007 -> WI-008
5. **RM-005 (Reservas):** WI-009 -> WI-010 -> WI-011

## Risks and Constraints

* **Concurrencia en Reservas:** El mayor riesgo técnico es el solapamiento en carrera de reservas simultáneas. Se mitiga mediante transacciones robustas y restricciones explícitas de unicidad a nivel base de datos.
* **Solapamiento Horario:** La lógica de solapamiento horaria de las funciones debe estar perfectamente validada en el backend para evitar estados corruptos en las salas.

## Not Now

* Cancelación de reservas o de funciones (planificado como extensión futura).
* Integración con pasarelas de pago y facturación.
* Emisión de entradas con código QR.

## Next Recommended Work Item

* **WI-001: Inicializar la estructura del monorepositorio**
