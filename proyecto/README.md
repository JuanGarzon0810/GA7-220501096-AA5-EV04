# BARBIERE 11 — Sistema Web Administrativo para Barberías

**Evidencia:** GA7-220501096-AA5-EV03. Diseño y desarrollo de servicios web – proyecto.
**Proyecto:** BARBIERE 11
**Aprendiz:** Juan Esteban Garzón Riaño
**Ficha:** 3186590
**Instructor:** José Hoover Marmolejo Betancourt
**SENA — Tecnología en Análisis y Desarrollo de Software**

> 📄 **Documentación de todos los servicios (API):** ver [`docs/API.md`](docs/API.md).
> Incluye los 8 servicios del proyecto (40 endpoints), organizados por módulo,
> con ejemplos de petición/respuesta, códigos de estado y reglas de negocio.
>
> 🧪 **Colección de pruebas de Postman:** [`docs/coleccion_postman_completa.json`](docs/coleccion_postman_completa.json)
> — 47 peticiones con aserciones automatizadas, verificadas con **47/47 exitosas**
> contra el backend real (ejecutado con Newman, el motor oficial de Postman).

## 1. Descripción general

BARBIERE 11 es un sistema web responsive para la administración integral de una
barbería. Permite gestionar clientes, citas, servicios, barberos, pagos e
inventario, y genera reportes de desempeño del negocio.

Este repositorio contiene la **implementación completa del sistema**, construida
de forma incremental módulo por módulo sobre el mismo stack tecnológico definido
en el documento de análisis y diseño del proyecto:

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS, sin frameworks, consumo de
  API REST con `fetch`)
- **Backend:** Node.js + Express (arquitectura MVC)
- **Base de datos:** MySQL / MariaDB
- **Autenticación:** JWT (JSON Web Tokens) + contraseñas cifradas con bcrypt

La identidad visual (fondo negro, acentos dorados, tipografía Poppins) y la
estructura de pantallas siguen fielmente los wireframes definidos en la etapa
de diseño del proyecto.

## 2. Módulos incluidos

| Módulo | Requisitos funcionales cubiertos |
|---|---|
| Autenticación | RF01 (Iniciar sesión), RF02 (Cerrar sesión) |
| Clientes | RF03–RF06 (Registrar, editar, eliminar, buscar) |
| Servicios | RF07–RF10 (Registrar, editar, eliminar, mostrar precio/duración) |
| Citas | RF11–RF15 (Registrar, asociar servicio, editar, cancelar, citas diarias) |
| Barberos | RF16–RF17 (Registrar, mostrar citas asignadas) |
| Inventario | RF18–RF19 (Registrar productos, actualizar stock) |
| Pagos | RF20–RF21 (Registrar pagos, ingresos diarios) |
| Reportes | RF22–RF23 (Generar reportes, servicios más vendidos) |
| Dashboard | Panel general con indicadores y gráficas (consume el módulo de Reportes) |

Cada módulo fue construido siguiendo los artefactos de diseño ya elaborados en
el ciclo de vida del proyecto: diagrama de clases, diagrama de casos de uso,
diagramas de secuencia, diagramas de actividades, historias de usuario y
wireframes.

## 3. Estructura del proyecto

```
BARBIERE11/
├── backend/
│   ├── config/
│   │   └── db.js                    # Pool de conexiones a MySQL
│   ├── middlewares/
│   │   └── authMiddleware.js        # Verifica el token JWT en rutas protegidas
│   ├── models/                      # Consultas SQL de cada entidad
│   │   ├── usuarioModel.js
│   │   ├── clienteModel.js
│   │   ├── servicioModel.js
│   │   ├── barberoModel.js
│   │   ├── citaModel.js
│   │   ├── productoModel.js
│   │   └── pagoModel.js
│   ├── controllers/                 # Logica de negocio y validaciones
│   │   ├── authController.js
│   │   ├── clienteController.js
│   │   ├── servicioController.js
│   │   ├── barberoController.js
│   │   ├── citaController.js
│   │   ├── productoController.js
│   │   ├── pagoController.js
│   │   └── reporteController.js
│   ├── routes/                      # Endpoints REST de cada modulo
│   ├── .env.example
│   ├── package.json
│   └── server.js                    # Punto de entrada del backend
├── database/
│   └── barbiere11.sql               # Script de creacion de la BD + datos de prueba
├── frontend/
│   ├── css/
│   │   ├── style.css                # Identidad visual + layout (sidebar/topbar)
│   │   └── login.css
│   ├── js/
│   │   ├── auth.js                  # Login, logout, proteccion de paginas
│   │   ├── sidebar.js               # Menu lateral y barra superior compartidos
│   │   └── [modulo].js              # Un archivo JS por cada pantalla
│   ├── login.html
│   ├── dashboard.html
│   ├── clientes.html
│   ├── servicios.html
│   ├── barberos.html
│   ├── citas.html
│   ├── inventario.html
│   ├── pagos.html
│   └── reportes.html
├── .gitignore
└── README.md
```

