/**
 * server.js
 * ------------------------------------------------------------------
 * Punto de entrada del backend de BARBIERE 11.
 * Configura Express, los middlewares globales, sirve el frontend
 * estatico y monta las rutas del modulo de Clientes.
 * ------------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const barberoRoutes = require('./routes/barberoRoutes');
const citaRoutes = require('./routes/citaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();
const PUERTO = process.env.PORT || 3000;

// ----------------------- Middlewares -----------------------
app.use(cors());               // Permite peticiones desde el frontend
app.use(express.json());       // Parsea el body de las peticiones en formato JSON

// Sirve los archivos estaticos del frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// La raiz del sitio redirige a la pantalla de inicio de sesion
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// ------------------------- Rutas de la API -----------------------------
// Modulo de autenticacion (RF01, RF02) - no requiere token para /login
app.use('/api/auth', authRoutes);

// Modulos funcionales del sistema (todos protegidos por JWT)
app.use('/api/clientes', clienteRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/barberos', barberoRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de verificacion de estado de la API
app.get('/api/estado', (req, res) => {
    res.json({ ok: true, mensaje: 'API de BARBIERE 11 funcionando correctamente.' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ ok: false, mensaje: 'Recurso no encontrado.' });
});

// ------------------------- Inicio ------------------------------
app.listen(PUERTO, () => {
    console.log(`Servidor BARBIERE 11 escuchando en http://localhost:${PUERTO}`);
});
