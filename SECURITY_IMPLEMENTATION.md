# Implementacion de Seguridad - CONIITI

Fecha: 2026-05-20

## Resumen ejecutivo

Se implemento un cierre de seguridad alineado con SSDF para el alcance actual de CONIITI. La ejecucion se organizo por fases de S-SDLC y con actividades concretas inspiradas en Microsoft SDL.

Se cubrieron controles de:

- autenticacion
- autorizacion
- validacion de entrada
- endurecimiento HTTP
- rate limiting
- almacenamiento de sesion en cliente
- privilegios de base de datos
- endurecimiento de Docker
- trazabilidad basica de eventos sensibles
- revision de dependencias
- documentacion operativa

El objetivo de esta iteracion fue cerrar riesgos inmediatos en autenticacion, autorizacion, validacion de entrada y exposicion HTTP sin reescribir la arquitectura actual.

## Fases SSDF cerradas

### PW.1 - Preparar la organizacion

Entregables cerrados:

- documentacion de seguridad del proyecto
- variables de entorno actualizadas por servicio
- criterios de despliegue seguro documentados
- decision arquitectonica de mantener `fechas-service` como agregador sin duplicar datos

### PS.1 / PS.2 - Proteger el software y la plataforma

Entregables cerrados:

- servicios Node ejecutandose como usuario no root dentro del contenedor
- bind de puertos Docker solo en `127.0.0.1`
- uso de usuario de aplicacion en MySQL (`coniiti_app`)
- deshabilitacion de bootstrap de base de datos en runtime Docker
- soporte de script de provision para usuario y grants

### PW.4 - Crear software seguro

Entregables cerrados:

- validacion de payloads en auth, conferencias, conferencistas y fechas
- JWT con expiracion configurable
- comparacion segura de firma
- autorizacion por rol en rutas de escritura
- proteccion de errores y respuestas sensibles
- session persistence reducida de `localStorage` a `sessionStorage`

### PW.6 / RV.1 - Verificar y corregir

Entregables cerrados:

- `npm audit --omit=dev` limpio en los 5 proyectos
- build de frontend exitoso
- pruebas E2E pasando
- health checks validados en los 4 microservicios

## Alcance implementado

### 1. Autenticacion y sesion

Servicios impactados:

- `auth-service`
- `conferencias-service`
- `conferencistas-service`
- `fechas-service`

Cambios aplicados:

- validacion de JWT centralizada y mas estricta
- comparacion segura de firma con `timingSafeEqual`
- expiracion de token configurable por variable de entorno
- mensajes de error de autenticacion mas genericos
- respuestas sensibles con `Cache-Control: no-store`
- persistencia de autenticacion movida a `sessionStorage`
- migracion automatica de sesiones viejas almacenadas en `localStorage`

Variables nuevas:

- `AUTH_SERVICE_JWT_EXPIRES_IN_SECONDS`

### 2. Rate limiting

Se agregaron middlewares propios de limitacion por ventana para reducir abuso de endpoints.

#### Auth

Rutas limitadas:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/reset-password/request`

Variables nuevas:

- `AUTH_SERVICE_RATE_LIMIT_WINDOW_MS`
- `AUTH_SERVICE_LOGIN_RATE_LIMIT_MAX`
- `AUTH_SERVICE_REGISTER_RATE_LIMIT_MAX`
- `AUTH_SERVICE_RESET_RATE_LIMIT_MAX`

#### Escritura en microservicios

Se agrego limitacion a operaciones de escritura en:

- `conferencias-service`
- `conferencistas-service`
- `fechas-service`

Variables nuevas por servicio:

- `*_SERVICE_WRITE_RATE_LIMIT_WINDOW_MS`
- `*_SERVICE_WRITE_RATE_LIMIT_MAX`

### 3. Autorizacion por roles

Se reforzo el uso de:

- `requireAuth`
- `requireRole('admin', 'organizer')`

Rutas protegidas:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- endpoints de agenda y relaciones

Lecturas publicas conservadas:

- consulta de conferencias
- consulta de conferencistas
- consulta de cronograma
- `health`

### 4. Validacion de entrada

Se endurecieron validaciones en:

- `auth-service/src/routes/auth.routes.js`
- `conferencias-service/src/routes/conferencias.routes.js`
- `conferencistas-service/src/routes/conferencistas.routes.js`
- `fechas-service/src/routes/fechas.routes.js`

Cobertura agregada:

- ids positivos
- strings requeridos
- longitudes maximas
- arrays controlados
- fechas validas
- estados y severidades con listas blancas
- busquedas con longitud maxima
- password mas fuerte

### 5. Seguridad HTTP basica

Se aplico en todos los microservicios:

- `helmet`
- CORS restringido por lista blanca
- `express.json` con limite de tamano
- `x-powered-by` deshabilitado
- respuestas genericas en errores no controlados
- trazabilidad de requests sensibles con logs estructurados

### 5.1 Auditoria basica

Se agrego logging estructurado en servidor para:

- login
- registro
- recuperacion de contrasena
- operaciones `POST`, `PUT`, `PATCH`, `DELETE`

Campos registrados:

- servicio
- metodo
- ruta
- codigo de respuesta
- actor autenticado si existe
- IP
- user-agent
- timestamp

Variables nuevas por servicio:

- `*_SERVICE_REQUEST_BODY_LIMIT`

### 6. Fechas y cronograma

`fechas-service` se mantuvo y quedo como agregador de agenda sin duplicar data de base.

Funcion actual:

- consume conferencias publicadas desde `conferencias-service`
- construye `GET /fechas/master-agenda`
- agrupa por las fechas oficiales:
  - `2026-09-30`
  - `2026-10-01`
  - `2026-10-02`

Esto respeta separacion de responsabilidades sin crear otra fuente de verdad.

## Archivos principales modificados

### Auth

- `auth-service/server.js`
- `auth-service/.env.example`
- `auth-service/src/config/env.js`
- `auth-service/src/middleware/auth.middleware.js`
- `auth-service/src/middleware/request-limit.middleware.js`
- `auth-service/src/routes/auth.routes.js`
- `auth-service/src/services/token.service.js`

### Conferencias

- `conferencias-service/server.js`
- `conferencias-service/.env.example`
- `conferencias-service/src/config/env.js`
- `conferencias-service/src/middleware/request-limit.middleware.js`
- `conferencias-service/src/routes/conferencias.routes.js`

### Conferencistas

- `conferencistas-service/server.js`
- `conferencistas-service/.env.example`
- `conferencistas-service/src/config/env.js`
- `conferencistas-service/src/middleware/request-limit.middleware.js`
- `conferencistas-service/src/routes/conferencistas.routes.js`

### Fechas

- `fechas-service/server.js`
- `fechas-service/.env.example`
- `fechas-service/src/config/env.js`
- `fechas-service/src/middleware/request-limit.middleware.js`
- `fechas-service/src/routes/fechas.routes.js`

## Cambios operativos recomendados

### 1. Usuario de base de datos

Los `.env.example` y `docker-compose.yml` ya quedaron orientados a no usar `root` como usuario de aplicacion.

Usuario recomendado:

- `coniiti_app`

Ejemplo de creacion:

```sql
CREATE USER 'coniiti_app'@'%' IDENTIFIED BY 'cambia-esta-clave';