## 4. Instalación y ejecución

### Requisitos previos
- Node.js 18+
- MySQL 8+ o MariaDB 10.6+

### Pasos

1. **Crear la base de datos**

   ```bash
   mysql -u root -p < database/barbiere11.sql
   ```

   Esto crea la base `barbiere11`, todas las tablas y carga datos de prueba,
   incluyendo un usuario administrador:

   - **Correo:** `admin@barbiere11.com`
   - **Contraseña:** `admin123`

2. **Configurar variables de entorno**

   Dentro de `backend/`, copiar `.env.example` a `.env` y ajustar las
   credenciales de la base de datos y la clave `JWT_SECRET`.

   > Recomendación de seguridad: en lugar de usar el usuario `root` de MySQL,
   > crea un usuario dedicado para la aplicación, por ejemplo:
   > ```sql
   > CREATE USER 'barbiere_app'@'%' IDENTIFIED BY 'una_clave_segura';
   > GRANT ALL PRIVILEGES ON barbiere11.* TO 'barbiere_app'@'%';
   > FLUSH PRIVILEGES;
   > ```

3. **Instalar dependencias**

   ```bash
   cd backend
   npm install
   ```

4. **Ejecutar el servidor**

   ```bash
   npm start
   ```

5. **Abrir en el navegador**

   ```
   http://localhost:3000
   ```

   La raíz del sitio redirige automáticamente a la pantalla de inicio de
   sesión.

## 5. Arquitectura del backend

El backend sigue una arquitectura **MVC en capas**:

```
Petición HTTP → Rutas → Middleware de autenticación → Controlador → Modelo → MySQL
```

- **Rutas** (`routes/`): definen los endpoints y los protegen con el
  middleware `verificarToken` cuando corresponde.
- **Controladores** (`controllers/`): validan los datos de entrada, aplican
  las reglas de negocio (por ejemplo, evitar cruces de horario en citas) y
  construyen la respuesta HTTP.
- **Modelos** (`models/`): son los únicos archivos que contienen sentencias
  SQL, siempre parametrizadas para prevenir inyección SQL.

### Autenticación

El login (RF01) genera un token JWT firmado con `JWT_SECRET` que el frontend
guarda en `sessionStorage` y envía en cada petición mediante el header
`Authorization: Bearer <token>`. El middleware `authMiddleware.js` verifica
ese token en todas las rutas de negocio; si es inválido o no existe, la
petición se rechaza con `401`. Cerrar sesión (RF02) elimina el token del
navegador.

### Reglas de negocio destacadas

- **Citas sin cruce de horario:** al registrar o editar una cita, el sistema
  valida que el barbero seleccionado no tenga ya una cita en la misma fecha y
  hora (Historia de Usuario 4), devolviendo un error `409` si existe conflicto.
- **Pago finaliza la cita:** al registrar un pago (RF20), la cita asociada
  cambia automáticamente su estado a `finalizada`.
- **Stock nunca negativo:** la actualización de inventario (RF19) rechaza
  operaciones que dejarían el stock por debajo de cero.

## 6. Estándares de codificación aplicados

- Nomenclatura en español y camelCase para variables y funciones.
- Separación estricta en capas (rutas → controladores → modelo → base de datos).
- Comentarios JSDoc en cada función explicando propósito, parámetros y retorno.
- Validación de datos de entrada en el backend antes de tocar la base de datos.
- Manejo centralizado de errores con respuestas HTTP coherentes.
- Consultas parametrizadas (`?`) en todas las sentencias SQL.
- Escape de HTML en el frontend antes de pintar datos del servidor.
- Un módulo JS por pantalla, sin lógica duplicada (el layout de navegación se
  comparte mediante `sidebar.js`).

## 7. Pruebas realizadas

Antes de la entrega, el sistema fue probado de extremo a extremo contra una
base de datos MySQL real, verificando:

- Login con credenciales correctas e incorrectas.
- Bloqueo de rutas protegidas sin token.
- CRUD completo de clientes, servicios, barberos, citas, productos y pagos.
- Validaciones de negocio (cruce de horarios, stock negativo, campos
  obligatorios).
- Actualización automática del estado de una cita al registrar su pago.
- Generación correcta de los reportes de ingresos y servicios más vendidos.
- Que todas las páginas HTML y archivos estáticos del frontend se sirven
  correctamente desde el backend.

## 8. Control de versiones

Este proyecto se gestiona con **Git** y debe alojarse en **GitHub**, tal como
se definió en la sección "Versionamiento" del plan de trabajo del proyecto.

Para subirlo a un repositorio remoto:

```bash
git remote add origin https://github.com/TU-USUARIO/barbiere11.git
git push -u origin main
```
