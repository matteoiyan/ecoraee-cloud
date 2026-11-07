PRAGMA foreign_keys=ON;
-- 2. Crear tablas

-- Actor del ecosistema: generador, centro de recolección, reacondicionador, gestor de reciclaje o beneficiaria.
CREATE TABLE organizacion (
    id_organizacion             INTEGER PRIMARY KEY AUTOINCREMENT,
    ruc                         CHAR(13) NOT NULL UNIQUE,
    razon_social                VARCHAR(150) NOT NULL,
    tipo                        VARCHAR(25) NOT NULL CHECK (tipo IN ('GENERADOR', 'CENTRO_RECOLECCION', 'REACONDICIONADOR', 'GESTOR_RECICLAJE', 'BENEFICIARIA')),
    telefono                    VARCHAR(15),
    email                       VARCHAR(120)
);

-- Clasificación del residuo según su tipo y peligrosidad.
CREATE TABLE categoria_raee (
    id_categoria                INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre                      VARCHAR(80) NOT NULL UNIQUE,
    descripcion                 VARCHAR(250),
    peligrosidad                VARCHAR(10) NOT NULL CHECK (peligrosidad IN ('BAJA', 'MEDIA', 'ALTA'))
);

-- Catálogo de rutas de tratamiento: reacondicionamiento, reciclaje, disposición controlada, donación.
CREATE TABLE tipo_tratamiento (
    id_tipo_tratamiento         INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre                      VARCHAR(40) NOT NULL UNIQUE,
    descripcion                 VARCHAR(250)
);

-- Punto físico de una organización; es un nodo de la red de recolección y destinos.
CREATE TABLE sede (
    id_sede                     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_organizacion             INT NOT NULL REFERENCES organizacion(id_organizacion),
    nombre                      VARCHAR(100) NOT NULL,
    direccion                   VARCHAR(200) NOT NULL,
    ciudad                      VARCHAR(60) NOT NULL,
    tipo_nodo                   VARCHAR(20) NOT NULL CHECK (tipo_nodo IN ('FUENTE', 'ACOPIO', 'TRANSFERENCIA', 'DESTINO')),
    capacidad_kg_mes            DECIMAL(10,2) NOT NULL CHECK (capacidad_kg_mes >= 0)
);

-- Persona que opera la plataforma dentro de una organización (operador, técnico, auditor).
CREATE TABLE usuario (
    id_usuario                  INTEGER PRIMARY KEY AUTOINCREMENT,
    id_organizacion             INT NOT NULL REFERENCES organizacion(id_organizacion),
    cedula                      CHAR(10) NOT NULL UNIQUE,
    nombres                     VARCHAR(80) NOT NULL,
    apellidos                   VARCHAR(80) NOT NULL,
    email                       VARCHAR(120) NOT NULL UNIQUE,
    rol                         VARCHAR(20) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'OPERADOR', 'TECNICO', 'AUDITOR'))
);

-- Arista dirigida entre dos sedes con capacidad; base del grafo para flujo máximo / corte mínimo.
CREATE TABLE ruta (
    id_ruta                     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sede_origen              INT NOT NULL REFERENCES sede(id_sede),
    id_sede_destino             INT NOT NULL REFERENCES sede(id_sede),
    capacidad_kg_mes            DECIMAL(10,2) NOT NULL CHECK (capacidad_kg_mes > 0),
    distancia_km                DECIMAL(7,2) NOT NULL CHECK (distancia_km >= 0),
    costo_unitario              DECIMAL(8,2) NOT NULL CHECK (costo_unitario >= 0),
    activa                      BIT NOT NULL DEFAULT 1,
    CHECK (id_sede_origen <> id_sede_destino),
    UNIQUE (id_sede_origen, id_sede_destino)
);

