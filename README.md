# CONIITI - Frontend + Backend (Hexagonal)

Proyecto monorepo con frontend en React + Vite y backend en Node.js + Express, ambos organizados con arquitectura hexagonal.

## Estructura

- `frontend/` React + Vite
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
  - `src/ui`
- `backend/` Node.js + Express
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
  - `src/interfaces/http`

## Flujo de ramas (Git)

- `main`: producción (estable).
- `develop`: integración de cambios antes de producción.
- `dev_nebeltran`: rama personal para trabajo de features/no producción.

Estado actual: las 3 ramas están sincronizadas en el mismo commit base.

### Regla de trabajo recomendada

1. Trabajar en `dev_nebeltran`.
2. Cuando esté listo, hacer merge/pull request a `develop`.
3. Validar en `develop` y luego promover a `main`.

## Instalación

Requisitos:

- Node.js LTS
- MySQL 8+

Instalar dependencias desde la raíz:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Configuración backend (MySQL)

1. Copiar variables de entorno:

```bash
cd backend
cp .env.example .env
```

2. Ajustar credenciales en `.env`.

> El backend crea automáticamente la base de datos y la tabla de usuarios si no existen.

## Comandos (desde la raíz)

- `npm run frontend:dev` → levanta frontend (Vite).
- `npm run frontend:build` → build de frontend.
- `npm run backend:dev` → backend en modo desarrollo.
- `npm run backend:start` → backend en modo start.
- `npm run test:e2e` → tests E2E (Playwright).
- `npm run test:e2e:ui` → tests E2E con UI.

## Notas de testing

- Los tests E2E están en `frontend/test`.
- El test de login usa mock de API para ser estable y no depender de que el backend esté corriendo durante la prueba.
