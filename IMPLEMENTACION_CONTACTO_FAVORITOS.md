# Implementacion Contacto y Favoritos

## Resumen

Se implementaron tres ajustes funcionales sobre CONIITI:

1. Nuevo microservicio `contacto-service` para persistir los mensajes del formulario de contacto.
2. Favoritos de conferencias por usuario autenticado.
3. Ajuste estructural del frontend para que `Contacto` quede funcional y el footer siga presente en todos los modulos.

## 1. Nuevo microservicio `contacto-service`

### Estructura creada

- `contacto-service/server.js`
- `contacto-service/src/config/env.js`
- `contacto-service/src/middleware/auth.middleware.js`
- `contacto-service/src/middleware/request-limit.middleware.js`
- `contacto-service/src/repositories/contact-memory.repository.js`
- `contacto-service/src/repositories/contact-mysql.repository.js`
- `contacto-service/src/repositories/index.js`
- `contacto-service/src/routes/contacto.routes.js`
- `contacto-service/.env.example`

### Persistencia

Se creo la base:

- `CONIITI_CONTACTO`

Y la tabla:

- `contact_messages`

Campos:

- `id`
- `first_name`
- `last_name`
- `email`
- `institution`
- `inquiry_type`
- `message`
- `created_at`

### Endpoints

- `GET /health`
- `POST /contacto/messages`
  - publico
  - registra mensajes del formulario
- `GET /contacto/messages`
  - protegido
  - solo `admin` y `organizer`
  - pensado para consulta administrativa

### Seguridad aplicada

- `helmet`
- CORS restringido
- `Cache-Control: no-store`
- rate limit para envios del formulario
- validacion de payload
- audit log en operaciones de escritura

## 2. Favoritos de conferencias

### Backend

Se agrego soporte en `auth-service`.

Tabla nueva en `CONIITI_AUTH`:

- `favorite_conferences`

Campos:

- `id`
- `user_id`
- `conference_id`
- `created_at`

### Endpoints nuevos

- `GET /auth/me/favorite-conferences`
- `POST /auth/me/favorite-conferences`
- `DELETE /auth/me/favorite-conferences/:conferenceId`

### Comportamiento

- los favoritos quedan asociados al usuario autenticado
- si el usuario no ha iniciado sesion, al intentar marcar favorito se abre autenticacion

## 3. Frontend

### Contacto

Se rehizo el bloque real de `Contacto` para que deje de depender del layout viejo por columnas.

Ahora:

- el formulario es controlado
- envia datos a `contacto-service`
- muestra feedback de exito o error
- prellena `nombre`, `apellido` y `correo` cuando hay sesion

### Conferencias

Se agrego:

- filtro `Favoritos` en el directorio
- marcador visual de conferencia favorita
- accion `Agregar a favoritos` / `Quitar de favoritos`

### Cronograma

Se agrego:

- cuarta vista `Favoritos` junto a las 3 fechas
- accion de favorito dentro del detalle de cada conferencia

### Footer

El footer se mantiene presente en todas las vistas principales:

- Inicio
- Conferencias
- Cronograma
- Conferencistas
- Comite
- Guia de participacion
- Boleteria
- Lineas tematicas
- Nosotros
- Contacto

## 4. Docker y configuracion

Se actualizo:

- `docker-compose.yml`
- `frontend/.env.example`
- `package.json`
- `scripts/run-all.js`
- `Dockerfile`

Se agrego el servicio:

- `contacto-service` en puerto `3007`

Variables frontend nuevas:

- `VITE_CONTACT_API_URL=http://127.0.0.1:3007`

## 5. Scripts SQL actualizados

- `database/001_coniiti_databases.sql`
  - nueva base `CONIITI_CONTACTO`
  - tabla `contact_messages`
  - tabla `favorite_conferences`

- `database/003_coniiti_security.sql`
  - grant para `CONIITI_CONTACTO`

- `auth-service/sql/001_schema.sql`
  - tabla `favorite_conferences`

## 6. Validacion realizada

### Frontend

- `npm run build` en `frontend`
- `npm run test:e2e` en `frontend`

Resultado:

- `4 passed`

### Docker

Se levanto el stack con:

```bash
docker compose up -d --build mysql auth-service conferencias-service conferencistas-service fechas-service contacto-service frontend
```

Validaciones puntuales:

- `GET http://127.0.0.1:3003/health`
- `GET http://127.0.0.1:3007/health`
- `POST http://127.0.0.1:3007/contacto/messages`
- login y alta/baja de favoritos en `auth-service`

## 7. Como probar manualmente

### Contacto

1. Abrir `http://127.0.0.1:5173`
2. Ir a `Contacto`
3. Completar el formulario
4. Enviar
5. Verificar mensaje de exito

### Favoritos

1. Iniciar sesion
2. Ir a `Conferencias`
3. Marcar una o varias conferencias como favoritas
4. Abrir el filtro `Favoritos`
5. Ir a `Cronograma`
6. Abrir la pestaña `Favoritos`

## 8. Nota de arquitectura

Los favoritos se implementaron dentro de `auth-service` porque pertenecen a la relacion:

- usuario
- preferencia personal

Eso evita duplicar identidad en otro microservicio y mantiene el modelo mas limpio.
