# CONIITI - Frontend + Backend (Hexagonal)

## Estructura

- `frontend/` React + Vite con arquitectura hexagonal
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
  - `src/ui`
- `backend/` Node.js + Express con arquitectura hexagonal
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
  - `src/interfaces/http`

## Comandos

Desde la raíz del proyecto:

- `npm run frontend:dev`
- `npm run frontend:build`
- `npm run backend:dev`
- `npm run backend:start`

## Instalación

1. Instalar Node.js LTS.
2. Ejecutar:
   - `cd frontend && npm install`
   - `cd ../backend && npm install`
