# Migración de EcoRAEE Cloud a React y Vite

## Intención

Migrar el frontend vanilla a una aplicación React compilada con Vite y actualizar la composición del panel para que comunique con claridad el ciclo y el estado operativo de RAEE. La usará el administrador o equipo académico que opera y demuestra el proyecto local.

## Objetivos

- Reemplazar las doce vistas frontend existentes por vistas y componentes React modulares.
- Conservar las pantallas, formularios, validaciones, búsqueda, edición, eliminación y flujos de trazabilidad actuales.
- Conservar Express, los endpoints de la API, sus reglas de negocio y la compatibilidad con SQLite y SQL Server.
- Adaptar la composición elegida, “Ciclo a la vista”, a la identidad teal y cobre de EcoRAEE.
- Proporcionar esqueletos de carga alineados con el contenido de cada vista y animaciones de entrada breves y respetuosas con movimiento reducido.
- Mantener la experiencia local con comandos documentados de desarrollo y ejecución.

## No objetivos

- Cambiar el esquema o los datos de la base de datos.
- Añadir nuevos módulos de negocio, incluida la carga de evidencias que aún está pendiente.
- Sustituir o cambiar la API existente.
- Adoptar la paleta azul y negra de las referencias, añadir un sistema de gráficos nuevo o incorporar una biblioteca de animación sin necesidad demostrada.

## Restricciones confirmadas

- La app es local: Express, frontend y base de datos corren en el computador del usuario.
- El idioma de producto es español y se conserva la identidad actual teal/cobre.
- La base predeterminada es SQLite; SQL Server sigue siendo configurable.
- El proyecto fija Node.js 22.13 o superior.
- El usuario pidió una migración completa a React/Vite, escalabilidad modular, esqueletos y animaciones de entrada.
- El usuario eligió reemplazo completo y “Ciclo a la vista” como composición inicial asignada.
- No hay metadatos Git en la carpeta del proyecto.

## Enfoques considerados

1. **Reemplazar el frontend completo en React + Vite.** Una sola arquitectura, módulos React por responsabilidad y una API compartida. Mantiene el alcance y permite aplicar un sistema visual coherente a todas las pantallas. **Elegido por el usuario.**
2. **Migrar por pantallas con frontend vanilla y React en paralelo.** Reduce el tamaño de cada etapa, pero duplica navegación, patrones y estados durante la transición.

## Diseño elegido

### Panel

La vista principal mantiene navegación lateral y encabezado operativo. Un resumen compacto presenta dispositivos registrados, peso, lotes abiertos y traslados pendientes. Debajo, un riel de etapas muestra el ciclo de vida de los dispositivos. La fila inferior organiza el peso por categoría, la capacidad usada de las rutas y los movimientos recientes. La composición reutiliza datos reales que ya entrega `/api/dashboard`; el riel es la firma visual del panel. No se presentará un mapa geográfico porque la API no proporciona coordenadas.

La vista de decisión del panel es `.impeccable/mocks/decision/cycle-overview.html`. Esta miniatura fija la composición del primer viewport de escritorio; el desarrollo debe ampliarla con contenido completo, estados reales y adaptación móvil.

### Arquitectura frontend

- `src/main.jsx` monta React y carga estilos globales.
- `src/app/` contiene la composición de aplicación, navegación por hash compatible con los enlaces `#/...` actuales y estados de arranque.
- `src/components/` contiene piezas compartidas de interfaz: layout, encabezado, tablas, formularios, campos, estados, diálogo, panel lateral, avisos y esqueletos.
- `src/features/dashboard/` concentra el panel, tarjetas métricas, ciclo, categoría, capacidad y actividad.
- `src/features/resources/` conserva el enfoque impulsado por `/api/meta` para generar listados y formularios de las entidades; mantiene definiciones de formulario y renderizado de celdas en componentes reutilizables.
- `src/features/traceability/` contiene el historial y el registro de transiciones.
- `src/services/api.js` centraliza las peticiones HTTP, errores y serialización JSON.
- `src/styles/` separa tokens, estilos base y reglas de la interfaz.

La interfaz seguirá usando JavaScript y JSX para alinearse con el proyecto existente. No se añadirá un router si la navegación hash existente puede conservarse con una implementación pequeña y clara. Las dependencias frontend se limitarán a React, React DOM, Vite y su plugin React.

### Ejecución y entrega local

Vite será el servidor de desarrollo y compilará el frontend a `dist/`. En desarrollo, `/api` se dirigirá al Express local. En ejecución normal, Express servirá el contenido compilado y mantendrá los mismos endpoints. Se documentarán los comandos para desarrollar y ejecutar el proyecto sin alterar la configuración de la base de datos.

### Estados y movimiento

- El panel usará esqueletos con la misma distribución de sus métricas, ciclo y tarjetas mientras carga `/api/dashboard`.
- Los listados usarán encabezado y filas de esqueleto en el lugar de la tabla. Los formularios y trazabilidad tendrán estados de carga propios.
- Los esqueletos anunciarán el estado con semántica accesible y desaparecerán al resolver o fallar la petición.
- La entrada de vistas y grupos de tarjetas usará opacidad y un desplazamiento corto con stagger breve, sin retrasar la interacción.
- Los controles tendrán transiciones específicas y feedback de pulsación. `prefers-reduced-motion` reducirá o quitará movimiento no esencial.
- Se conservarán estados vacíos, errores, validación, enfoque visible y los diálogos accesibles existentes.

## Criterios de aceptación

- React y Vite reemplazan el renderizado del frontend vanilla.
- Las doce vistas actuales, navegación por hash y pantallas CRUD siguen disponibles.
- Los formularios conservan referencias, valores por defecto, reglas de cliente y errores de servidor.
- Búsqueda, edición, eliminación confirmada y trazabilidad conservan el comportamiento actual.
- El panel presenta la composición aprobada con datos de la API; el diseño no simula valores no entregados por el backend.
- Los esqueletos se colocan en el espacio de los componentes que están cargando; los errores no quedan representados como cargas perpetuas.
- La UI se adapta a escritorio y móvil y respeta movimiento reducido.
- `npm start` sigue sirviendo frontend y API local con la base actual; desarrollo Vite queda documentado.
- La validación visual y funcional se ejecuta con Playwright y Playwright CLI, incluyendo escritorio, móvil, navegación, búsqueda, validaciones y trazabilidad sin persistir cambios de prueba no deseados.

## Decisiones del implementador

La estructura fina de archivos y los estilos de cada pantalla se resolverán en el plan de implementación, respetando estos límites. Los datos ilustrativos de la miniatura son una guía visual; la interfaz final leerá los datos de la API y mantendrá sus estados vacíos.
