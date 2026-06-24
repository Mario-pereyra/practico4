---
type: feature
id: WI-008
title: "Implementar detalle de película y horarios de funciones"
knowledge_level: K2
status: draft
phase: now
initiative: "Cartelera Pública y Detalle"
domains: []
code: ["backend/src/movies/**", "frontend/src/pages/MovieDetails.tsx"]
created_at: 2026-06-24
source: roadmap
source_id: WI-008
source_initiative: RM-004
summary: "Vista de detalle /movies/:movieId que muestra la sinopsis, póster, y listado de funciones futuras asociadas a la película."
---

# Implementar detalle de película y horarios de funciones

> Type: feature · Level: K2

## Source

- Source: roadmap
- Candidate: WI-008
- Initiative: RM-004 — Cartelera Pública y Detalle

## Problem

El usuario necesita consultar la sinopsis y detalles completos de una película, junto con las funciones y horarios futuros disponibles, respetando el formato del endpoint definido en OpenAPI.

## Expected Value

Página de detalle de película en el frontend consumiendo la ruta `/api/v1/movies/{movieId}` que retorne metadatos y funciones futuras vigentes de la película.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-004.

**Related capabilities:** Detalle público de película, Horarios de funciones futuras

**Domain:** Portal de Clientes (Público)

**Impact:** Medium

**Risk:** Low

**Dependencies:**
- WI-007

## Acceptance Criteria

- Ruta `/movies/:movieId` en el frontend accesible de forma pública (sin JWT).
- Consumo del endpoint `GET /api/v1/movies/{movieId}` en el backend.
- Estructura de respuesta que siga el esquema `MovieDetail` de la especificación OpenAPI (id, title, synopsis, durationMinutes, genre, rating, posterUrl, showtimes).
- La lista de `showtimes` asociada debe contener únicamente funciones futuras programadas (fecha y hora de inicio `startsAt` mayor o igual a la hora del servidor), ordenadas por fecha de inicio de forma ascendente.
- Si la película no existe en la base de datos, el backend debe retornar `404 Not Found` con la respuesta estándar `MovieNotFound`.

## Risks

Low. Consumo de endpoints públicos estándar.

## Notes

Asegurar que solo se devuelvan funciones futuras.

## Open Questions

- None.

## Out of scope

- Tráiler de la película integrado (solo póster estático).

## Validation

1. Abrir la página `/movies/:movieId` de una película de prueba y verificar que se visualizan correctamente todos los metadatos.
2. Programar una función para el día de ayer y otra para mañana en la base de datos; verificar que la lista de `showtimes` del endpoint `GET /api/v1/movies/{movieId}` solo incluye la de mañana.
3. Solicitar un ID de película inexistente (ej: `GET /api/v1/movies/9999`) y comprobar que el backend retorna `404 Not Found` con código `MOVIE_NOT_FOUND`.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

_What did we learn from this change? Update after completion._