-- Conjunto de dispositivos entregado por un generador y ubicado en una sede.
CREATE TABLE lote (
    id_lote                     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_organizacion_generador   INT NOT NULL REFERENCES organizacion(id_organizacion),
    id_sede_actual              INT NOT NULL REFERENCES sede(id_sede),
    codigo                      VARCHAR(20) NOT NULL UNIQUE,
    fecha_registro              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    peso_total_kg               DECIMAL(10,2) NOT NULL CHECK (peso_total_kg > 0),
    estado                      VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO' CHECK (estado IN ('REGISTRADO', 'RECIBIDO', 'EN_TRASLADO', 'EN_PROCESO', 'CERRADO'))
);

-- Movimiento de un lote por una ruta de la red; representa el flujo real sobre la arista.
CREATE TABLE traslado (
    id_traslado                 INTEGER PRIMARY KEY AUTOINCREMENT,
    id_lote                     INT NOT NULL REFERENCES lote(id_lote),
    id_ruta                     INT NOT NULL REFERENCES ruta(id_ruta),
    fecha_salida                DATETIME NOT NULL,
    fecha_llegada               DATETIME,
    peso_kg                     DECIMAL(10,2) NOT NULL CHECK (peso_kg > 0),
    estado                      VARCHAR(15) NOT NULL DEFAULT 'PROGRAMADO' CHECK (estado IN ('PROGRAMADO', 'EN_CURSO', 'ENTREGADO', 'CANCELADO')),
    CHECK (fecha_llegada >= fecha_salida)
);

-- Equipo eléctrico o electrónico individual; unidad central de la trazabilidad.
CREATE TABLE dispositivo (
    id_dispositivo              INTEGER PRIMARY KEY AUTOINCREMENT,
    id_lote                     INT NOT NULL REFERENCES lote(id_lote),
    id_categoria                INT NOT NULL REFERENCES categoria_raee(id_categoria),
    codigo_trazabilidad         VARCHAR(30) NOT NULL UNIQUE,
    numero_serie                VARCHAR(60),
    marca                       VARCHAR(60),
    modelo                      VARCHAR(60),
    peso_kg                     DECIMAL(8,2) NOT NULL CHECK (peso_kg > 0),
    estado_actual               VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO' CHECK (estado_actual IN ('REGISTRADO', 'RECIBIDO', 'EVALUADO', 'EN_TRATAMIENTO', 'REACONDICIONADO', 'RECICLADO', 'DONADO', 'DISPUESTO', 'CERRADO'))
);

-- Diagnóstico técnico de un dispositivo que recomienda una ruta de tratamiento.
CREATE TABLE evaluacion (
    id_evaluacion               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_dispositivo              INT NOT NULL REFERENCES dispositivo(id_dispositivo),
    id_tecnico                  INT NOT NULL REFERENCES usuario(id_usuario),
    id_tipo_recomendado         INT REFERENCES tipo_tratamiento(id_tipo_tratamiento),
    fecha                       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    condicion                   VARCHAR(15) NOT NULL CHECK (condicion IN ('BUENA', 'REPARABLE', 'DANADA', 'IRRECUPERABLE')),
    es_funcional                BIT NOT NULL,
    datos_borrados              BIT NOT NULL DEFAULT 0,
    observacion                 TEXT
);

-- Proceso aplicado a un dispositivo (reacondicionar, reciclar, disponer o donar) por una organización.
CREATE TABLE tratamiento (
    id_tratamiento              INTEGER PRIMARY KEY AUTOINCREMENT,
    id_dispositivo              INT NOT NULL REFERENCES dispositivo(id_dispositivo),
    id_tipo_tratamiento         INT NOT NULL REFERENCES tipo_tratamiento(id_tipo_tratamiento),
    id_organizacion_ejecutora   INT NOT NULL REFERENCES organizacion(id_organizacion),
    fecha_inicio                DATETIME NOT NULL,
    fecha_fin                   DATETIME,
    resultado                   VARCHAR(15) NOT NULL DEFAULT 'EN_PROCESO' CHECK (resultado IN ('EN_PROCESO', 'EXITOSO', 'FALLIDO')),
    kg_recuperados              DECIMAL(8,2) CHECK (kg_recuperados >= 0),
    CHECK (fecha_fin >= fecha_inicio)
);

