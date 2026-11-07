# EcoRAEE Cloud (versión local)

Aplicación local para la trazabilidad de RAEE: frontend, backend y base de datos, todo en tu computador. No usa AWS ni servicios en la nube.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/` | Frontend React, separado en pantallas, componentes, servicios y estilos |
| `index.html`, `vite.config.js` | Punto de entrada y configuración de Vite |
| `server/` | Backend: API REST con Express, validaciones y reglas de negocio |
| `dist/` | Frontend de producción generado al compilar |
| `database/sqlite.sql` | Esquema y datos de prueba para SQLite (se crea solo al primer arranque) |
| `database/sqlserver.sql` | Mismo modelo para SQL Server (el script del avance anterior) |

## Ejecutar con SQLite (lo más simple)

Requiere Node.js 22.13 o superior.

```
npm install
npm start
```

`npm start` compila React con Vite y luego inicia Express. Abre http://localhost:3000. La base se crea en `database/ecoraee.db`. Para reiniciar los datos, borra ese archivo.

Para desarrollo con recarga en caliente, ejecuta en dos terminales:

```
npm run dev:api
npm run dev
```

Vite sirve el frontend en http://127.0.0.1:5173 y reenvía las solicitudes `/api` al backend local en el puerto 3000.

## Ejecutar con SQL Server

1. Abre `database/sqlserver.sql` en SSMS y ejecútalo (crea la base `EcoRAEE` con datos de prueba).
2. Habilita el inicio de sesión con usuario y contraseña de SQL Server y el protocolo TCP/IP (puerto 1433).
3. En PowerShell:

```
$env:DB_DRIVER="mssql"; $env:DB_USER="sa"; $env:DB_PASSWORD="tu_clave"
npm install
npm start
```

Variables opcionales: `DB_HOST` (localhost), `DB_PORT` (1433), `DB_NAME` (EcoRAEE), `PORT` (3000).

## Qué hace cada parte

- **Frontend:** React + Vite; 11 pantallas más el panel. Cada una lista, busca, crea, edita y elimina. Los formularios validan antes de enviar y muestran el error junto al campo. Los dispositivos incluyen historial y registro de movimientos.
- **Backend:** `GET/POST/PUT/DELETE /api/<tabla>` para cada entidad. Valida tipos, rangos, formatos y listas de valores. Responde 400 (datos), 404 (no existe), 409 (duplicado o relación) y 500 (error interno) con mensajes claros.
- **Reglas de negocio:**
  - Un traslado no puede superar la capacidad mensual de su ruta ni usar una ruta inactiva.
  - Una ruta no puede tener el mismo origen y destino.
  - El estado de un dispositivo solo cambia por transiciones válidas y cada cambio crea un evento de trazabilidad en la misma transacción.
  - Un dispositivo no pasa a Evaluado sin una evaluación técnica registrada.
- **Base de datos:** 13 tablas con llaves primarias y foráneas, UNIQUE, CHECK y valores por defecto, iguales al modelo físico del avance.

## Pruebas rápidas para el video (5 minutos)

1. Panel: muestra el riel con los dispositivos por etapa.
2. Dispositivos > Nuevo dispositivo: envía vacío para ver las validaciones, luego guarda uno.
3. Trazabilidad del dispositivo nuevo: intenta pasarlo a Evaluado (falla por falta de evaluación), crea la evaluación en Evaluaciones y repite.
4. Traslados > Nuevo traslado con un peso mayor a la capacidad de la ruta: muestra el rechazo.
5. Organizaciones: intenta eliminar una con sedes y muestra el error de relación.
6. Muestra en SSMS (o en la tabla `evento_trazabilidad`) que los registros quedaron guardados.
