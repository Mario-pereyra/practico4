---
type: feature
id: WI-007
title: "Implementar listado de cartelera pública con filtros"
knowledge_level: K2
status: draft
phase: now
initiative: "Cartelera Pública y Detalle"
domains: []
code: ["backend/src/movies/**", "frontend/src/pages/Movies.tsx"]
created_at: 2026-06-24
source: roadmap
source_id: WI-007
source_initiative: RM-004
summary: "Vista pública /movies con buscador por título (búsqueda parcial) y filtros exactos por género alineada a OpenAPI."
---

# Implementar listado de cartelera pública con filtros

> Type: feature · Level: K2

## Source

- Source: roadmap
- Candidate: WI-007
- Initiative: RM-004 — Cartelera Pública y Detalle

## Problem

Los visitantes del sitio necesitan consultar la cartelera disponible de películas sin necesidad de registrarse o iniciar sesión, buscando y filtrando para encontrar películas de su interés de acuerdo al contrato OpenAPI.

## Expected Value

Endpoints de consulta pública de películas en el backend, y una página de cartelera (`/movies`) pública en el frontend con buscador interactivo y filtros funcionales, consumiendo el endpoint `/api/v1/movies`.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-004.

**Related capabilities:** Cartelera pública, Búsqueda y filtrado de películas

**Domain:** Portal de Clientes (Público)

**Impact:** Medium

**Risk:** Low

**Dependencies:**
- WI-006

## Acceptance Criteria

- Página `/movies` en el frontend accesible de forma pública (sin JWT).
- Endpoint del backend `GET /api/v1/movies` que retorne una estructura paginada (`PaginatedMovieSummaryResponse`).
- Soporte para parámetros de consulta:
  - `search` (Búsqueda parcial en título, case-insensitive, recorta espacios laterales).
  - `genre` (Filtro exacto por género).
  - `rating` (Filtro por clasificación por edades).
  - `page` y `limit` (Parámetros de paginación).
- El listado público debe retornar únicamente aquellas películas que cuenten con al menos una función futura programada.
- Visualización atractiva tipo "grid" de tarjetas de películas que incluya: póster, título, género, duración y clasificación.

## Risks

Low. Funcionalidad de catálogo estándar y búsquedas básicas.

## Notes

Excluir de la cartelera aquellas películas que no posean funciones futuras programadas.

## Open Questions

- None.

## Out of scope

- Ordenamiento complejo por valoración o popularidad.
- Recomendaciones personalizadas de películas.

## Validation

1. Acceder a `/movies` sin iniciar sesión y corroborar que el listado carga correctamente.
2. Ingresar un término de búsqueda parcial (ej: "bat") y verificar que se listan solo las películas correspondientes llamando a `/api/v1/movies?search=bat`.
3. Seleccionar el filtro "Terror" y comprobar que la URL del backend llamada incluye `genre=Terror`.
4. Programar una película sin ninguna función futura y comprobar que NO aparece en el resultado de la cartelera pública.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

_What did we learn from this change? Update after completion._
