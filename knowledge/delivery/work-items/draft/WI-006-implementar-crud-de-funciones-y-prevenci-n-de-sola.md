---
type: feature
id: WI-006
title: "Implementar CRUD de funciones y prevención de solapamientos"
knowledge_level: K4
status: done
phase: now
initiative: "Programación de Funciones"
domains: []
code: ["backend/src/showtimes/**"]
created_at: 2026-06-24
source: roadmap
source_id: WI-006
source_initiative: RM-003
summary: "Programación de funciones bajo /api/v1/admin/showtimes con cálculo automático de endsAt y prevención estricta de solapamientos en la sala."
---

# Implementar CRUD de funciones y prevención de solapamientos

> Type: feature · Level: K4

## Source

- Source: roadmap
- Candidate: WI-006
- Initiative: RM-003 — Programación de Funciones

## Problem

El administrador necesita programar funciones asignando una película y una sala a una hora específica, y el sistema debe asegurar que no haya solapamientos de horarios en la misma sala para evitar conflictos de proyección físicos, respetando los endpoints y códigos del contrato OpenAPI.

## Expected Value

Endpoints de administración protegidos bajo `/api/v1/admin/showtimes` para gestionar funciones, implementando una regla estricta de negocio en el backend que calcule la hora de finalización (`endsAt = startsAt + movie.durationMinutes`) e impida la superposición de horarios en una misma sala.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-003.

**Related capabilities:** Administración de funciones, Prevención de solapamientos de horarios

**Domain:** Programación horaria

**Impact:** High

**Risk:** High

**Dependencies:**
- WI-004
- WI-005

## Acceptance Criteria

- Rutas del backend bajo `/api/v1/admin/showtimes` protegidas para `ADMIN` (`GET`, `POST`, `GET /{showtimeId}`, `PUT /{showtimeId}`, `DELETE /{showtimeId}`).
- Cálculo automático en el backend del campo `endsAt` al crear o actualizar una función, sumando la duración en minutos de la película (`durationMinutes`) a la hora de inicio `startsAt`.
- Regla de validación estricta de solapamientos en la misma sala usando intervalos semiabiertos `[startsAt, endsAt)`. Si una nueva función coincide en tiempo con otra ya programada en la misma sala, la operación debe ser rechazada con un error `409 Conflict` con el código `SHOWTIME_OVERLAP`. Las funciones adyacentes están permitidas (ej: una termina a las 17:00 y la otra inicia a las 17:00).
- El backend exige que `startsAt` sea una fecha/hora futura.
- Bloquear la actualización (`PUT`) o eliminación (`DELETE`) de una función si la función ya comenzó (hora del servidor) o si tiene reservas asociadas, retornando un error `409 Conflict` con el código `SHOWTIME_NOT_MODIFIABLE` para actualizaciones, o `SHOWTIME_NOT_DELETABLE` para eliminaciones.
- Retornar `404 Not Found` con código `MOVIE_OR_ROOM_NOT_FOUND` si la película o la sala especificadas no existen al intentar crear una función.

## Risks

High. La lógica de comparación de intervalos de tiempo debe manejar zonas horarias de manera consistente (America/La_Paz).

## Notes

Aplicar la regla de solapamiento en intervalos semiabiertos [startsAt, endsAt) a nivel backend y bloquear modificaciones de funciones pasadas o con reservas.

## Open Questions

- None.

## Out of scope

- Tiempo de limpieza entre funciones. Se asume que el intervalo semiabierto exacto es suficiente.

## Validation

1. Crear la Función 1 en la Sala A de 15:00 a 17:00.
2. Intentar crear la Función 2 en la Sala A iniciando a las 16:30. Verificar que retorna `409 Conflict` con el código `SHOWTIME_OVERLAP`.
3. Intentar crear la Función 3 en la Sala A iniciando a las 17:00. Verificar que se crea correctamente (las 17:00 es el límite del intervalo semiabierto).
4. Intentar eliminar o editar una función que ya contiene reservas y verificar que retorna error `409` con el código `SHOWTIME_NOT_MODIFIABLE` o `SHOWTIME_NOT_DELETABLE`.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

- La validación de solapamiento usa un intervalo semiabierto `[startsAt, endsAt)` con QueryBuilder: `starts_at < :endsAt AND ends_at > :startsAt`. En `PUT`, se excluye la propia función con `AND id != :excludeId`.
- `endsAt` se calcula como `startsAt + movie.durationMinutes * 60_000 ms`, nunca se recibe del cliente.
- `startsAt` debe ser una fecha futura respecto al reloj del servidor (validado en el service, no en el DTO).
- `SHOWTIME_NOT_MODIFIABLE` y `SHOWTIME_NOT_DELETABLE` se disparan cuando `startsAt <= now()` (función ya iniciada). La comprobación de reservas se completará en WI-010.
- `relations` en TypeORM v0.3 requiere sintaxis de objeto `{ movie: true, room: true }`, no arreglo de strings.
