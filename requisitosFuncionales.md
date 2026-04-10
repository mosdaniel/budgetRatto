# Proyecto: Budget Manager — Aplicación de Gestión de Presupuesto Personal

## Contexto general
Construye una aplicación de escritorio ejecutable como archivo `.exe` (Windows), desarrollada en java con react,sql server, que permita al usuario gestionar su presupuesto personal de forma visual, organizada y con reportes claros.

---

## Estilo visual (OBLIGATORIO)
La interfaz debe seguir el estilo de diseño adjunto en el proyecto:
- Paleta de colores oscura (dark mode), predominando tonos negros, grises oscuros.
- Tipografía moderna, limpia, como en la foto, identifica su tipografia
- Tarjetas (cards) con bordes redondeados y fondo ligeramente más claro que el fondo principal.
- Iconos minimalistas para cada categoría de gasto.
- Barra lateral (sidebar) de navegación con secciones: Dashboard, Gastos, Reportes, Configuración.
- Sin bordes duros; usar sombras suaves y separaciones con espaciado generoso.
- Gráficas con colores vibrantes sobre fondo oscuro (donut chart / pie chart para porcentajes).

---

## Requerimientos funcionales

### RF-01 · Configuración de presupuesto base
- El usuario debe poder ingresar su salario o presupuesto mensual total.
- Este valor se guarda como referencia del 100% para todos los cálculos.
- Debe ser editable en cualquier momento desde "Configuración".

### RF-02 · Gestión de gastos (CRUD completo)
- Agregar un gasto con los campos: nombre, categoría, monto.
- Editar cualquier gasto existente.
- Eliminar gastos con confirmación.
- Los gastos se persisten localmente (SQLite o archivo JSON).

### RF-03 · Cálculo automático de porcentajes
- Al ingresar el monto de un gasto, la app calcula automáticamente qué porcentaje representa sobre el presupuesto total.
- Fórmula: `% = (monto_gasto / presupuesto_total) * 100`
- Este porcentaje se muestra en tiempo real junto al gasto (ej. "Alquiler: $500 — 20%").
- El total acumulado de gastos también muestra su porcentaje respecto al presupuesto.

### RF-04 · Dashboard visual
- Vista principal con las siguientes métricas en tarjetas:
  - Presupuesto total
  - Total gastado
  - Saldo disponible
  - Porcentaje consumido
- Gráfica de dona (donut chart) mostrando la distribución porcentual de cada gasto sobre el 100% del presupuesto.
- Cada segmento de la gráfica tiene su color único, nombre y porcentaje visible.

### RF-05 · Reporte de gastos
- Vista de tabla con todos los gastos registrados: nombre, categoría, monto, porcentaje.
- Fila de totales al pie de la tabla.
- Botón para exportar el reporte a PDF con logo, fecha y tabla de gastos formateada.
- Opcionalmente, exportar también a CSV.

### RF-06 · Categorías de gastos
- El usuario puede y debera del sistema permitir agregar categorías personalizadas.
- por ejemplo: vivienda, alimentacion etc
---

### RF-07 · Configuración de moneda
- El usuario debe poder seleccionar la moneda principal con la que trabaja su presupuesto (ej. USD, CRC, EUR, MXN, etc.).
- Esta configuración se guarda y aplica globalmente en toda la app: dashboards, reportes, tarjetas de métricas y gráficas.
- La lista de monedas disponibles debe obtenerse dinámicamente desde la API de tipo de cambio (ver RF-08), para garantizar que siempre esté actualizada.
- El símbolo y código de la moneda seleccionada deben mostrarse junto a todos los montos de la aplicación.

