CREATE TABLE huespedes (
    numero_documento VARCHAR(8) PRIMARY KEY,
    nombres          VARCHAR(50) NOT NULL,
    apellido         VARCHAR(50) NOT NULL,
    email            VARCHAR(50),
    fecha_nacimiento DATE NOT NULL,
    tipo_documento   VARCHAR(20) NOT NULL,
    posicion_iva     VARCHAR(25) NOT NULL,
    ocupacion        VARCHAR(50) NOT NULL,
    cuit             VARCHAR(10),
    nacionalidad     VARCHAR(50) NOT NULL,
    telefono         VARCHAR(20) NOT NULL
);

CREATE TABLE direccion (
    id              SERIAL PRIMARY KEY,
    id_huesped      VARCHAR(8) UNIQUE REFERENCES huespedes(numero_documento),
    pais            VARCHAR(20) NOT NULL,
    provincia       VARCHAR(20) NOT NULL,
    localidad       VARCHAR(20) NOT NULL,
    direccion_calle VARCHAR(25) NOT NULL,
    codigo_postal   VARCHAR(10) NOT NULL,
    direccion_numero VARCHAR(20) NOT NULL,
    direccion_piso  VARCHAR(10)
);

CREATE TABLE habitacion (
    numero VARCHAR(3) NOT NULL PRIMARY KEY,
    estado VARCHAR(15) NOT NULL,
    tipo   VARCHAR(20) NOT NULL
);

CREATE TABLE cama (
    id          SERIAL PRIMARY KEY,
    numero_hab  VARCHAR(3) REFERENCES habitacion(numero),
    tipo        VARCHAR(10) NOT NULL
);

CREATE TABLE reserva (
    id             SERIAL PRIMARY KEY,
    fecha_desde    DATE,
    fecha_hasta    DATE,
    num_habitacion VARCHAR(3) NOT NULL REFERENCES habitacion(numero),
    nombres        VARCHAR(50) NOT NULL,
    apellido       VARCHAR(50) NOT NULL,
    telefono       VARCHAR(20) NOT NULL
);

CREATE TABLE estadia (
    id             SERIAL PRIMARY KEY,
    id_huesped     VARCHAR(8) REFERENCES huespedes(numero_documento),
    id_reserva     INTEGER UNIQUE REFERENCES reserva(id), 
    fecha_desde    DATE NOT NULL,
    fecha_hasta    DATE NOT NULL,
    num_habitacion VARCHAR(3) NOT NULL REFERENCES habitacion(numero),
    estado         VARCHAR(20)
);

CREATE TABLE estadia_huespedes (
    id_estadia INTEGER NOT NULL,
    id_huesped VARCHAR(8) NOT NULL,
    PRIMARY KEY (id_estadia, id_huesped),
    CONSTRAINT fk_estadia FOREIGN KEY (id_estadia) REFERENCES estadia(id),
    CONSTRAINT fk_huesped FOREIGN KEY (id_huesped) REFERENCES huespedes(numero_documento)
);

CREATE TABLE consumo (
    id         SERIAL PRIMARY KEY,
    id_estadia INTEGER REFERENCES estadia(id),
    nombre     VARCHAR(50) NOT NULL,
    precio     FLOAT NOT NULL,
    cantidad   INTEGER NOT NULL
);

CREATE TABLE responsable_de_pago (
    id              SERIAL PRIMARY KEY,
    tipo_responsable VARCHAR(20) NOT NULL -- 'FISICA' o 'JURIDICA'
);

CREATE TABLE persona_fisica (
    id_responsable INTEGER PRIMARY KEY REFERENCES responsable_de_pago(id),
    numero_documento VARCHAR(8) UNIQUE NOT NULL REFERENCES huespedes(numero_documento) 
);

CREATE TABLE persona_juridica (
    id_responsable INTEGER PRIMARY KEY UNIQUE REFERENCES responsable_de_pago(id),
    razon_social   VARCHAR(100) NOT NULL,
    id_direccion   INTEGER UNIQUE NOT NULL REFERENCES direccion(id),
    cuit           VARCHAR(11) NOT NULL
);

CREATE TABLE factura (
    id                  SERIAL PRIMARY KEY,
    tipo_factura        CHAR(1) NOT NULL, 
    estado_factura      VARCHAR(20) NOT NULL,
    monto_total         FLOAT NOT NULL,
    id_estadia          INTEGER REFERENCES estadia(id),
    id_responsable_pago INTEGER REFERENCES responsable_de_pago(id)
);

CREATE TABLE nota_credito (
    id            SERIAL PRIMARY KEY,
    numero_nota   VARCHAR(20) NOT NULL,
    importe_total FLOAT NOT NULL,
    id_factura    INTEGER UNIQUE REFERENCES factura(id)
);

CREATE TABLE metodo_de_pago (
    id          SERIAL PRIMARY KEY,
    importe	FLOAT,
    tipo_metodo VARCHAR(20) NOT NULL -- 'EFECTIVO', 'TARJETA', 'CHEQUE'
);

