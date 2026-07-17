# Documentación de la API — BARBIERE 11 (Sistema Completo)

**Evidencia:** GA7-220501096-AA5-EV03. Diseño y desarrollo de servicios web – proyecto.

Este documento describe **todos los servicios web (API REST)** construidos para
cubrir las características funcionales del proyecto formativo BARBIERE 11,
según el documento de análisis (requisitos funcionales RF01–RF23).

**URL Base (entorno local):** `http://localhost:3000/api`

## Convenciones generales

Todas las respuestas son en formato **JSON** con la estructura:

```json
{ "ok": true, "mensaje": "...", "data": { } }
```

- `ok`: booleano que indica éxito o fracaso de la operación.
- `mensaje`: texto descriptivo (presente sobre todo en operaciones de
  escritura o error).
- `data`: el recurso solicitado o creado (cuando aplica).

**Autenticación:** todos los servicios, excepto `POST /api/auth/login`,
requieren un token JWT obtenido en el login, enviado en el header:

```
Authorization: Bearer <token>
```

Si el token falta o es inválido, cualquier endpoint protegido responde
`401 Unauthorized`.

**Códigos de estado HTTP usados en todo el sistema:**

| Código | Significado |
|---|---|
| 200 | Operación exitosa (consulta, actualización) |
| 201 | Recurso creado exitosamente |
| 400 | Datos de entrada inválidos |
| 401 | No autenticado / token inválido o ausente |
| 404 | Recurso no encontrado |
| 409 | Conflicto (p. ej. horario ocupado, usuario ya autenticado con ese registro) |
| 500 | Error interno del servidor |

---

## Índice de servicios

| # | Servicio | Prefijo | Requisitos funcionales cubiertos |
|---|---|---|---|
| 1 | Autenticación | `/api/auth` | RF01, RF02 |
| 2 | Clientes | `/api/clientes` | RF03–RF06 |
| 3 | Servicios (de barbería) | `/api/servicios` | RF07–RF10 |
| 4 | Barberos | `/api/barberos` | RF16, RF17 |
| 5 | Citas | `/api/citas` | RF11–RF15 |
| 6 | Inventario (Productos) | `/api/productos` | RF18, RF19 |
| 7 | Pagos | `/api/pagos` | RF20, RF21 |
| 8 | Reportes | `/api/reportes` | RF22, RF23 |

---

## 1. Servicio de Autenticación — `/api/auth`

Gestiona el inicio y cierre de sesión de los usuarios administradores del
sistema (RF01, RF02).

### 1.1 Iniciar sesión
`POST /api/auth/login` — No requiere token.

Body:
```json
{ "correo": "admin@barbiere11.com", "password": "admin123" }
```

Respuesta 200 OK:
```json
{
  "ok": true,
  "mensaje": "Acceso concedido.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": { "id": 1, "nombre": "Administrador", "correo": "admin@barbiere11.com", "rol": "administrador" }
  }
}
```

Errores: `400` (faltan credenciales), `401` (correo o contraseña incorrectos).

### 1.2 Obtener perfil del usuario autenticado
`GET /api/auth/perfil` — Requiere token.

Respuesta 200 OK:
```json
{ "ok": true, "data": { "id": 1, "nombre": "Administrador", "correo": "admin@barbiere11.com", "rol": "administrador" } }
```

### 1.3 Cerrar sesión
`POST /api/auth/logout` — Requiere token.

Respuesta 200 OK:
```json
{ "ok": true, "mensaje": "Sesión cerrada correctamente." }
```

---

## 2. Servicio de Clientes — `/api/clientes`

CRUD y búsqueda de clientes (RF03–RF06). Todas las rutas requieren token.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/clientes` | Lista todos los clientes. Admite `?buscar=texto` (RF06) |
| GET | `/api/clientes/:id` | Obtiene un cliente por id |
| POST | `/api/clientes` | Registra un cliente (RF03) |
| PUT | `/api/clientes/:id` | Edita un cliente (RF04) |
| DELETE | `/api/clientes/:id` | Elimina un cliente (RF05) |

Body para crear/editar:
```json
{ "nombre": "Carlos Ramirez", "telefono": "3001234567", "correo": "carlos@mail.com" }
```

Reglas de validación: nombre ≥ 3 caracteres; teléfono con formato numérico
(7 a 20 dígitos, admite `+`, espacios y guiones); correo opcional.

Respuesta 201 (creación exitosa):
```json
{ "ok": true, "mensaje": "Cliente registrado correctamente.", "data": { "id": 4, "nombre": "Carlos Ramirez", "...": "..." } }
```

---

## 3. Servicio de Servicios de Barbería — `/api/servicios`

CRUD de los servicios que ofrece la barbería (corte, barba, etc.), cubriendo
RF07–RF10. Todas las rutas requieren token.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/servicios` | Lista todos los servicios (muestra precio y duración, RF10) |
| GET | `/api/servicios/:id` | Obtiene un servicio por id |
| POST | `/api/servicios` | Registra un servicio (RF07) |
| PUT | `/api/servicios/:id` | Edita un servicio (RF08) |
| DELETE | `/api/servicios/:id` | Elimina un servicio (RF09) |

Body para crear/editar:
```json
{ "nombre": "Peluqueada", "precio": 25000, "duracion": 30, "descripcion": "Corte clásico" }
```

Nota: si el servicio tiene citas asociadas, el DELETE responde `409` en
lugar de romper la integridad referencial de la base de datos.

---

## 4. Servicio de Barberos — `/api/barberos`

