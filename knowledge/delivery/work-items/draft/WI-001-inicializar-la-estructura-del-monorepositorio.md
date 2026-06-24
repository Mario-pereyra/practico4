---
type: chore
id: WI-001
title: Inicializar la estructura del monorepositorio
knowledge_level: K2
status: done
phase: now
initiative: Base y Autenticación
domains: []
code:
  - backend/*
  - frontend/*
  - package.json
  - .gitignore
created_at: 2026-06-24T00:00:00.000Z
source: roadmap
source_id: WI-001
source_initiative: RM-001
summary: >-
  Inicializar la estructura monorepo (NestJS + React) con TypeScript, testing y
  linters configurados.
completed_at: '2026-06-24'
---

# Inicializar la estructura del monorepositorio

> Type: chore · Level: K2

## Source

- Source: roadmap
- Candidate: WI-001
- Initiative: RM-001 — Base y Autenticación

## Problem

Se requiere una estructura de monorepositorio limpia y configurada para albergar el backend (NestJS) y el frontend (React) del práctico de reservas de cine.

## Expected Value

Directorios `backend/` y `frontend/` configurados con TypeScript, NestJS, React, y herramientas de testing (Jest y Vitest) y archivos de configuración global del proyecto.

## Context From Roadmap

This candidate was created from the roadmap initiative RM-001.

**Related capabilities:** Autenticación y Roles

**Domain:** Seguridad e Infraestructura

**Impact:** High

**Risk:** Low

**Dependencies:**
- None

## Acceptance Criteria

- Directorios `backend/` y `frontend/` creados y configurados como subproyectos independientes.
- Archivo `.gitignore` configurado para ignorar directorios de dependencias, compilados y entornos.
- Servidor backend NestJS y frontend React inicializados con TypeScript.
- Scripts de ejecución local `npm run dev` (o equivalente) y herramientas de pruebas (Jest en backend, Vitest en frontend) funcionales.

## Risks

Low. Es una inicialización estándar del monorepositorio.

## Notes

Configurar el archivo `.gitignore` y la arquitectura del monorepositorio.

## Open Questions

- None

## Out of scope

- Implementación de módulos específicos de lógica de negocio o UI.

## Validation

1. Ejecutar instalación de dependencias en raíz y subcarpetas.
2. Levantar backend y frontend localmente y verificar que responden.
3. Ejecutar los comandos de testing unitario en ambos proyectos.

## Definition of Done

- [x] Problem is clear.
- [x] Expected result is defined.
- [x] Impact of not doing it is stated.
- [x] Acceptance criteria are verifiable.

## Learning

Se configuró la estructura base del monorepositorio con NestJS, React + Vite + Vitest y .gitignore global.
