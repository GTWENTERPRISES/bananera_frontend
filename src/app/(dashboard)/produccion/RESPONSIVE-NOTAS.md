Cambios realizados en el diseño responsivo de las tablas de Producción

- Objetivo: mejorar legibilidad y comportamiento en móvil (≥320px), tablet (768–1024px) y escritorio (>1024px).

Principales ajustes
- Se corrigieron reglas CSS que ocultaban casi todas las columnas en móvil.
- Se definieron variantes responsivas opt‑in (`responsive-table-sm`, `responsive-table-md`).
- Se ajustó `table-layout` en móvil para evitar superposición y mejorar el recorte de texto.
- Se redujo el ancho mínimo de las tablas y se hizo progresivo por breakpoint.
- Se agregó truncado en la columna `Finca` para evitar desbordes.

Archivos modificados
- `src/styles/responsive-components.css`: nuevas reglas por breakpoint y eliminación de ocultación global.
- `src/components/produccion/cosechas-table.tsx`: `table-fixed`, `min-w` progresivo y `truncate` en `Finca`.
- `src/components/produccion/enfundes-table.tsx`: `table-fixed`, `min-w` progresivo y `truncate` en `Finca`.
- `src/components/produccion/recuperacion-table.tsx`: `table-fixed`, `min-w` progresivo y `truncate` en `Finca`.

Comportamiento por breakpoint
- Móvil (<768px):
  - `responsive-table-md` muestra primeras 4 columnas; el resto se oculta.
  - `responsive-table-sm` muestra primeras 2 columnas.
  - Se usa `table-layout: fixed` y padding reducido.
- Tablet (768–1024px):
  - `responsive-table-md` muestra hasta 6 columnas.
- Escritorio (>1024px):
  - Se muestran todas las columnas.

Verificación funcional
- Se probó en servidor local (`http://localhost:3002`) en páginas:
  - `/produccion/cosechas`
  - `/produccion/enfundes`
  - `/produccion/recuperacion`
- Se revisó legibilidad de contenidos, ausencia de superposición y funcionamiento de filtros, orden, edición y paginación.

Notas de uso
- Para tablas nuevas, envolver con `responsive-table` y elegir variante (`responsive-table-sm` o `responsive-table-md`) según prioridad de columnas.
- Evitar reglas globales que oculten columnas sin control del contexto.