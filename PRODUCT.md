# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Administradores o integrantes del equipo académico que usan la aplicación local para gestionar y demostrar la trazabilidad de residuos de aparatos eléctricos y electrónicos (RAEE).

## Product Purpose

EcoRAEE Cloud registra el recorrido de RAEE mediante lotes, dispositivos, organizaciones, sedes, rutas, traslados, evaluaciones, tratamientos y eventos de trazabilidad. La aplicación sirve como proyecto integrador académico con frontend, backend y base de datos ejecutados localmente.

## Operating Context

La aplicación se ejecuta en un computador local. SQLite es la base predeterminada y SQL Server es una alternativa configurable. La interfaz y sus textos están en español.

## Capabilities and Constraints

- El frontend tiene un panel y once pantallas de gestión con búsqueda, formularios, edición y eliminación.
- Las reglas de negocio y la API REST se implementan en Express y deben conservarse durante la migración del frontend a React y Vite.
- La base de datos admite SQLite por defecto y SQL Server mediante configuración.
- La aplicación no depende de AWS ni de servicios en la nube.
- El sistema valida la capacidad y actividad de rutas, las transiciones de estado, y la existencia de una evaluación antes de marcar un dispositivo como evaluado.

## Brand Commitments

- El nombre del producto es EcoRAEE Cloud.
- La interfaz y los textos están en español.
- El usuario pide seguir de forma fiel el estilo y los colores azul, negro y blanco de las referencias de dashboard en todas las pantallas.

## Evidence on Hand

- Código de la aplicación: `public/`, `server/` y `database/`.
- Descripción del alcance y reglas: `CLAUDE.md` y `README.md`.
- Referencias visuales de dashboards proporcionadas por el usuario en la conversación.
- No se proporcionaron logotipos, testimonios ni evidencia externa de impacto; no deben inventarse.

## Product Principles

- Mantener la trazabilidad y las reglas de negocio existentes.
- Mantener el funcionamiento local sin requerir servicios en la nube.
- Presentar información operativa y acciones en español.
- Hacer que el recorrido de RAEE sea claro y demostrable.
