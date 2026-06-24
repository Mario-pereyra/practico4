---

type: codebase
status: draft
-------------

> Idioma del proyecto: **español**. Escribe este conocimiento en español. Mantén en inglés el código, los nombres de archivo, los comandos y las claves de configuración.

# Codebase

> Created by `kaddo bootstrap`. The minimal **how** of the project. Refine with the
> codebase-agent. It describes the intended base — it does **not** generate code.

## Repository Structure

Estructura candidata de monorepo para separar frontend, backend y documentación:

```text
cine-reservas/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── movies/
│   │   │   ├── rooms/
│   │   │   ├── showtimes/
│   │   │   ├── reservations/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── uploads/
│   │   ├── package.json
│   │   └── README.md
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   ├── auth/
│       │   ├── movies/
│       │   ├── reservations/
│       │   ├── admin/
│       │   ├── shared/
│       │   └── main.tsx
│       ├── public/
│       ├── package.json
│       └── README.md
├── docs/
│   └── openapi.yaml
├── docker-compose.yml
├── README.md
└── package.json
```

La estructura debe favorecer los módulos del dominio: autenticación, películas, salas, funciones y reservas. No debe organizarse solo por capas técnicas genéricas.

## Candidate Stack

### Backend

* `NestJS`
* `TypeScript`
* `PostgreSQL`
* `TypeORM`
* `JWT Bearer`
* `bcrypt` o equivalente para hash de contraseñas
* `class-validator`
* `class-transformer`
* `multer` para carga local de pósteres
* `Swagger/OpenAPI`

### Frontend

* `React`
* `Vite`
* `TypeScript`
* `React Router`
* `fetch` o cliente HTTP simple
* CSS modular, CSS plano o librería liviana de estilos
* Contexto de autenticación con `AuthContext`

### Tooling

* `Node.js`
* `npm`, `pnpm` o `yarn`
* `Docker Compose` para PostgreSQL
* `ESLint`
* `Prettier`
* `Jest` para pruebas backend
* Pruebas manuales documentadas para el flujo principal

## Quality Attributes

### Seguridad

* Contraseñas almacenadas como hash.
* JWT requerido para rutas protegidas.
* Guards de autenticación y rol en backend.
* Validación de propiedad para reservas.
* No exponer stack traces ni datos sensibles al frontend.
* No registrar contraseñas ni tokens completos.
* Validación de tipo y tamaño de póster.

### Integridad

* La reserva debe ejecutarse en transacción.
* La base de datos debe impedir doble reserva con unicidad por función y asiento.
* Las funciones deben validar que no exista solapamiento en la misma sala.
* Las salas generan asientos de forma transaccional.
* Las eliminaciones deben respetar dependencias históricas.
* El backend debe ser la autoridad de reglas críticas.

### Mantenibilidad

* Monolito modular.
* Servicios con reglas de negocio claras.
* DTOs para entrada y salida.
* Entidades con restricciones explícitas.
* Errores de negocio estables.
* OpenAPI sincronizado con la implementación.
* Nombres técnicos en inglés.
* Documentación suficiente para defensa universitaria.

### Usabilidad

* UI en español.
* Estados `loading`, `empty`, `error` y `success`.
* Formularios con validación visible.
* Mapa de asientos claro.
* Diseño responsive básico.
* Mensajes de error comprensibles.

### Rendimiento suficiente para demo

* Listados paginados.
* Consultas simples y predecibles.
* Pósteres limitados a 5 MB.
* Sala máxima razonable según filas y columnas definidas.
* Sin optimizaciones prematuras.

## Development Standards

* Usar TypeScript en backend y frontend.
* Mantener código, nombres de carpetas, archivos, clases, funciones y variables en inglés.
* Mantener textos de interfaz y documentación de producto en español.
* Separar reglas de negocio en servicios backend.
* No confiar en validaciones solo del frontend.
* Usar DTOs para validar requests.
* Usar migraciones para cambios de base de datos.
* Usar seed para crear el administrador inicial.
* Mantener `openapi.yaml` actualizado.
* Usar errores comunes con `statusCode`, `code`, `message` y opcionalmente `errors`.
* Evitar sobreingeniería: no usar microservicios, CQRS ni event sourcing.
* No agregar funcionalidades fuera de alcance sin actualizar documentación.
* Mantener el flujo principal siempre demostrable.