-- Registro inmutable de cada cambio de estado de un dispositivo (historial).
CREATE TABLE evento_trazabilidad (
    id_evento                   INTEGER PRIMARY KEY AUTOINCREMENT,
    id_dispositivo              INT NOT NULL REFERENCES dispositivo(id_dispositivo),
    id_usuario                  INT NOT NULL REFERENCES usuario(id_usuario),
    fecha_hora                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_anterior             VARCHAR(20) CHECK (estado_anterior IN ('REGISTRADO', 'RECIBIDO', 'EVALUADO', 'EN_TRATAMIENTO', 'REACONDICIONADO', 'RECICLADO', 'DONADO', 'DISPUESTO', 'CERRADO')),
    estado_nuevo                VARCHAR(20) NOT NULL CHECK (estado_nuevo IN ('REGISTRADO', 'RECIBIDO', 'EVALUADO', 'EN_TRATAMIENTO', 'REACONDICIONADO', 'RECICLADO', 'DONADO', 'DISPUESTO', 'CERRADO')),
    descripcion                 VARCHAR(300)
);

-- Archivo que respalda un evento (foto, acta, certificado); se guarda en almacenamiento de objetos.
CREATE TABLE evidencia (
    id_evidencia                INTEGER PRIMARY KEY AUTOINCREMENT,
    id_evento                   INT NOT NULL REFERENCES evento_trazabilidad(id_evento),
    tipo                        VARCHAR(20) NOT NULL CHECK (tipo IN ('FOTOGRAFIA', 'ACTA', 'CERTIFICADO', 'GUIA_REMISION', 'OTRO')),
    url_archivo                 VARCHAR(500) NOT NULL,
    hash_sha256                 CHAR(64) NOT NULL UNIQUE,
    fecha_carga                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Índices para las búsquedas más frecuentes
CREATE UNIQUE INDEX uq_dispositivo_serie ON dispositivo (numero_serie) WHERE numero_serie IS NOT NULL;
CREATE INDEX idx_dispositivo_lote ON dispositivo (id_lote);
CREATE INDEX idx_dispositivo_estado ON dispositivo (estado_actual);
CREATE INDEX idx_evento_dispositivo ON evento_trazabilidad (id_dispositivo);
CREATE INDEX idx_evaluacion_dispositivo ON evaluacion (id_dispositivo);
CREATE INDEX idx_tratamiento_dispositivo ON tratamiento (id_dispositivo);
CREATE INDEX idx_traslado_lote ON traslado (id_lote);

-- ---------------------------------------------------------------------
-- 4. Datos de prueba
-- ---------------------------------------------------------------------
INSERT INTO organizacion (ruc, razon_social, tipo, telefono, email) VALUES
 ('1790011223001', 'Unidad Educativa Técnica Pichincha', 'GENERADOR',          '022345678', 'ti@uetp.edu.ec'),
 ('1790022334001', 'Hospital del Valle',                 'GENERADOR',          '022456789', 'activos@hvalle.ec'),
 ('1760033445001', 'Punto Limpio Metropolitano',          'CENTRO_RECOLECCION', '023567890', 'operaciones@puntolimpio.ec'),
 ('1790044556001', 'ReTech Ecuador',                      'REACONDICIONADOR',   '024678901', 'taller@retech.ec'),
 ('1790055667001', 'EcoGestión RAEE S.A.',                'GESTOR_RECICLAJE',   '025789012', 'planta@ecogestion.ec'),
 ('1790066778001', 'Fundación Conecta Barrios',           'BENEFICIARIA',       '026890123', 'donaciones@conecta.org.ec');

INSERT INTO sede (id_organizacion, nombre, direccion, ciudad, tipo_nodo, capacidad_kg_mes) VALUES
 (1, 'Campus UETP',            'Av. 10 de Agosto N34-12',   'Quito', 'FUENTE',     900),
 (2, 'Bodega Hospital',        'Av. Interoceánica km 12',   'Quito', 'FUENTE',     1200),
 (3, 'Punto Limpio Norte',     'Av. Eloy Alfaro y Portugal', 'Quito', 'ACOPIO',     1500),
 (3, 'Punto Limpio Sur',       'Av. Maldonado S20-45',      'Quito', 'ACOPIO',     1300),
 (4, 'Taller ReTech',          'Calle Los Pinos E5-18',     'Quito', 'DESTINO',    1000),
 (5, 'Planta EcoGestión',      'Parque Industrial Itulcachi','Quito','DESTINO',    2500),
 (6, 'Bodega Conecta Barrios', 'Calle Chimborazo S3-40',    'Quito', 'DESTINO',    400);

-- Aristas del grafo dirigido (capacidades en kg/mes)
INSERT INTO ruta (id_sede_origen, id_sede_destino, capacidad_kg_mes, distancia_km, costo_unitario) VALUES
 (1, 3, 800, 6.5, 0.12), (1, 4, 500, 11.0, 0.18), (2, 3, 600, 14.2, 0.20), (2, 4, 700, 18.0, 0.22),
 (3, 5, 700, 4.1, 0.08), (3, 6, 900, 21.5, 0.25), (4, 5, 300, 9.8, 0.14), (4, 6, 1000, 16.3, 0.21),
 (5, 7, 400, 7.2, 0.10);

INSERT INTO usuario (id_organizacion, cedula, nombres, apellidos, email, rol) VALUES
 (3, '1712345678', 'María José', 'Andrade Pérez', 'mandrade@puntolimpio.ec', 'OPERADOR'),
 (4, '1723456789', 'Carlos',     'Toapanta Ruiz', 'ctoapanta@retech.ec',     'TECNICO'),
 (5, '1734567890', 'Lucía',      'Herrera Vaca',  'lherrera@ecogestion.ec',  'TECNICO'),
 (3, '1745678901', 'Diego',      'Salazar Mora',  'dsalazar@puntolimpio.ec', 'ADMINISTRADOR');

INSERT INTO categoria_raee (nombre, descripcion, peligrosidad) VALUES
 ('Aparatos de intercambio de temperatura', 'Refrigeradoras, congeladores, aire acondicionado', 'ALTA'),
 ('Pantallas y monitores', 'Monitores, televisores, laptops (pantalla > 100 cm2)', 'MEDIA'),
 ('Lámparas', 'Fluorescentes, LED, de descarga', 'ALTA'),
 ('Grandes aparatos', 'Lavadoras, impresoras industriales', 'BAJA'),
 ('Pequeños aparatos', 'Electrodomésticos pequeños, herramientas', 'BAJA'),
 ('Pequeños equipos de TI y telecomunicaciones', 'CPU, teléfonos, routers, periféricos', 'MEDIA');

INSERT INTO tipo_tratamiento (nombre, descripcion) VALUES
 ('REACONDICIONAMIENTO', 'Reparación y prueba para volver a usar el equipo'),
 ('RECICLAJE', 'Desensamble y recuperación de materiales'),
 ('DISPOSICION_CONTROLADA', 'Tratamiento de fracciones peligrosas no recuperables'),
 ('DONACION', 'Entrega de equipo reacondicionado a una entidad beneficiaria');

INSERT INTO lote (id_organizacion_generador, id_sede_actual, codigo, fecha_registro, peso_total_kg, estado) VALUES
 (1, 3, 'L-2026-0001', '2026-09-01T09:00:00', 58.40, 'EN_PROCESO'),
 (2, 2, 'L-2026-0002', '2026-09-15T10:30:00', 120.00, 'REGISTRADO');

INSERT INTO traslado (id_lote, id_ruta, fecha_salida, fecha_llegada, peso_kg, estado) VALUES
 (1, 1, '2026-09-02T08:00:00', '2026-09-02T09:10:00', 58.40, 'ENTREGADO'),
 (2, 3, '2026-09-25T08:00:00', NULL, 120.00, 'PROGRAMADO');

INSERT INTO dispositivo (id_lote, id_categoria, codigo_trazabilidad, numero_serie, marca, modelo, peso_kg, estado_actual) VALUES
 (1, 2, 'ECO-000001', '5CD0123ABC', 'HP',     'ProBook 440 G5', 1.80, 'REACONDICIONADO'),
 (1, 6, 'ECO-000002', 'MXL8123XYZ', 'HP',     'ProDesk 400 G4', 5.60, 'EN_TRATAMIENTO'),
 (1, 2, 'ECO-000003', 'CN0V7H2K',   'Dell',   'P2219H',         4.20, 'EVALUADO'),
 (1, 6, 'ECO-000004', NULL,         'TP-Link','TL-WR840N',      0.30, 'RECIBIDO'),
 (2, 4, 'ECO-000005', 'EPS-99812',  'Epson',  'WF-C5790',      23.00, 'REGISTRADO');

INSERT INTO evaluacion (id_dispositivo, id_tecnico, id_tipo_recomendado, fecha, condicion, es_funcional, datos_borrados, observacion) VALUES
 (1, 2, 1, '2026-09-03T10:00:00', 'REPARABLE', 1,  1,  'Batería agotada; se reemplaza'),
 (2, 2, 2, '2026-09-03T11:00:00', 'DANADA',    0, 1,  'Placa base con daño por humedad'),
 (3, 2, 1, '2026-09-04T09:30:00', 'BUENA',     1,  0, 'Monitor operativo, sin rayones');

INSERT INTO tratamiento (id_dispositivo, id_tipo_tratamiento, id_organizacion_ejecutora, fecha_inicio, fecha_fin, resultado, kg_recuperados) VALUES
 (1, 1, 4, '2026-09-05T08:00:00', '2026-09-08T17:00:00', 'EXITOSO', NULL),
 (2, 2, 5, '2026-09-10T08:00:00', NULL, 'EN_PROCESO', NULL);

INSERT INTO evento_trazabilidad (id_dispositivo, id_usuario, fecha_hora, estado_anterior, estado_nuevo, descripcion) VALUES
 (1, 1, '2026-09-02T09:15:00', 'REGISTRADO', 'RECIBIDO', 'Ingreso en Punto Limpio Norte'),
 (1, 2, '2026-09-03T10:00:00', 'RECIBIDO', 'EVALUADO', 'Evaluación técnica: reparable'),
 (1, 2, '2026-09-05T08:00:00', 'EVALUADO', 'EN_TRATAMIENTO', 'Inicio de reacondicionamiento'),
 (1, 2, '2026-09-08T17:00:00', 'EN_TRATAMIENTO', 'REACONDICIONADO', 'Equipo probado y certificado'),
 (2, 1, '2026-09-02T09:15:00', 'REGISTRADO', 'RECIBIDO', 'Ingreso en Punto Limpio Norte'),
 (2, 2, '2026-09-03T11:00:00', 'RECIBIDO', 'EVALUADO', 'Evaluación técnica: dañada'),
 (2, 3, '2026-09-10T08:00:00', 'EVALUADO', 'EN_TRATAMIENTO', 'Ingreso a planta de reciclaje'),
 (3, 1, '2026-09-02T09:15:00', 'REGISTRADO', 'RECIBIDO', 'Ingreso en Punto Limpio Norte'),
 (3, 2, '2026-09-04T09:30:00', 'RECIBIDO', 'EVALUADO', 'Evaluación técnica: buena'),
 (4, 1, '2026-09-02T09:15:00', 'REGISTRADO', 'RECIBIDO', 'Ingreso en Punto Limpio Norte');

INSERT INTO evidencia (id_evento, tipo, url_archivo, hash_sha256) VALUES
 (1, 'GUIA_REMISION', 's3://ecoraee-evidencias/2026/09/L-2026-0001/guia.pdf',
     '9f2c1a7e4b3d5c6e8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f708192a3b4c5'),
 (4, 'CERTIFICADO',   's3://ecoraee-evidencias/2026/09/ECO-000001/certificado.pdf',
     '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809'),
 (6, 'FOTOGRAFIA',    's3://ecoraee-evidencias/2026/09/ECO-000002/placa.jpg',
     'aa11bb22cc33dd44ee55ff6600778899aabbccddeeff00112233445566778899');

-- ---------------------------------------------------------------------
