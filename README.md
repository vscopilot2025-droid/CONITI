# CONITI

Monorepo web para CONITI con frontend en React + Vite y backend dividido en microservicios Node.js + Express + MySQL.

## Estructura

- `frontend/`: aplicacion React + Vite. Actualmente monta la landing legacy desde `frontend/public/conii.html`.
- `auth-service/`: autenticacion, registro, JWT, roles y recuperacion de contrasena.
- `conferencias-service/`: CRUD de conferencias, categorias, estados y agenda.
- `conferencistas-service/`: CRUD de conferencistas, ponencias y relacion con eventos.
- `fechas-service/`: disponibilidad, conflictos, zonas horarias y agenda maestra.
- `scripts/run-all.js`: levanta todos los servicios desde la raiz.

## Requisitos

- Node.js LTS recomendado 20+
- npm
- MySQL 8+

## Instalacion

Desde la raiz del proyecto:

```powershell
npm run install:all
```

## Variables de entorno

Cada microservicio tiene su propio `.env.example`. Crea los `.env` locales copiando esos ejemplos:

```powershell
Copy-Item auth-service\.env.example auth-service\.env
Copy-Item conferencias-service\.env.example conferencias-service\.env
Copy-Item conferencistas-service\.env.example conferencistas-service\.env
Copy-Item fechas-service\.env.example fechas-service\.env
Copy-Item frontend\.env.example frontend\.env
```

Los `.env` estan ignorados por Git.

### Puertos por defecto

- Frontend: `http://127.0.0.1:5173`
- Auth service: `http://127.0.0.1:3003`
- Conferencias service: `http://127.0.0.1:3004`
- Conferencistas service: `http://127.0.0.1:3005`
- Fechas service: `http://127.0.0.1:3006`

### Frontend

`frontend/.env`:

```dotenv
VITE_AUTH_API_URL=http://127.0.0.1:3003
VITE_PAYMENTS_API_URL=http://127.0.0.1:3003
VITE_SPEAKERS_API_URL=http://127.0.0.1:3005
```

### Auth service

`auth-service/.env`:

```dotenv
AUTH_SERVICE_PORT=3003
AUTH_SERVICE_STORAGE=mysql
AUTH_SERVICE_JWT_SECRET=un_secreto_seguro
AUTH_SERVICE_DB_HOST=localhost
AUTH_SERVICE_DB_PORT=3306
AUTH_SERVICE_DB_NAME=CONITI_AUTH
AUTH_SERVICE_DB_USER=root
AUTH_SERVICE_DB_PASSWORD=
AUTH_SERVICE_PAYMENTS_MODE=stripe
AUTH_SERVICE_STRIPE_SECRET_KEY=sk_test_xxx
AUTH_SERVICE_STRIPE_WEBHOOK_SECRET=whsec_xxx
AUTH_SERVICE_PAYMENTS_CURRENCY=cop
AUTH_SERVICE_PAYMENTS_SUCCESS_URL=http://localhost:5173/?payment=success
AUTH_SERVICE_PAYMENTS_CANCEL_URL=http://localhost:5173/?payment=cancelled
```

### Pagos Stripe (modo test)

- Checkout: `POST /payments/create-checkout-session`.
- Webhook: `POST /payments/webhook`.
- Estado de una sesión: `GET /payments/sessions/:sessionId` (requiere token Bearer).
- El usuario debe iniciar sesión para comprar boletas.
- El frontend redirige a Stripe Checkout y retorna con `?payment=success` o `?payment=cancelled`.
- Si `AUTH_SERVICE_STORAGE=mysql`, los pagos quedan persistidos en la tabla `payments` de `CONITI_AUTH`.

Modos de prueba disponibles:

- `AUTH_SERVICE_PAYMENTS_MODE=mock`: no requiere Stripe, crea sesiones simuladas y las marca como `paid` para validar flujo completo de UI/API sin transacción real.
- `AUTH_SERVICE_PAYMENTS_MODE=stripe`: usa Stripe en test mode (`sk_test_*`) y confirma pago por webhook.

Buenas prácticas implementadas:

- El monto y moneda se validan en backend por catálogo de boletas (no se confía en valores enviados desde frontend).
- Se soporta idempotencia opcional con header `x-idempotency-key` al crear checkout.
- El webhook valida firma cuando existe `AUTH_SERVICE_STRIPE_WEBHOOK_SECRET`.

Para testear webhook localmente:

```powershell
stripe listen --forward-to http://127.0.0.1:3003/payments/webhook
```

Credenciales demo creadas automaticamente:

- Admin: `admin@coniiti.test` / `Admin123*`
- Organizador: `organizer@coniiti.test` / `Organizer123*`

## Comandos

Levantar todo en desarrollo:

```powershell
npm run dev:all
```

Levantar solo frontend:

```powershell
npm run frontend:dev
```

Build del frontend:

```powershell
npm run frontend:build
```

Tests E2E:

```powershell
npm run test:e2e
```

## Health checks

Con los servicios arriba:

```powershell
Invoke-RestMethod http://127.0.0.1:3003/health
Invoke-RestMethod http://127.0.0.1:3004/health
Invoke-RestMethod http://127.0.0.1:3005/health
Invoke-RestMethod http://127.0.0.1:3006/health
```

## Base de datos

La instancia local de MySQL funciona como el contenedor madre, equivalente a la vista de SQL Server Management Studio donde una instancia contiene varias bases de datos.

Dentro de esa instancia, cada microservicio tiene su propia base:

- `CONITI_AUTH`: tablas de `auth-service`
- `CONITI_CONFERENCIAS`: tablas de `conferencias-service`
- `CONITI_CONFERENCISTAS`: tablas de `conferencistas-service`
- `CONITI_FECHAS`: tablas de `fechas-service`

Esto mantiene separacion por responsabilidad y es mas cercano a una arquitectura de microservicios.

El esquema general de todas las bases esta en:

- `database/001_coniti_databases.sql`

Para crear o validar todas las bases manualmente en MySQL:

```powershell
mysql -u root -p < database\001_coniti_databases.sql
```

Tambien existen esquemas versionados por microservicio:

- `auth-service/sql/001_schema.sql`
- `conferencias-service/sql/001_schema.sql`
- `conferencistas-service/sql/001_schema.sql`
- `fechas-service/sql/001_schema.sql`

Si quieres aplicar solo el modulo de un servicio:

```powershell
mysql -u root -p < auth-service\sql\001_schema.sql
mysql -u root -p < conferencias-service\sql\001_schema.sql
mysql -u root -p < conferencistas-service\sql\001_schema.sql
mysql -u root -p < fechas-service\sql\001_schema.sql
```

Si antes usaste la base `CONITI` para autenticacion, puedes migrar esos datos a `CONITI_AUTH` con:

```powershell
mysql -u root -p < database\002_migrate_auth_from_coniti.sql
```

Los repositorios MySQL todavia crean tablas automaticamente al iniciar en modo `mysql`. Eso se mantiene para desarrollo local, pero `database/001_coniti_databases.sql` es la fuente estable para instalacion, revision y despliegue.

## Estado actual

- La arquitectura activa esta en la raiz del repositorio.
- La antigua carpeta duplicada `CONITI/` fue eliminada.
- El frontend aun conserva una landing legacy, pero ya consume servicios desde configuracion `VITE_*`.
- Los tests E2E no dependen de tener el backend encendido porque mockean el login.

## Flujo recomendado antes de cambiar codigo

```powershell
git status --short
npm run frontend:build
npm run test:e2e
```

Despues de cada cambio importante, repetir build y tests para evitar regresiones.