## Git Strategy

GitHub Flow + Conventional Commits + SemVer (default). See `kaddo add git-strategy`.

Convenciones sugeridas:

* `feat:` para nuevas funcionalidades.
* `fix:` para correcciones.
* `docs:` para documentación.
* `test:` para pruebas.
* `refactor:` para cambios internos sin alterar comportamiento.
* `chore:` para configuración y tareas de mantenimiento.

Ramas sugeridas:

* `main`
* `feat/auth`
* `feat/movies`
* `feat/rooms`
* `feat/showtimes`
* `feat/reservations`
* `feat/admin-ui`
* `fix/reservation-conflict`

## Initial Modules

### Backend modules

* `AuthModule`

  * Registro.
  * Login.
  * Consulta de usuario autenticado.
  * JWT strategy.
  * Guards.

* `UsersModule`

  * Entidad `User`.
  * Roles `CLIENT` y `ADMIN`.
  * Búsqueda por email.
  * Seed de administrador.

* `MoviesModule`

  * CRUD administrativo.
  * Cartelera pública.
  * Detalle de película.
  * Carga de póster.
  * Filtro y búsqueda.

* `RoomsModule`

  * CRUD administrativo de salas.
  * Cálculo de capacidad.
  * Generación de asientos.
  * Consulta de asientos de sala.

* `ShowtimesModule`

  * CRUD administrativo de funciones.
  * Cálculo de `endsAt`.
  * Validación de función futura.
  * Validación de solapamiento.

* `ReservationsModule`

  * Mapa de asientos por función.
  * Confirmación de reserva.
  * Transacción de reserva.
  * Listado de reservas propias.
  * Detalle de reserva propia.

* `CommonModule`

  * Filtros de excepción.
  * Interceptores.
  * Pipes.
  * Helpers de paginación.
  * Códigos de error.

* `ConfigModule`

  * Variables de entorno.
  * Configuración de base de datos.
  * Configuración de JWT.
  * Configuración de uploads.

### Frontend modules

* `auth`

  * Login.
  * Registro.
  * Logout local.
  * `AuthContext`.
  * Rutas protegidas.

* `movies`

  * Cartelera.
  * Búsqueda.
  * Filtro por género.
  * Detalle de película.

* `reservations`

  * Mapa de asientos.
  * Confirmación.
  * Mis reservas.
  * Detalle de reserva.

* `admin`

  * Layout administrativo.
  * CRUD de películas.
  * CRUD de salas.
  * CRUD de funciones.

* `shared`

  * Cliente HTTP.
  * Componentes comunes.
  * Manejo de errores.
  * Formateo de fechas y moneda.
  * Estados de pantalla.

## Assumptions

* El repositorio puede ser monorepo para simplificar la entrega.
* PostgreSQL se levanta localmente con `docker-compose.yml`.
* El backend expone la API bajo `/api/v1`.
* El frontend consume la API desde una variable de entorno.
* Los pósteres se guardan localmente en el backend.
* Las pruebas automatizadas pueden ser mínimas, pero las reglas críticas deben probarse.
* La demo tendrá datos seed suficientes para mostrar el flujo completo.
* El equipo priorizará backend e integridad antes que detalles visuales avanzados.

## Open Questions

* ¿Se usará `npm`, `pnpm` o `yarn` como gestor principal?
* ¿El repositorio será monorepo o dos repositorios separados?
* ¿Se usarán migraciones manuales de TypeORM o generación automática controlada?
* ¿El frontend usará CSS plano, CSS Modules o una librería de componentes?
* ¿Qué credenciales exactas tendrá el usuario `ADMIN` de demo?
* ¿Dónde se documentará el script de carga de datos iniciales?

## Quality checklist

* [x] Structure follows business and product, not a framework default.
* [x] No production code is described here — only the foundation.
