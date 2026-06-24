---
type: feature
id: WI-010
title: "Implementar confirmación transaccional de reservas"
knowledge_level: K4
status: draft
phase: now
initiative: "Selección de Asientos y Reservas"
domains: []
code: ["backend/src/reservations/**"]
created_at: 2026-06-24
source: roadmap
source_id: WI-010
source_initiative: RM-005
summary: "Endpoint /api/v1/reservations para reservar de 1 a 20 asientos de forma atómica y transaccional, previniendo carreras de solicitudes concurrentes."
---

# Implementar confirmación transaccional de reservas

> Type: feature · Level: K4

## Source

- Source: roadmap
- Candidate: WI-010
- Initiative: RM-005 — Selección de Asientos y Reservas

## Problem

Dos o más usuarios concurrentes podrían intentar reservar el mismo asiento para la misma función al mismo tiempo, lo que puede provocar reservas duplicadas e inconsistencias en la base de datos si no se maneja transaccionalmente, según el contrato OpenAPI.

## Expected Value

Endpoint robusto y protegido `POST /api/v1/reservations` en el backend que reciba un arreglo de asientos, validando y guardando las reservas de forma atómica y transaccional, libre de condiciones de carrera y devolviendo la estructura `ReservationDetail`.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-005.

**Related capabilities:** Confirmación de reservas, Prevención de doble reserva, Transacciones en reservas

**Domain:** Transacciones y Flujo de Clientes

**Impact:** High

**Risk:** High

**Dependencies:**
- WI-009

## Acceptance Criteria

- Endpoint protegido por JWT `POST /api/v1/reservations` que reciba `showtimeId` y un arreglo de IDs de asientos (`seatIds`) de acuerdo al esquema `CreateReservationRequest`.
- Permite reservar de 1 a 20 asientos. Todos los `seatIds` deben ser únicos en la solicitud y pertenecer a la sala de la función.
- Si la función o uno de los asientos no existe, retornar `404 Not Found` con código `SHOWTIME_OR_SEAT_NOT_FOUND`.
- Si el showtime ya inició o no admite reservas, retornar `409 Conflict` con el código `SHOWTIME_NOT_BOOKABLE`.
- La confirmación de reservas debe ejecutarse en una transacción de base de datos con aislamiento adecuado (o bloqueo pesimista `SELECT FOR UPDATE`). Si algún asiento ya está reservado para esa función, hacer rollback y retornar `409 Conflict` con el código `SEAT_ALREADY_RESERVED`.
- Restricción física `UNIQUE (showtime_id, seat_id)` en la base de datos.
- Calcular y persistir el total cobrado (cantidad de asientos × precio de la función).

## Risks

High. La concurrencia en la base de datos es crítica. Si no se aísla bien la transacción, es fácil que ocurran dobles reservas.

## Notes

Proteger la doble reserva mediante restricción de unicidad UNIQUE(showtime_id, seat_id).

## Open Questions

- None.

## Out of scope

- Pasarelas de pago reales.
- Cancelación o modificación de reservas una vez confirmadas.

## Validation

1. Intentar hacer `POST /api/v1/reservations` sin JWT, comprobar que retorna `401 Unauthorized`.
2. Simular que dos clientes concurrentes envían la reserva del mismo `seatId` para el mismo `showtimeId` al mismo tiempo.
3. Verificar que uno de los clientes obtiene `201 Created` con la respuesta `ReservationDetail` y el otro obtiene `409 Conflict` con código `SEAT_ALREADY_RESERVED`.
4. Enviar un `POST` con un `seatId` inexistente y verificar que devuelve `404 Not Found` con `SHOWTIME_OR_SEAT_NOT_FOUND`.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

_What did we learn from this change? Update after completion._
---
