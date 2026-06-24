---
type: feature
id: WI-009
title: "Implementar visualización gráfica del mapa de asientos"
knowledge_level: K3
status: draft
phase: now
initiative: "Selección de Asientos y Reservas"
domains: []
code: ["backend/src/showtimes/**", "frontend/src/pages/SeatsSelection.tsx"]
created_at: 2026-06-24
source: roadmap
source_id: WI-009
source_initiative: RM-005
summary: "Vista interactiva /showtimes/:showtimeId/seats que presenta el mapa de asientos en estados AVAILABLE o RESERVED."
---

# Implementar visualización gráfica del mapa de asientos

> Type: feature · Level: K3

## Source

- Source: roadmap
- Candidate: WI-009
- Initiative: RM-005 — Selección de Asientos y Reservas

## Problem

El cliente autenticado necesita seleccionar asientos específicos en un mapa visual interactivo, consumiendo el endpoint del mapa de asientos especificado en el contrato OpenAPI.

## Expected Value

Página en el frontend `/showtimes/:showtimeId/seats` que cargue la cuadrícula de asientos consumiendo el endpoint del backend `GET /api/v1/showtimes/{showtimeId}/seats` y pinte su estado de ocupación, permitiendo la selección interactiva.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-005.

**Related capabilities:** Visualización de mapa gráfico de asientos, Estados AVAILABLE y RESERVED

**Domain:** Transacciones y Flujo de Clientes

**Impact:** High

**Risk:** High

**Dependencies:**
- WI-008

## Acceptance Criteria

- Página `/showtimes/:showtimeId/seats` protegida por autenticación JWT en frontend (redirige a login si no hay sesión).
- Consumo del endpoint `GET /api/v1/showtimes/{showtimeId}/seats` en el backend, el cual retorna una estructura `SeatMapResponse` (película, sala, horario, precio y estado de cada asiento: `AVAILABLE` o `RESERVED`).
- El endpoint `GET /api/v1/showtimes/{showtimeId}/seats` solo debe admitir funciones futuras (devolver `409 Conflict` con `SHOWTIME_NOT_BOOKABLE` si ya inició o pasó).
- Retornar `404 Not Found` (`ShowtimeNotFound`) si la función no existe.
- En el frontend, renderizar el plano de asientos visual de la sala. Los asientos `RESERVED` deben mostrarse inactivos o deshabilitados. Los asientos `AVAILABLE` deben ser seleccionables.
- Mostrar el total a pagar provisional basado en la cantidad seleccionada.

## Risks

High. Integración correcta del mapa de asientos con las coordenadas físicas de fila/columna y el estado de reservas vigentes.

## Notes

Los asientos RESERVED deben mostrarse deshabilitados.

## Open Questions

- None.

## Out of scope

- Reservas en diferentes zonas con precios diferenciados.

## Validation

1. Intentar acceder a `GET /api/v1/showtimes/{showtimeId}/seats` sin token JWT, verificar que retorna `401 Unauthorized`.
2. Consumir el endpoint para un showtime que ya pasó y verificar que retorna `409 Conflict` con el código `SHOWTIME_NOT_BOOKABLE`.
3. Consumir para un showtime futuro válido, verificar que retorna el listado de asientos con su fila, columna, id y estado (`AVAILABLE` / `RESERVED`) de acuerdo al esquema `SeatMapResponse`.
4. Verificar en el frontend que los asientos marcados como `RESERVED` están visualmente deshabilitados.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

_What did we learn from this change? Update after completion._