### RF-08 · Módulo de tipo de cambio en tiempo real
- La aplicación debe contar con una sección dedicada llamada "Tipo de Cambio" accesible desde la barra lateral.
- Consumir la API pública de ExchangeRate-API (https://www.exchangerate-api.com) o Open Exchange Rates (https://openexchangerates.org) para obtener tasas de cambio actualizadas.
- En esta sección el usuario puede:
  - Seleccionar una moneda base (ej. USD) y una moneda destino (ej. CRC — Colón costarricense).
  - Ver en tiempo real cuánto equivale 1 unidad de la moneda base en la moneda destino.
  - Ingresar un monto personalizado y obtener la conversión al instante.
  - Ver una tabla o lista con las tasas de cambio de las monedas más comunes respecto a la moneda base seleccionada.
- Los datos deben refrescarse automáticamente cada vez que el usuario accede a la sección, con opción de botón "Actualizar" manual.
- Mostrar la fecha y hora de la última actualización de las tasas.
- Mostrar indicador visual de carga mientras se consulta la API.

---

## Requerimientos no funcionales

### RNF-01 · Plataforma y distribución
- La aplicación debe compilarse como un único ejecutable `.exe` para Windows.
- No debe requerir instalación de ninguna dependencia externas por parte del usuario ademas de su `.exe`.

### RNF-02 · Persistencia de datos
- Los datos deben guardarse localmente en un archivo SQLite (`budget.db`) o JSON dentro de la carpeta del ejecutable.
- Los datos deben sobrevivir al cierre y reapertura de la aplicación.

### RNF-03 · Rendimiento
- La interfaz debe responder en menos de 300ms ante cualquier acción del usuario.
- Los cálculos de porcentaje deben actualizarse en tiempo real mientras el usuario escribe el monto.

### RNF-04 · Usabilidad
- La interfaz debe ser intuitiva sin necesidad de manual de usuario.
- Todos los formularios deben tener validaciones claras con mensajes de error en español.
- Campos numéricos deben aceptar únicamente números (con soporte para decimales).

### RNF-05 · Consistencia visual
- El estilo debe ser 100% coherente con la imagen de referencia adjunta al proyecto.
- Usar siempre la misma paleta de colores, tipografía y espaciado en todas las vistas.

### RNF-06 · Idioma
- Toda la interfaz, mensajes y reportes deben estar en español.


### RNF-07 · Integración con API externa de monedas
- Las llamadas a la API de tipo de cambio deben realizarse desde el backend (Spring Boot), nunca directamente desde el frontend, para proteger la API key.
- La API key debe almacenarse como variable de entorno, no en el código fuente.
- En caso de fallo de conexión o límite de la API, la app debe mostrar un mensaje claro al usuario y permitir trabajar con los últimos datos cacheados localmente en la base de datos SQL.
- El caché de tasas de cambio debe almacenarse en la base de datos con su timestamp, y considerarse válido por un máximo de 1 hora antes de intentar refrescar.

### RNF-08 · Diseño responsive y escalabilidad visual
- Toda la interfaz debe ser completamente responsive, adaptándose correctamente a distintos tamaños de ventana sin que ningún elemento se desborde, se solape o quede fuera de los márgenes visibles.
- Ninguna pantalla, vista o componente debe mostrar scroll horizontal no intencionado ni contenido cortado en los bordes.
- El layout debe reordenarse fluidamente al redimensionar la ventana: las tarjetas, tablas, gráficas y formularios deben ajustar su tamaño y disposición de forma proporcional.
- La aplicación debe soportar zoom del navegador/Electron entre el 75% y el 150% sin que ningún elemento se descuadre, se superponga o pierda legibilidad.
- Todos los textos, íconos, botones y gráficas deben escalar proporcionalmente al tamaño de la ventana, usando unidades relativas (`rem`, `%`, `vw`, `vh`, `fr`) en lugar de valores fijos en píxeles donde sea posible.
- Las tablas de datos deben implementar scroll vertical interno cuando el contenido supere el alto disponible, y en pantallas reducidas deben adaptarse con scroll horizontal contenido dentro de su propio contenedor, nunca rompiendo el layout general.
- El sidebar debe colapsar o reducirse correctamente en ventanas de ancho reducido, sin superponerse al contenido principal.
- Las gráficas (donut chart, tablas de tipo de cambio) deben ser responsivas usando configuraciones de tamaño relativo (`responsive: true`, `maintainAspectRatio: false`) en Recharts o Chart.js.
- Se debe probar y garantizar el correcto funcionamiento visual en resoluciones mínimas de 1024×768 y máximas de 2560×1440.

---

## Stack tecnológico
- Backend: Java 17+ (Spring Boot para la API REST)
- Frontend: React 18+ (Vite como bundler, con Recharts o Chart.js para las gráficas)
- Base de datos: SQL (MySQL o PostgreSQL; usar JPA/Hibernate como ORM)
- Empaquetado desktop: Electron (para empaquetar el frontend React como `.exe`)
- Exportación PDF: iText (Java) o generación desde el frontend con jsPDF
- Comunicación: API REST entre el backend Spring Boot y el frontend React

---

## Entregables esperados
1. Código fuente completo y organizado en módulos.
2. Archivo `requirements.txt` con todas las dependencias.
3. Script `build.bat` o instrucciones para compilar el `.exe`.
4. El ejecutable final funcional: `BudgetManager.exe`.

---

## Nota final
Respetar fielmente el estilo visual de la imagen adjunta. Si hay conflicto entre una decisión técnica y el diseño visual, priorizar el diseño visual.