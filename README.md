# TP Desarrollo de Sistemas - Gestión Hotelera

## Descripción
Sistema de gestión hotelera que permite administrar huéspedes, habitaciones, reservas, estadías y facturación.
Software desarrollado cumpliendo con arquitectura de capas, patrón DAO y principios SOLID.

### Integrantes del Grupo
* [Nombres de los integrantes]

---

## Requisitos Previos
* **Java SDK 21** (Backend)
* **Maven** (Gestión de dependencias)
* **Node.js** v18+ (Frontend)
* **PostgreSQL** (Motor de Base de Datos)

---

## Base de Datos
1. Crear una base de datos en PostgreSQL llamada `tp_desarrollo`.
2. Ejecutar el script SQL ubicado en `database/schema.sql` para crear las tablas y datos iniciales.
3. Configurar las credenciales en `backend-java/src/main/resources/application.properties` si son diferentes a `postgres/admin`.

---

## Ejecución

### Backend (Spring Boot)
1. Abrir terminal en `backend-java`.
2. Ejecutar: `mvn spring-boot:run`
3. La API estará disponible en `http://localhost:8080`.

### Frontend (Next.js)
1. Abrir terminal en `front_next`.
2. Instalar dependencias: `npm install`
3. Ejecutar: `npm run dev`
4. Acceder al navegador en `http://localhost:3000`.

---

## Endpoints de Ejemplo (API REST)

Los siguientes son ejemplos para probar los Casos de Uso principales usando `curl`.

### 1. Gestión de Huéspedes
**GET** - Buscar Huéspedes
```bash
curl "http://localhost:8080/api/huespedes/buscar?apellido=Perez"
```

**POST** - Crear Huésped
```bash
curl -X POST http://localhost:8080/api/huespedes \
-H "Content-Type: application/json" \
-d '{
    "numeroDocumento": "99999999",
    "tipoDocumento": "DNI",
    "apellido": "Test",
    "nombres": "Usuario",
    "fechaNacimiento": "1990-01-01",
    "email": "test@mail.com",
    "telefono": "12345678",
    "nacionalidad": "Argentina",
    "ocupacion": "Tester",
    "direccion": {
        "pais": "Argentina",
        "provincia": "CABA",
        "localidad": "CABA",
        "direccionCalle": "Calle Falsa",
        "direccionNumero": "123",
        "codigoPostal": "1000"
    }
}'
```

**PUT** - Actualizar Huésped
```bash
curl -X PUT http://localhost:8080/api/huespedes/99999999 \
-H "Content-Type: application/json" \
-d '{
    "numeroDocumento": "99999999",
    "tipoDocumento": "DNI",
    "apellido": "Test Modificado",
    "nombres": "Usuario",
    "fechaNacimiento": "1990-01-01",
    "direccion": null
}'
```

**DELETE** - Eliminar Huésped
```bash
curl -X DELETE http://localhost:8080/api/huespedes/99999999
```

### 2. Gestión de Estadías
**POST** - Crear Estadía (Check-in)
```bash
curl -X POST http://localhost:8080/estadias \
-H "Content-Type: application/json" \
-d '{
    "idHabitacion": "101",
    "idResponsable": "11111111",
    "fechaDesde": "2023-11-01",
    "fechaHasta": "2023-11-05",
    "idsAcompanantes": []
}'
```

**PUT** - Modificar Estadía
```bash
curl -X PUT http://localhost:8080/estadias/1 \
-H "Content-Type: application/json" \
-d '{
    "idHabitacion": "101",
    "idResponsable": "11111111",
    "idsAcompanantes": ["22222222"]
}'
```

### 3. Facturación
**GET** - Detalle a Facturar
```bash
curl "http://localhost:8080/facturacion/detalle?habitacion=101"
```

**POST** - Generar Factura
```bash
curl -X POST http://localhost:8080/facturacion \
-H "Content-Type: application/json" \
-d '{
    "idEstadia": 1,
    "tipoFactura": "B",
    "facturarEstadia": true,
    "idsConsumos": []
}'
```

---

## Tecnologías Utilizadas
* **Backend**: Java 21, Spring Boot 3, Hibernate/JPA.
* **Frontend**: Next.js 14, React, Tailwind CSS.
* **Base de Datos**: PostgreSQL.
* **Testing**: JUnit 5, Mockito.
