---
type: feature
id: WI-004
title: "Implementar CRUD de películas y carga de pósteres"
knowledge_level: K3
status: done
phase: now
initiative: "Catálogo de Películas y Salas"
domains: []
code: ["backend/src/movies/**"]
created_at: 2026-06-24
source: roadmap
source_id: WI-004
source_initiative: RM-002
summary: "CRUD completo de películas bajo /api/v1/admin/movies y carga multipart del póster."
---

# Implementar CRUD de películas y carga de pósteres

> Type: feature · Level: K3

## Source

- Source: roadmap
- Candidate: WI-004
- Initiative: RM-002 — Catálogo de Películas y Salas

## Problem

El administrador del cine necesita gestionar las películas en cartelera y subir las imágenes de sus pósteres para que los visitantes puedan consultarlas, respetando las rutas y validaciones del contrato OpenAPI.

## Expected Value

Endpoints REST seguros en el backend para realizar operaciones CRUD sobre películas, incluyendo soporte para carga de archivos de imágenes locales (pósteres) y almacenamiento en disco, bajo el path `/api/v1/admin/movies`.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-002.

**Related capabilities:** Administración de películas, Carga de pósteres

**Domain:** Administración del Cine

**Impact:** Medium

**Risk:** Medium

**Dependencies:**
- WI-002
- WI-003

## Acceptance Criteria

- Rutas del backend bajo `/api/v1/admin/movies` que implementen:
  - `GET /api/v1/admin/movies` (Listar películas para administración, con paginación y búsqueda).
  - `POST /api/v1/admin/movies` (Crear película con carga de archivo multipart para el póster - JPEG, PNG o WebP de hasta 5 MB).
  - `GET /api/v1/admin/movies/{movieId}` (Ver detalle administrativo).
  - `PUT /api/v1/admin/movies/{movieId}` (Actualizar datos de película y póster opcional en formato multipart).
  - `DELETE /api/v1/admin/movies/{movieId}` (Eliminar película).
- Todas las rutas `/api/v1/admin/movies` deben requerir autenticación JWT y rol `ADMIN`.
- Carga de imágenes locales guardadas en el servidor y expuestas públicamente.
- Bloquear la eliminación de una película (`DELETE`) si tiene funciones asociadas, retornando un error `409 Conflict` con el código `MOVIE_HAS_SHOWTIMES`.
- Bloquear la actualización de la duración (`durationMinutes`) en `PUT` si existen funciones futuras o en curso programadas para dicha película, retornando `409 Conflict` con el código `MOVIE_DURATION_LOCKED`.

## Risks

Medium. Carga de archivos multipart y validación de candados temporales (`MOVIE_DURATION_LOCKED`).

## Notes

Implementar validación de cambio de duración y bloqueo de eliminación si tiene funciones asociadas.

## Open Questions

- None.

## Out of scope

- Almacenamiento en servicios en la nube (S3, Cloudinary).
- Interfaz gráfica del panel administrativo.

## Validation

1. Autenticarse como `CLIENT` e intentar realizar solicitudes CRUD en `/api/v1/admin/movies`, verificar respuesta `403 Forbidden`.
2. Autenticarse como `ADMIN` y realizar un `POST` enviando un formulario multipart con datos de la película y un archivo de imagen, comprobar que se crea en la base de datos.
3. Intentar realizar un `PUT` en `/api/v1/admin/movies/{movieId}` cambiando `durationMinutes` cuando la película tiene un showtime mañana, comprobar que retorna `409 Conflict` con el mensaje `MOVIE_DURATION_LOCKED`.
4. Probar la eliminación de una película que está asignada a una función programada y verificar que devuelve `409 Conflict` con `MOVIE_HAS_SHOWTIMES`.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

Implementamos el CRUD de películas bajo `/api/v1/admin/movies` con soporte para subida de imágenes (póster) en formato multipart usando Multer. Definimos validaciones para impedir cambiar la duración de la película si tiene funciones activas o futuras asignadas (`MOVIE_DURATION_LOCKED`), así como impedir la eliminación física si tiene funciones asociadas (`MOVIE_HAS_SHOWTIMES`).