GRANT SELECT, INSERT, UPDATE, DELETE ON CONIITI_AUTH.* TO 'coniiti_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON CONIITI_CONFERENCIAS.* TO 'coniiti_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON CONIITI_CONFERENCISTAS.* TO 'coniiti_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON CONIITI_FECHAS.* TO 'coniiti_app'@'%';

FLUSH PRIVILEGES;
```

Provision automatizada agregada:

- `database/003_coniiti_security.sql`

### 2. Docker y contenedores

Se endurecio:

- ejecucion como usuario `node`
- bind local de puertos `127.0.0.1`
- separacion de usuario root de MySQL y usuario de aplicacion
- bandera `*_DB_BOOTSTRAP=false` para evitar privilegios innecesarios en runtime

### 3. Secretos

Antes de produccion:

- cambiar `JWT_SECRET`
- cambiar passwords por defecto
- mover secretos reales a variables de entorno del servidor o gestor de secretos
- reemplazar `coniiti_app_2026!` y `root`

### 4. Carga masiva

Todavia no existe importador masivo formal. La recomendacion es implementar luego:

- importador CSV/Excel
- validacion por fila
- preview
- upsert
- reporte de errores

## Riesgos reducidos con esta iteracion

- abuso de login y registro
- payloads excesivos
- escritura sin autenticacion
- escritura sin rol adecuado
- errores demasiado verbosos
- cacheo de respuestas sensibles
- entrada malformada en rutas criticas
- persistencia innecesaria de token en navegador
- uso directo de root por microservicios en Docker
- exposicion de puertos en todas las interfaces de red
- ausencia de trazabilidad de operaciones sensibles
- dependencia con vulnerabilidades conocidas de produccion

## Riesgos residuales

El proyecto queda listo para entrega tecnica del alcance actual, pero hay riesgos residuales normales de una siguiente fase de produccion:

- refresh tokens o revocacion centralizada de sesiones
- auditoria persistente en tabla o SIEM
- importacion masiva segura
- politicas de backup automatizadas
- despliegue con HTTPS real y proxy inverso
- escaneo automatizado de dependencias en CI
- WAF, IDS o monitoreo de infraestructura externo

## Verificacion realizada

Comandos ejecutados:

```bash
node -e "require('./auth-service/src/routes/auth.routes')"
node -e "require('./conferencias-service/src/routes/conferencias.routes')"
node -e "require('./conferencistas-service/src/routes/conferencistas.routes')"
node -e "require('./fechas-service/src/routes/fechas.routes')"
npm run frontend:build
docker compose up -d --build auth-service conferencias-service conferencistas-service fechas-service frontend
npm run test:e2e
```

Resultado:

- frontend compila correctamente
- los 4 tests E2E pasaron
- los 4 microservicios levantan y responden `health`
- `fechas-service` responde `master-agenda` con 90 conferencias agrupadas en 3 dias
- `npm audit --omit=dev` sin vulnerabilidades de produccion en auth, conferencias, conferencistas, fechas y frontend
- Docker ejecutando servicios Node como usuario no root
- microservicios funcionando con `coniiti_app` en lugar de `root`

## Estado final para entrega

Dentro del alcance actual del proyecto web, la implementacion queda cerrada con una base de seguridad profesional y coherente con SSDF.

Estado recomendado para presentar:

- seguridad base del software: cerrada
- seguridad de API y microservicios: cerrada
- seguridad de sesion en frontend: cerrada
- seguridad de dependencias: cerrada
- seguridad operativa minima en Docker/MySQL: cerrada
- fase futura de operacion productiva avanzada: documentada
