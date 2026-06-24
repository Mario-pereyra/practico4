---

type: product
status: draft
-------------

> Idioma del proyecto: **español**. Escribe este conocimiento en español. Mantén en inglés el código, los nombres de archivo, los comandos y las claves de configuración.

# Product

> Created by `kaddo bootstrap`. The minimal **what** of the project. Refine with the
> bootstrap-agent / capability-agent. As this matures it can split into product-brief.md
> and capabilities.md.

## Product Brief

Cine Reservas es una aplicación web académica para gestionar la cartelera y reserva de asientos de una sede de cine.

El producto permite que cualquier visitante consulte películas disponibles, busque por nombre, filtre por género y vea el detalle de una película con sus funciones futuras. Un usuario autenticado puede seleccionar una función, ver un mapa gráfico de asientos, elegir uno o varios asientos, confirmar una reserva y consultar sus reservas realizadas.

El administrador accede a un panel protegido para gestionar películas, salas y funciones. El sistema debe impedir dos errores críticos: reservar dos veces el mismo asiento para una función y crear funciones superpuestas en la misma sala.

El MVP se enfoca en cumplir el práctico universitario con una solución clara, simple y técnicamente defendible.

## Capabilities

### Autenticación

* Registrar usuarios con rol `CLIENT`.
* Iniciar sesión con email y contraseña.
* Iniciar sesión como `ADMIN` creado por seed.
* Consultar el usuario autenticado.
* Cerrar sesión localmente eliminando el JWT en el frontend.

### Cartelera pública

* Ver películas disponibles sin iniciar sesión.
* Buscar películas por título.
* Filtrar películas por género.
* Ver detalle de película con:

  * póster;
  * título;
  * duración;
  * género;
  * clasificación;
  * sinopsis;
  * funciones futuras disponibles.

### Reservas

* Exigir login para reservar.
* Seleccionar una función futura.
* Ver mapa gráfico de asientos.
* Distinguir asientos `AVAILABLE` y `RESERVED`.
* Seleccionar uno o varios asientos.
* Confirmar reserva.
* Calcular total de la reserva.
* Consultar listado de reservas propias.
* Consultar detalle de una reserva propia.
* Rechazar la doble reserva de un asiento con conflicto `409`.

### Administración de películas

* Listar películas.
* Crear película.
* Editar película.
* Eliminar película cuando no tenga funciones asociadas.
* Cargar póster como archivo.
* Validar título, sinopsis, género, duración, clasificación y póster.

### Administración de salas

* Listar salas.
* Crear sala.
* Editar sala.
* Eliminar sala cuando no tenga funciones asociadas.
* Definir filas y columnas.
* Calcular capacidad automáticamente.
* Generar asientos automáticamente.

### Administración de funciones

* Listar funciones.
* Crear función.
* Editar función futura sin reservas.
* Eliminar función futura sin reservas.
* Seleccionar película.
* Seleccionar sala.
* Definir fecha y hora.
* Definir precio.
* Calcular `endsAt`.
* Impedir funciones superpuestas en la misma sala.

### Manejo de errores

* Mostrar errores de validación.
* Manejar `401` cuando falta autenticación.
* Manejar `403` cuando el rol no tiene permisos.
* Manejar `404` cuando el recurso no existe.
* Manejar `409` cuando hay conflicto de negocio.

## Scope

Incluido en el MVP:

* Aplicación web con frontend React.
* Backend NestJS con API REST.
* PostgreSQL como base de datos.
* Autenticación JWT.
* Roles `CLIENT` y `ADMIN`.
* Cartelera pública.
* Detalle público de película.
* Registro y login.
* Mapa gráfico de asientos.
* Confirmación de reservas.
* Consulta de reservas propias.
* CRUD administrativo de películas.
* Carga local de pósteres.
* CRUD administrativo de salas.
* Generación automática de asientos.
* CRUD administrativo de funciones.
* Validación de horarios superpuestos.
* Validación de doble reserva de asiento.
* Errores comunes y mensajes comprensibles.
* Seed de usuario administrador.
* Documentación mínima de instalación y demo.

## Out of Scope

Fuera del MVP:

* Pagos.
* Facturación.
* Reembolsos.
* Cancelación de reservas.
* Cancelación administrativa de funciones.
* Tickets QR.
* Múltiples sedes o sucursales.
* Tipos de butaca.
* Precios diferenciados por asiento.
* Promociones o descuentos.
* Combos de comida.
* Notificaciones por email, SMS o push.
* Recuperación de contraseña.
* Refresh tokens.
* Revocación de JWT.
* Registro de administradores desde la UI.
* Reportes avanzados.
* Analítica de negocio.
* Microservicios.
* CQRS.
* Event sourcing.
* Arquitectura distribuida.
* Integraciones externas.

## Success Criteria

El MVP se considera exitoso cuando puede demostrarse el siguiente flujo completo:

1. `ADMIN` inicia sesión.
2. `ADMIN` crea una película con póster.
3. `ADMIN` crea una sala con filas y columnas.
4. `ADMIN` crea una función futura.
5. Un visitante consulta la cartelera pública.
6. El visitante busca o filtra películas.
7. El visitante abre el detalle de película.
8. El usuario se registra o inicia sesión.
9. El usuario abre el mapa de asientos.
10. El usuario selecciona uno o varios asientos disponibles.
11. El usuario confirma la reserva.
12. El usuario consulta sus reservas.
13. Un segundo intento de reservar el mismo asiento recibe `409 SEAT_ALREADY_RESERVED`.
14. Un intento de crear una función superpuesta recibe `409 SHOWTIME_OVERLAP`.
15. Un usuario `CLIENT` no puede acceder a rutas administrativas.

Criterios adicionales:

* La cartelera es accesible sin JWT.
* Las reservas requieren JWT.
* Las operaciones administrativas requieren rol `ADMIN`.
* Las reglas críticas se validan en backend.
* El contrato `openapi.yaml` coincide con el comportamiento implementado.
* La aplicación puede ejecutarse desde cero siguiendo el `README.md`.

## Assumptions

* El práctico se evalúa por funcionalidad, claridad técnica y defensa.
* El MVP representa una sola sede de cine.
* El usuario administrador se crea mediante seed.
* Los datos de demo pueden cargarse por seed o manualmente desde el panel admin.
* Las funciones disponibles son futuras.
* El frontend muestra fechas en la zona del cine.
* El backend almacena fechas de forma consistente.
* Los importes se manejan en `BOB`.
* La UI no necesita diseño comercial avanzado, pero sí debe ser clara y usable.
* La prioridad es terminar el flujo principal antes de agregar mejoras visuales.

## Open Questions

* No hay preguntas bloqueantes para el MVP.
* Preguntas para versiones futuras:

  * ¿Se permitirá cancelar reservas?
  * ¿Se agregará pago real?
  * ¿Se manejarán múltiples sedes?
  * ¿Se agregarán notificaciones?
  * ¿Se permitirá seleccionar tipo de asiento?
  * ¿Se generarán tickets digitales?

## Quality checklist

* [x] The product fits in one page.
* [x] Scope and out-of-scope are explicit.