Gestión del personal de barbería (RF16) y consulta de sus citas asignadas
(RF17). Todas las rutas requieren token.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/barberos` | Lista todos los barberos |
| GET | `/api/barberos/:id` | Obtiene un barbero por id |
| GET | `/api/barberos/:id/citas` | Lista las citas asignadas a un barbero (RF17) |
| POST | `/api/barberos` | Registra un barbero (RF16) |
| PUT | `/api/barberos/:id` | Edita un barbero |
| DELETE | `/api/barberos/:id` | Elimina un barbero |

Body para crear/editar:
```json
{ "nombre": "Miguel Ospina", "especialidad": "Cortes clásicos", "telefono": "3015558822" }
```

---

## 5. Servicio de Citas — `/api/citas`

El servicio más completo del sistema: registrar, asociar servicios, editar,
cancelar y filtrar citas (RF11–RF15). Todas las rutas requieren token.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/citas` | Lista todas las citas. Admite `?fecha=YYYY-MM-DD` (RF15) |
| GET | `/api/citas/:id` | Obtiene una cita por id |
| POST | `/api/citas` | Registra una cita (RF11, RF12) |
| PUT | `/api/citas/:id` | Edita una cita (RF13) |
| PATCH | `/api/citas/:id/estado` | Cambia el estado / cancela una cita (RF14) |
| DELETE | `/api/citas/:id` | Elimina una cita definitivamente |

Body para crear/editar:
```json
{ "clienteId": 1, "servicioId": 2, "barberoId": 1, "fecha": "2026-07-15", "hora": "10:00" }
```

Body para cambiar estado:
```json
{ "estado": "cancelada" }
```
Valores válidos de `estado`: `pendiente`, `en_proceso`, `finalizada`, `cancelada`.

**Regla de negocio clave:** el sistema valida que el barbero seleccionado no
tenga ya una cita en la misma fecha y hora (Historia de Usuario 4). Si existe
un cruce, responde `409 Conflict`:
```json
{ "ok": false, "mensaje": "El barbero seleccionado ya tiene una cita en ese horario." }
```

---

## 6. Servicio de Inventario — `/api/productos`

Registro de productos y control de stock (RF18, RF19). Todas las rutas
requieren token.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista todos los productos |
| GET | `/api/productos/:id` | Obtiene un producto por id |
| POST | `/api/productos` | Registra un producto (RF18) |
| PUT | `/api/productos/:id` | Edita nombre/stock/precio |
| PATCH | `/api/productos/:id/stock` | Actualiza solo el stock (RF19) |
| DELETE | `/api/productos/:id` | Elimina un producto |

Body para crear/editar:
```json
{ "nombre": "Cera para cabello", "stock": 15, "precio": 22000 }
```

Body para actualizar stock (suma o resta unidades):
```json
{ "cantidad": -3 }
```
El servicio rechaza (`409`) cualquier operación que deje el stock en un
valor negativo.

---

## 7. Servicio de Pagos — `/api/pagos`

Registro de pagos asociados a una cita y consulta de ingresos diarios
(RF20, RF21). Todas las rutas requieren token.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/pagos/ingresos/hoy` | Ingresos del día actual. Admite `?fecha=YYYY-MM-DD` (RF21) |
| GET | `/api/pagos` | Lista todos los pagos registrados |
| GET | `/api/pagos/:id` | Obtiene un pago por id |
| POST | `/api/pagos` | Registra un pago (RF20) |
| DELETE | `/api/pagos/:id` | Elimina un registro de pago |

Body para crear:
```json
{ "citaId": 1, "total": 25000, "metodoPago": "efectivo", "fecha": "2026-07-15" }
```
Métodos de pago válidos: `efectivo`, `transferencia`, `tarjeta`.

**Efecto colateral documentado:** al registrar un pago exitosamente, la cita
asociada cambia automáticamente su estado a `finalizada`.

---

## 8. Servicio de Reportes — `/api/reportes`

Servicios de solo lectura que agregan información de otros módulos para
alimentar el Dashboard y la pantalla de Reportes (RF22, RF23). Todas las
rutas requieren token.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/reportes/resumen-dashboard` | Indicadores generales: total clientes, total citas, ingresos acumulados, citas de hoy |
| GET | `/api/reportes/servicios-mas-vendidos` | Cantidad de citas e ingresos generados por cada servicio (RF23) |
| GET | `/api/reportes/ingresos-por-mes` | Ingresos agrupados por mes (RF22) |
| GET | `/api/reportes/citas-por-estado` | Cantidad de citas agrupadas por estado |

Ejemplo de respuesta de `resumen-dashboard`:
```json
{
  "ok": true,
  "data": { "totalClientes": 3, "totalCitas": 5, "totalIngresos": 75000, "citasHoy": 2 }
}
```

---

## Arquitectura común a todos los servicios

Todos los servicios siguen la misma arquitectura en capas:

```
Petición HTTP → Rutas (routes/) → Middleware de autenticación → Controlador (controllers/) → Modelo (models/) → MySQL
```

- **Rutas**: declaran los endpoints y aplican `verificarToken` a nivel de
  router (`router.use(verificarToken)`).
- **Controladores**: validan la entrada, aplican las reglas de negocio y
  arman la respuesta HTTP.
- **Modelos**: son los únicos archivos con sentencias SQL, siempre
  parametrizadas.

## Herramientas de prueba incluidas

- `docs/coleccion_postman_completa.json`: colección de Postman con **todas**
  las peticiones de los 8 servicios, lista para importar.
- Consultar también el README del proyecto para instrucciones de
  instalación y ejecución.
