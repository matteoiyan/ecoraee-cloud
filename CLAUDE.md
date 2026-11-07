# EcoRAEE Cloud (local)

Proyecto integrador UIDE, Parte II: frontend, backend y base de datos, todo local (sin AWS ni nube). Equipo: Edison Chiguano y Mateo Yánez. Entrega: video de máximo 5 minutos con demo, aporte individual e integración.

## Stack
- Backend: Node 22.13+, Express, `server/index.js` (API y reglas), `server/resources.js` (definición única de entidades y validaciones), `server/db.js` (SQLite por defecto, SQL Server con DB_DRIVER=mssql).
- Frontend: `public/` (HTML, CSS y JS sin dependencias). Las pantallas se generan desde `/api/meta`.
- BD: `database/sqlite.sql` (se carga solo al primer arranque) y `database/sqlserver.sql` (T-SQL original).

## Comandos
- `npm install` y `npm start` abren http://localhost:3000. Para reiniciar datos, borra `database/ecoraee.db`.

## Reglas de negocio ya implementadas
- Traslado no supera la capacidad de la ruta ni usa rutas inactivas.
- Ruta con origen distinto al destino.
- Transiciones válidas de estado del dispositivo, con evento de trazabilidad en la misma transacción.
- No se pasa a EVALUADO sin evaluación registrada.

## Pendiente
- Probar la conexión a SQL Server (no se pudo probar en el entorno anterior).
- Pantalla de `evidencia` (necesita carga de archivos).
- Tabla de aportes por integrante para el video.

## Estilo
- Interfaz y textos en español, oración normal en títulos, sin rayas largas. Dependencias mínimas.
