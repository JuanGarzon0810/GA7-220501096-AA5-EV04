-- =========================================================
-- Proyecto: BARBIERE 11
-- Archivo: barbiere11.sql
-- Descripcion: Script de creacion de la base de datos
--              tomando como base el modelo Entidad-Relacion
--              y el diccionario de datos definido en el
--              documento de analisis y diseno del proyecto.
-- Autor: Juan Esteban Garzon Riano
-- Ficha: 3186590
-- =========================================================

-- Se crea la base de datos si no existe
CREATE DATABASE IF NOT EXISTS barbiere11
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE barbiere11;

-- ---------------------------------------------------------
-- Tabla: usuarios
-- Almacena los usuarios que pueden autenticarse en el sistema
-- (administrador, barbero, etc.)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- contraseña cifrada (bcrypt)
    rol VARCHAR(30) NOT NULL DEFAULT 'administrador',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Tabla: clientes
-- Modulo desarrollado en esta evidencia (RF03, RF04, RF05, RF06)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- Tabla: servicios
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    duracion INT NOT NULL, -- duracion en minutos
    descripcion TEXT
);

-- ---------------------------------------------------------
-- Tabla: barberos
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS barberos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(20)
);

-- ---------------------------------------------------------
-- Tabla: citas
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    servicio_id INT NOT NULL,
    barbero_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    CONSTRAINT fk_citas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_citas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_citas_barbero FOREIGN KEY (barbero_id) REFERENCES barberos(id)
        ON DELETE RESTRICT
);

-- ---------------------------------------------------------
-- Tabla: productos (inventario)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    precio DECIMAL(10,2) NOT NULL
);

-- ---------------------------------------------------------
-- Tabla: pagos
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cita_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    fecha DATE NOT NULL,
    CONSTRAINT fk_pagos_cita FOREIGN KEY (cita_id) REFERENCES citas(id)
        ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Datos de prueba para el modulo de USUARIOS
-- Usuario: admin@barbiere11.com | Contrasena: admin123
-- (la contrasena esta cifrada con bcrypt, nunca se guarda en texto plano)
-- ---------------------------------------------------------
INSERT INTO usuarios (nombre, correo, password, rol) VALUES
('Administrador', 'admin@barbiere11.com', '$2b$10$e0YbpUptDqvc7C6sp90F9u3ekjHoLZpyCvbahgRMQUt4FvLWO.u6O', 'administrador');

-- ---------------------------------------------------------
-- Datos de prueba para el modulo de CLIENTES
-- ---------------------------------------------------------
INSERT INTO clientes (nombre, telefono, correo) VALUES
('Carlos Ramirez', '3001234567', 'carlos.ramirez@mail.com'),
('Andres Torres', '3009876543', 'andres.torres@mail.com'),
('Felipe Gomez', '3012223344', 'felipe.gomez@mail.com');

-- ---------------------------------------------------------
-- Datos de prueba para el modulo de SERVICIOS
-- ---------------------------------------------------------
INSERT INTO servicios (nombre, precio, duracion, descripcion) VALUES
('Peluqueada', 25000, 30, 'Corte de cabello clasico'),
('Peluqueada + Barba', 35000, 45, 'Corte de cabello y arreglo de barba'),
('Barba', 18000, 20, 'Perfilado y arreglo de barba'),
('Cejas', 12000, 15, 'Perfilado de cejas'),
('Tintura', 45000, 40, 'Aplicacion de tinte para cabello o barba');

-- ---------------------------------------------------------
-- Datos de prueba para el modulo de BARBEROS
-- ---------------------------------------------------------
INSERT INTO barberos (nombre, especialidad, telefono) VALUES
('Miguel Angel Ospina', 'Cortes clasicos', '3015558822'),
('Santiago Rios', 'Barbas y diseno', '3024447711');

-- ---------------------------------------------------------
-- Datos de prueba para el modulo de PRODUCTOS (inventario)
-- ---------------------------------------------------------
INSERT INTO productos (nombre, stock, precio) VALUES
('Cera para cabello', 15, 22000),
('Aceite para barba', 10, 18000),
('Shampoo profesional', 8, 25000);
