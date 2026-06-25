---
type: feature
id: WI-011
title: "Implementar historial y detalle de reservas propias"
knowledge_level: K2
status: done
completed_at: 2026-06-25
phase: now
initiative: "Selección de Asientos y Reservas"
domains: []
code: ["backend/src/reservations/**", "frontend/src/pages/MyReservations.tsx"]
created_at: 2026-06-24
source: roadmap
source_id: WI-011
source_initiative: RM-005
summary: "Vistas /my-reservations y /my-reservations/:reservationId para consultar el historial y los detalles de las reservas confirmadas del usuario."
---

# Implementar historial y detalle de reservas propias

> Type: feature · Level: K2

## Source

- Source: roadmap
- Candidate: WI-011
- Initiative: RM-005 — Selección de Asientos y Reservas

## Problem

El cliente autenticado necesita consultar cuáles reservas ha realizado en el pasado o para funciones futuras, y ver el desglose detallado de cada una, garantizando la privacidad e integridad de los datos según el contrato OpenAPI.

## Expected Value

Páginas protegidas `/my-reservations` y `/my-reservations/:reservationId` en el frontend, consumiendo los endpoints de consulta del backend `/api/v1/reservations/my` y `/api/v1/reservations/{reservationId}`.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-005.

**Related capabilities:** Consulta de reservas propias, Privacidad de datos de reservas

**Domain:** Transacciones y Flujo de Clientes

**Impact:** High

**Risk:** High

**Dependencies:**
- WI-010

## Acceptance Criteria

- Rutas `/my-reservations` y `/my-reservations/:reservationId` protegidas en el frontend (requieren JWT).
- En el backend, `GET /api/v1/reservations/my` debe retornar una respuesta paginada (`PaginatedReservationResponse`) que contenga únicamente las reservas realizadas por el usuario autenticado (derivado del token JWT), ordenadas por `reservedAt` de forma descendente.
- En el backend, `GET /api/v1/reservations/{reservationId}` debe retornar la información detallada de la reserva (`ReservationDetail`) si pertenece al usuario autenticado.
- Control de Acceso (IDOR): Si la reserva con ID `reservationId` no existe en la base de datos o si pertenece a otro usuario, el backend debe responder con un error `404 Not Found` (`ReservationNotFound`) para evitar revelar la existencia del registro a terceros.

## Risks

High. La falta de validación del propietario del recurso en los endpoints de detalle (`/{reservationId}`) podría permitir que un usuario consulte las reservas de otros (vulnerabilidad IDOR).

## Notes

Validar rigurosamente que el usuario autenticado sea el propietario de la reserva (devolver 404 si es ajena).

## Open Questions

- None.

## Out of scope

- Reportes descargables en PDF o impresión de boletos.
- Envío de comprobantes por correo electrónico.

## Validation

1. Autenticarse como Cliente A, crear una reserva y llamar a `GET /api/v1/reservations/my`. Comprobar que aparece su reserva y la respuesta cumple con `PaginatedReservationResponse`.
2. Autenticarse como Cliente B, llamar a `GET /api/v1/reservations/my`. Comprobar que la lista NO contiene la reserva del Cliente A.
3. Como Cliente B, intentar realizar un GET a `/api/v1/reservations/{reservationId}` usando el ID de la reserva del Cliente A. Comprobar que el backend responde con `404 Not Found` y el esquema `ReservationNotFound`.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

- Se crearon los endpoints `GET /api/v1/reservations/my` para listar reservas del usuario logueado y `GET /api/v1/reservations/:id` para mostrar el detalle individual.
- Se implementó protección estricta en el endpoint del detalle validando que el `userId` de la reserva coincida con el usuario logueado (retornando `404 RESERVATION_NOT_FOUND` en caso contrario para no revelar su existencia).
- Se crearon las vistas `MyReservations.tsx` y `ReservationDetail.tsx` en el frontend, y se integraron en el enrutamiento y la barra de navegación del proyecto.