CREATE TABLE efectivo (
    id_metodo   INTEGER PRIMARY KEY REFERENCES metodo_de_pago(id),
    moneda      VARCHAR(10) DEFAULT 'ARS'
);

CREATE TABLE cheque (
    id_metodo   INTEGER PRIMARY KEY REFERENCES metodo_de_pago(id),
    nro_cheque  VARCHAR(50) NOT NULL,
    banco       VARCHAR(50) NOT NULL,
    fecha_cobro DATE
);

CREATE TABLE tarjeta (
    id_metodo     INTEGER PRIMARY KEY REFERENCES metodo_de_pago(id),
    nro_tarjeta   VARCHAR(20) NOT NULL,
    titular       VARCHAR(50) NOT NULL,
    csv           VARCHAR(4) NOT NULL,
    vencimiento   VARCHAR(5) NOT NULL, -- MM/YY
    tipo_tarjeta  VARCHAR(10) NOT NULL, -- 'CREDITO' o 'DEBITO'
    cuotas        INTEGER DEFAULT 1
);

CREATE TABLE pago (
    id              SERIAL PRIMARY KEY,
    id_factura      INTEGER REFERENCES factura(id),
    id_metodo_pago  INTEGER REFERENCES metodo_de_pago(id),
    importe         FLOAT NOT NULL,
    fecha_pago      DATE DEFAULT CURRENT_DATE
);

-- 1. INDIVIDUAL ESTÁNDAR (10 Habitaciones)
-- Configuración: 1 cama INDIVIDUAL
-- Habitaciones 101 - 110

