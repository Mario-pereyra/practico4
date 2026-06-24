---
type: feature
id: WI-005
title: "Implementar CRUD de salas y generación de asientos"
knowledge_level: K3
status: draft
phase: now
initiative: "Catálogo de Películas y Salas"
domains: []
code: ["backend/src/rooms/**"]
created_at: 2026-06-24
source: roadmap
source_id: WI-005
source_initiative: RM-002
summary: "CRUD de salas bajo /api/v1/admin/rooms con generación atómica automática de asientos (capacidad = rows * columns)."
---

# Implementar CRUD de salas y generación de asientos

> Type: feature · Level: K3

## Source

- Source: roadmap
- Candidate: WI-005
- Initiative: RM-002 — Catálogo de Películas y Salas

## Problem

El administrador necesita crear y gestionar salas de proyección especificando su diseño (filas y columnas), y el sistema debe generar automáticamente los asientos asociados respetando los endpoints y códigos del contrato OpenAPI.

## Expected Value

Endpoints de administración protegidos bajo `/api/v1/admin/rooms` para salas físicas, que de forma atómica y automática generen las entidades de los asientos correspondientes a la cuadrícula asignada.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-002.

**Related capabilities:** Administración de salas, Generación automática de asientos

**Domain:** Administración del Cine

**Impact:** Medium

**Risk:** Medium

**Dependencies:**
- WI-002
- WI-003

## Acceptance Criteria

- Rutas de administración protegidas bajo `/api/v1/admin/rooms` para CRUD de salas (`GET`, `POST`, `GET /{roomId}`, `PUT /{roomId}`, `DELETE /{roomId}`) y listar asientos (`GET /{roomId}/seats`).
- Al crear una sala (`POST`) o modificarla (`PUT`), el sistema debe calcular la capacidad (`rows × columns`) y generar atómicamente todos los asientos en la base de datos (asociados a la sala).
- Bloquear la actualización de `rows` o `columns` (`PUT`) si la sala tiene funciones (`showtimes`) asociadas, retornando un error `409 Conflict` con el código `ROOM_LAYOUT_LOCKED`.
- Bloquear la eliminación de la sala (`DELETE`) si la sala tiene funciones (`showtimes`) asociadas, retornando un error `409 Conflict` con el código `ROOM_HAS_SHOWTIMES`. Si no tiene, los asientos se eliminan en cascada.
- Validaciones en backend: `rows` y `columns` deben cumplir con los rangos definidos.

## Risks

Medium. La recreación de asientos en modificaciones (`PUT`) debe resguardarse contra la eliminación de asientos que ya posean reservas históricas o activas.

## Notes

Impedir cambios en filas/columnas y eliminación si la sala cuenta con funciones programadas.

## Open Questions

- None.

## Out of scope

- Múltiples zonas de precios en una misma sala.
- Butacas VIP o especiales con lógica de reserva distinta.

## Validation

1. Realizar una petición `POST /api/v1/admin/rooms` con `rows: 5` y `columns: 10`. Verificar que se crea la sala y que se insertan exactamente 50 registros de asientos asociados en la base de datos.
2. Intentar actualizar `rows` o `columns` de una sala asociada a una función activa y verificar que devuelve `409 Conflict` con `ROOM_LAYOUT_LOCKED`.
3. Intentar eliminar una sala asociada a un showtime y verificar que devuelve `409 Conflict` con `ROOM_HAS_SHOWTIMES`.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

_What did we learn from this change? Update after completion._
