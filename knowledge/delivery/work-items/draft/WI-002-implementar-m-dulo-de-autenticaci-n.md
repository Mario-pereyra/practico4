---
type: feature
id: WI-002
title: "Implementar módulo de autenticación"
knowledge_level: K3
status: done
phase: now
initiative: "Base y Autenticación"
domains: []
code: ["backend/src/auth/**"]
created_at: 2026-06-24
source: roadmap
source_id: WI-002
source_initiative: RM-001
summary: "Registro de clientes, inicio de sesión y endpoints protegidos con roles de usuario en base a JWT siguiendo OpenAPI."
completed_at: '2026-06-24'
---

# Implementar módulo de autenticación

> Type: feature · Level: K3

## Source

- Source: roadmap
- Candidate: WI-002
- Initiative: RM-001 — Base y Autenticación

## Problem

Los usuarios necesitan autenticarse de manera segura para poder reservar asientos, y el administrador necesita protección en las rutas de configuración de películas, salas y funciones, alineándose con el contrato OpenAPI.

## Expected Value

Mecanismo de autenticación JWT y autorización basada en roles (`CLIENT` y `ADMIN`) implementado en el backend bajo los endpoints definidos en `openapi.yaml`.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-001.

**Related capabilities:** Autenticación y Roles

**Domain:** Seguridad e Infraestructura

**Impact:** High

**Risk:** Low

**Dependencies:**
- WI-001

## Acceptance Criteria

- Endpoint público `POST /api/v1/auth/register` que permita crear usuarios nuevos con rol `CLIENT` y devuelva el token JWT (`AuthResponse`). Retornar `409` si el email ya existe (`EmailAlreadyExists`).
- Endpoint público `POST /api/v1/auth/login` que valide credenciales y retorne un token JWT (`AuthResponse`). Retornar `401` si las credenciales son inválidas (`InvalidCredentials`).
- Endpoint protegido `GET /api/v1/auth/me` que retorne la información del usuario autenticado (`User`) en base al token JWT provisto.
- Implementación de un AuthGuard de NestJS que valide JWT y un RolesGuard para restringir accesos a endpoints específicos según el rol (`CLIENT` o `ADMIN`).
- El registro público NO debe permitir la creación de usuarios con rol `ADMIN`.

## Risks

Low. Uso estándar de Passport y JWT en NestJS.

## Notes

Implementar endpoints `/api/v1/auth/register`, `/api/v1/auth/login` y `/api/v1/auth/me`.

## Open Questions

- None.

## Out of scope

- Refresh tokens.
- Recuperación de contraseña por email.
- Interfaz gráfica de login/registro (manejada en tareas de frontend específicas).

## Validation

1. Probar el endpoint `/api/v1/auth/register` con una carga válida, comprobar que el usuario se guarda en la base de datos con rol `CLIENT`.
2. Probar el endpoint `/api/v1/auth/login` con credenciales válidas y verificar la estructura del token devuelto.
3. Probar acceder al endpoint `/api/v1/auth/me` con y sin el encabezado `Authorization: Bearer <token>`, verificando códigos HTTP `200` y `401` correspondientemente.
4. Validar el acceso restringido a un recurso `ADMIN` con un token de `CLIENT`, asegurando que retorne `403 Forbidden`.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

Se implementaron los endpoints `/api/v1/auth/register`, `/api/v1/auth/login` y `/api/v1/auth/me` con total adherencia al contrato OpenAPI. Se integró `bcryptjs` para el hash seguro de contraseñas, TypeORM con Postgres para persistencia, y JWT para la autenticación sin estado. Además, se configuraron guards para autorización por rol (CLIENT/ADMIN) y un Exception Filter global para formatear errores en cumplimiento estricto de la especificación de `ErrorResponse` del contrato API.