INSERT INTO habitacion (numero, estado, tipo) VALUES
('101', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('102', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('103', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('104', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('105', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('106', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('107', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('108', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('109', 'LIBRE', 'INDIVIDUAL_ESTANDAR'),
('110', 'LIBRE', 'INDIVIDUAL_ESTANDAR');

INSERT INTO cama (numero_hab, tipo) VALUES
('101', 'INDIVIDUAL'),
('102', 'INDIVIDUAL'),
('103', 'INDIVIDUAL'),
('104', 'INDIVIDUAL'),
('105', 'INDIVIDUAL'),
('106', 'INDIVIDUAL'),
('107', 'INDIVIDUAL'),
('108', 'INDIVIDUAL'),
('109', 'INDIVIDUAL'),
('110', 'INDIVIDUAL');


-- 2. DOBLE ESTÁNDAR (18 Habitaciones)
-- Habitaciones 201 - 218
-- Variación A (9 Habs): 2 camas INDIVIDUAL
-- Variación B (9 Habs): 1 cama DOBLE

-- Variación A: Dos camas individuales (201-209)
INSERT INTO habitacion (numero, estado, tipo) VALUES
('201', 'LIBRE', 'DOBLE_ESTANDAR'), ('202', 'LIBRE', 'DOBLE_ESTANDAR'),
('203', 'LIBRE', 'DOBLE_ESTANDAR'), ('204', 'LIBRE', 'DOBLE_ESTANDAR'),
('205', 'LIBRE', 'DOBLE_ESTANDAR'), ('206', 'LIBRE', 'DOBLE_ESTANDAR'),
('207', 'LIBRE', 'DOBLE_ESTANDAR'), ('208', 'LIBRE', 'DOBLE_ESTANDAR'),
('209', 'LIBRE', 'DOBLE_ESTANDAR');

INSERT INTO cama (numero_hab, tipo) VALUES
('201', 'INDIVIDUAL'), ('201', 'INDIVIDUAL'),
('202', 'INDIVIDUAL'), ('202', 'INDIVIDUAL'),
('203', 'INDIVIDUAL'), ('203', 'INDIVIDUAL'),
('204', 'INDIVIDUAL'), ('204', 'INDIVIDUAL'),
('205', 'INDIVIDUAL'), ('205', 'INDIVIDUAL'),
('206', 'INDIVIDUAL'), ('206', 'INDIVIDUAL'),
('207', 'INDIVIDUAL'), ('207', 'INDIVIDUAL'),
('208', 'INDIVIDUAL'), ('208', 'INDIVIDUAL'),
('209', 'INDIVIDUAL'), ('209', 'INDIVIDUAL');

-- Variación B: Una cama doble (210-218)
INSERT INTO habitacion (numero, estado, tipo) VALUES
('210', 'LIBRE', 'DOBLE_ESTANDAR'), ('211', 'LIBRE', 'DOBLE_ESTANDAR'),
('212', 'LIBRE', 'DOBLE_ESTANDAR'), ('213', 'LIBRE', 'DOBLE_ESTANDAR'),
('214', 'LIBRE', 'DOBLE_ESTANDAR'), ('215', 'LIBRE', 'DOBLE_ESTANDAR'),
('216', 'LIBRE', 'DOBLE_ESTANDAR'), ('217', 'LIBRE', 'DOBLE_ESTANDAR'),
('218', 'LIBRE', 'DOBLE_ESTANDAR');

INSERT INTO cama (numero_hab, tipo) VALUES
('210', 'DOBLE'), ('211', 'DOBLE'),
('212', 'DOBLE'), ('213', 'DOBLE'),
('214', 'DOBLE'), ('215', 'DOBLE'),
('216', 'DOBLE'), ('217', 'DOBLE'),
('218', 'DOBLE');


-- 3. DOBLE SUPERIOR (8 Habitaciones)
-- Habitaciones 301 - 308
-- Variación A (4 Habs): 2 camas INDIVIDUAL
-- Variación B (4 Habs): 1 cama DOBLE + 1 cama KING

-- Variación A (301-304)
INSERT INTO habitacion (numero, estado, tipo) VALUES
('301', 'LIBRE', 'DOBLE_SUPERIOR'), ('302', 'LIBRE', 'DOBLE_SUPERIOR'),
('303', 'LIBRE', 'DOBLE_SUPERIOR'), ('304', 'LIBRE', 'DOBLE_SUPERIOR');

INSERT INTO cama (numero_hab, tipo) VALUES
('301', 'INDIVIDUAL'), ('301', 'INDIVIDUAL'),
('302', 'INDIVIDUAL'), ('302', 'INDIVIDUAL'),
('303', 'INDIVIDUAL'), ('303', 'INDIVIDUAL'),
('304', 'INDIVIDUAL'), ('304', 'INDIVIDUAL');

-- Variación B (305-308)
INSERT INTO habitacion (numero, estado, tipo) VALUES
('305', 'LIBRE', 'DOBLE_SUPERIOR'), ('306', 'LIBRE', 'DOBLE_SUPERIOR'),
('307', 'LIBRE', 'DOBLE_SUPERIOR'), ('308', 'LIBRE', 'DOBLE_SUPERIOR');

INSERT INTO cama (numero_hab, tipo) VALUES
('305', 'DOBLE'), ('305', 'KING'),
('306', 'DOBLE'), ('306', 'KING'),
('307', 'DOBLE'), ('307', 'KING'),
('308', 'DOBLE'), ('308', 'KING');


-- 4. SUPERIOR FAMILY PLAN (10 Habitaciones)
-- Habitaciones 401 - 410
-- Variación A (5 Habs): 3 INDIVIDUAL + 1 DOBLE
-- Variación B (5 Habs): 1 INDIVIDUAL + 2 DOBLE

-- Variación A (401-405)
INSERT INTO habitacion (numero, estado, tipo) VALUES
('401', 'LIBRE', 'SUPERIOR_FAMILY_PLAN'), ('402', 'LIBRE', 'SUPERIOR_FAMILY_PLAN'),
('403', 'LIBRE', 'SUPERIOR_FAMILY_PLAN'), ('404', 'LIBRE', 'SUPERIOR_FAMILY_PLAN'),
('405', 'LIBRE', 'SUPERIOR_FAMILY_PLAN');

INSERT INTO cama (numero_hab, tipo) VALUES
('401', 'INDIVIDUAL'), ('401', 'INDIVIDUAL'), ('401', 'INDIVIDUAL'), ('401', 'DOBLE'),
('402', 'INDIVIDUAL'), ('402', 'INDIVIDUAL'), ('402', 'INDIVIDUAL'), ('402', 'DOBLE'),
('403', 'INDIVIDUAL'), ('403', 'INDIVIDUAL'), ('403', 'INDIVIDUAL'), ('403', 'DOBLE'),
('404', 'INDIVIDUAL'), ('404', 'INDIVIDUAL'), ('404', 'INDIVIDUAL'), ('404', 'DOBLE'),
('405', 'INDIVIDUAL'), ('405', 'INDIVIDUAL'), ('405', 'INDIVIDUAL'), ('405', 'DOBLE');

-- Variación B (406-410)
INSERT INTO habitacion (numero, estado, tipo) VALUES
('406', 'LIBRE', 'SUPERIOR_FAMILY_PLAN'), ('407', 'LIBRE', 'SUPERIOR_FAMILY_PLAN'),
('408', 'LIBRE', 'SUPERIOR_FAMILY_PLAN'), ('409', 'LIBRE', 'SUPERIOR_FAMILY_PLAN'),
('410', 'LIBRE', 'SUPERIOR_FAMILY_PLAN');

INSERT INTO cama (numero_hab, tipo) VALUES
('406', 'INDIVIDUAL'), ('406', 'DOBLE'), ('406', 'DOBLE'),
('407', 'INDIVIDUAL'), ('407', 'DOBLE'), ('407', 'DOBLE'),
('408', 'INDIVIDUAL'), ('408', 'DOBLE'), ('408', 'DOBLE'),
('409', 'INDIVIDUAL'), ('409', 'DOBLE'), ('409', 'DOBLE'),
('410', 'INDIVIDUAL'), ('410', 'DOBLE'), ('410', 'DOBLE');


-- 5. SUITE DOBLE (2 Habitaciones)
-- Habitaciones 501 - 502

INSERT INTO habitacion (numero, estado, tipo) VALUES
('501', 'LIBRE', 'SUITE_DOBLE'),
('502', 'LIBRE', 'SUITE_DOBLE');

INSERT INTO cama (numero_hab, tipo) VALUES
('501', 'KING'),
('502', 'KING');