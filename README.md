# CONIITI - Frontend + Backend (Hexagonal)

Proyecto monorepo con frontend en React + Vite y backend en Node.js + Express, ambos organizados con arquitectura hexagonal.

## 1) Estructura del proyecto

- `frontend/` (React + Vite)
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
  - `src/ui`
- `backend/` (Node + Express)
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
  - `src/interfaces/http`

## 2) Flujo de ramas (Git)

- `main`: producción (estable).
- `develop`: integración previa a producción.
- `dev_nebeltran`: rama personal de desarrollo.

Flujo recomendado:

1. Trabajar en `dev_nebeltran`.
2. Merge / PR hacia `develop`.
3. Validar en `develop`.
4. Promover a `main`.

## 3) Requisitos

- Node.js LTS (recomendado 20+)
- npm
- MySQL 8+

## 4) Instalación paso a paso

Desde la raíz del repo (`Coniiti/Coniiti`):

```bash
cd frontend
npm install
cd ../backend
npm install
cd ..
```

## 5) Configuración de base de datos (MySQL)

El backend usa variables de entorno en `backend/.env`.

### 5.1 Crear el archivo `.env`

En `backend/`:

```bash
cp .env.example .env
```

En Windows PowerShell, si no tienes `cp`:

```powershell
Copy-Item .env.example .env
```

### 5.2 Variables de conexión

Ejemplo de `backend/.env`:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=CONITI
DB_USER=coniiti_app
DB_PASSWORD=TU_PASSWORD_AQUI
```

También puedes usar `root` si lo prefieres:

```dotenv
DB_USER=root
DB_PASSWORD=
```

> El backend crea automáticamente la base de datos `CONITI` y la tabla `users` si no existen.

### 5.3 (Opcional recomendado) Crear usuario de app en MySQL

```sql
CREATE USER IF NOT EXISTS 'coniiti_app'@'localhost' IDENTIFIED BY 'TU_PASSWORD_AQUI';
GRANT ALL PRIVILEGES ON CONITI.* TO 'coniiti_app'@'localhost';
FLUSH PRIVILEGES;
```

## 6) Cómo correr el proyecto

### Opción A: dos terminales (recomendado)

Terminal 1 (backend):

```bash
npm run backend:start
```

Terminal 2 (frontend):

```bash
npm run frontend:dev
```

Frontend: `http://127.0.0.1:5173` (o puerto que indique Vite)
Backend: `http://127.0.0.1:3000`

### Opción B: modo desarrollo backend

```bash
npm run backend:dev
```

## 7) Cómo correr tests

Desde la raíz:

```bash
npm run test:e2e
```

Modo UI (Playwright):

```bash
npm run test:e2e:ui
```

Directo desde `frontend/`:

```bash
cd frontend
npm run test:e2e
```

Notas:

- Los tests E2E están en `frontend/test`.
- El test de login usa mock de API para no depender del backend encendido.

## 8) Comandos disponibles (raíz)

- `npm run frontend:dev`
- `npm run frontend:build`
- `npm run backend:dev`
- `npm run backend:start`
- `npm run test:e2e`
- `npm run test:e2e:ui`

## 9) Solución de problemas (Windows)

Si `npm` no se reconoce en PowerShell:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
& 'C:\Program Files\nodejs\npm.cmd' run frontend:dev
```

Para correr comandos con `--prefix`:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run start --prefix backend
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e --prefix frontend
```

## 10) Notas de Git

- `frontend/test-results/.last-run.json` es un archivo temporal de Playwright.
- Si aparece como cambio local, no es código funcional del proyecto.

Git (trabajo normal en tu rama)

git checkout dev_nebeltran
git pull origin dev_nebeltran
git add .
git commit -m "tu cambio"
git push origin dev_nebeltran
Pasar cambios a develop

git checkout develop
git pull origin develop
git merge dev_nebeltran
git push origin develop
Pasar cambios a producción (main)

git checkout main
git pull origin main
git merge develop
git push origin main
Correr proyecto

Backend: npm run backend:start
Frontend: npm run frontend:dev
Correr tests

npm run test:e2e
UI tests: npm run test:e2e:ui
Si npm falla en PowerShell (Windows)

$env:Path = 'C:\Program Files\nodejs;' + $env:Path
& 'C:\Program Files\nodejs\npm.cmd' run backend:start
& 'C:\Program Files\nodejs\npm.cmd' run frontend:dev
& 'C:\Program Files\nodejs\npm.cmd' run test:e2e

## 11) Correr todo el proyecto con un solo comando

Primero instala todo:

```bash
npm run install:all
```

Desde la raiz:

```bash
npm run dev:all
```

Esto levanta al mismo tiempo:

- frontend
- auth-service
- conferencias-service

## 12) Auth-service con base de datos

El microservicio `auth-service` soporta:

- `AUTH_SERVICE_STORAGE=memory`
- `AUTH_SERVICE_STORAGE=mysql`

Crea `auth-service/.env` a partir de `auth-service/.env.example`.

Ejemplo:

```dotenv
AUTH_SERVICE_PORT=3003
AUTH_SERVICE_STORAGE=mysql
AUTH_SERVICE_JWT_SECRET=un_secreto_seguro
AUTH_SERVICE_DB_HOST=localhost
AUTH_SERVICE_DB_PORT=3306
AUTH_SERVICE_DB_NAME=CONITI
AUTH_SERVICE_DB_USER=root
AUTH_SERVICE_DB_PASSWORD=
```

En modo MySQL el servicio crea o ajusta:

- tabla `users` con columna `role`
- tabla `password_reset_tokens`
