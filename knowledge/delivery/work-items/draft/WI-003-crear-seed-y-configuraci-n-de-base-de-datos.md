---
type: chore
id: WI-003
title: "Crear seed y configuración de base de datos"
knowledge_level: K2
status: done
phase: now
initiative: "Base y Autenticación"
domains: []
code: ["backend/src/database/**"]
created_at: 2026-06-24
source: roadmap
source_id: WI-003
source_initiative: RM-001
summary: "Base de datos PostgreSQL inicializada con migraciones de TypeORM y usuario ADMIN pre-cargado."
---

# Crear seed y configuración de base de datos

> Type: chore · Level: K2

## Source

- Source: roadmap
- Candidate: WI-003
- Initiative: RM-001 — Base y Autenticación

## Problem

El sistema requiere una base de datos relacional PostgreSQL con una estructura definida y un usuario `ADMIN` por defecto para poder iniciar sesión y gestionar el catálogo en la demo académica.

## Expected Value

Módulo de base de datos en NestJS conectado a PostgreSQL mediante TypeORM, con configuración de variables de entorno y un script de semilla (seed) para poblar datos iniciales de prueba y credenciales de administración.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-001.

**Related capabilities:** Autenticación y Roles

**Domain:** Seguridad e Infraestructura

**Impact:** High

**Risk:** Low

**Dependencies:**
- WI-001

## Acceptance Criteria

- Configuración de TypeORM con soporte para variables de entorno (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`).
- Entidades básicas mapeadas en TypeORM.
- Comando `npm run migration:run` funcional para ejecutar las migraciones de base de datos.
- Comando de semilla `npm run seed:run` (o similar) que cree:
  - Un usuario administrador (`admin@cinema.com` / `admin123` o similar) con rol `ADMIN`.
  - Películas y salas de demostración si es necesario.

## Risks

Low. Configuración estándar de TypeORM y PostgreSQL.

## Notes

Crear script de seed para base de datos local y entorno de demo.

## Open Questions

- None.

## Out of scope

- Scripts de respaldo y restauración automáticos.

## Validation

1. Configurar y arrancar una base de datos PostgreSQL local (vía Docker o instalación nativa).
2. Ejecutar las migraciones y comprobar la creación de tablas en la base de datos.
3. Ejecutar el comando del seed y verificar mediante consola o query SQL que el usuario `ADMIN` ha sido insertado correctamente con su contraseña encriptada.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

Configuramos el DataSource de TypeORM en backend/src/database/data-source.ts leyendo variables de entorno (.env). Esto centraliza la configuración tanto para NestJS como para la CLI de TypeORM. Implementamos la migración inicial de la tabla `users` y un seed script para insertar el usuario administrador (`admin@cinema.com` / `admin123`) con contraseña encriptada por bcryptjs. Todas las pruebas del backend continúan pasando sin problemas.
