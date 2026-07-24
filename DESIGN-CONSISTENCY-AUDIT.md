# Auditoría de Consistencia de Diseño — Plastilonas Peruanas SAC

Análisis medido del sistema visual del sitio, con un plan de remediación por
fases y calificado por riesgo. El objetivo es una interfaz perfectamente
alineada (botones, encabezados, colores, espaciado, footer) en móvil y web —
sin romper el trabajo de accesibilidad y modo oscuro ya logrado.

---

## 1. Hallazgos (medidos, no estimados)

| # | Inconsistencia | Magnitud | Qué ve el cliente |
|---|----------------|----------|-------------------|
| 1 | **Literales de color hex** en vez de tokens | **298 usos en 39 archivos** | Nada visible hoy (una capa `!important` los normaliza), pero el color puede desviarse en cada edición |
| 2 | **Padding de botones** ad-hoc | **12+ combinaciones** (`px-4 py-3`, `px-6 py-3`, `px-8 py-3`, `px-9 py-4`…) | Botones de distinta altura/ancho entre secciones |
| 3 | **Ritmo vertical de sección** | **4 valores** (`py-20` ×7, `py-16` ×7, `py-24` ×5, `py-12` ×2) | Espaciado desigual entre bloques |
| 4 | **Radio de esquinas** | **5 valores** (`rounded-2xl` ×68, `rounded-3xl` ×32, `rounded-xl` ×11, `rounded-lg` ×2, `rounded-full` ×50) | Tarjetas con esquinas que no combinan |
| 5 | **`globals.css` por acumulación** | 542 líneas, bloques `@media` duplicados | Mantenimiento frágil; reglas que se pisan |
| 6 | **Bug de mayúsculas en color** | `#34d399` vs `#34D399` | Dos clases CSS para el mismo color |

## 2. La restricción crítica (por esto NO se migra a ciegas)

Los literales de color **son estructurales**. La capa de overrides en
`globals.css` se ancla a los nombres de clase literales exactos:

```css
.text-\[\#059669\] { color: #047857 !important; }         /* corrige contraste WCAG AA */
.dark main .text-\[\#0A2540\] { color: var(--text); }      /* adapta a modo oscuro */
```

Consecuencia: cambiar `text-[#059669]` → `text-brand` en un componente
**revierte silenciosamente la corrección de contraste** (vuelve a 3.77:1, falla
AA) y `text-[#0A2540]` → `text-navy` dentro de `<main>` **rompe el modo
oscuro** (texto navy sobre fondo oscuro). Una refactorización masiva y a ciegas
dañaría el sitio. La migración debe hacerse por componente, retirando el
override correspondiente en el mismo paso, y verificando en `dev`.

## 3. Lo que ya se corrigió (en este parche — seguro y verificado)

- **Deduplicado `globals.css`**: eliminado el bloque `@media (max-width:640px)`
  duplicado y el trío `.product-card` repetido. Las reglas sobreviven en su
  primera aparición → **cero cambio visual** (542 → 526 líneas).
- **Bug de mayúsculas**: `#34d399` → `#34D399` en `MachineryGallery.tsx`.
- **Paleta de tokens completa** en `tailwind.config.ts` (aditivo, sin riesgo):
  `navy`, `brand` (+`brand.text` = `#047857` con contraste AA verificado,
  +`brand.emerald`), `amber`, `whatsapp`. Es el **destino** de la migración.
- Verificado: `tsc` limpio, 27 tests pasan, `next build` exit 0, 69 páginas.

## 4. Plan de remediación por fases (calificado por riesgo)

### Fase 1 — Fundación de tokens · RIESGO BAJO · *hecho en este parche*
Paleta en config + `brand.text` accesible. No cambia nada renderizado; da a los
componentes un token correcto al cual migrar.

### Fase 2 — Migración de color por componente · RIESGO MEDIO · *siguiente*
Por cada componente, en un solo paso atómico y verificado en `dev`:
1. `text-[#0A2540]` → `text-navy dark:text-white`
2. `text-[#059669]` → `text-brand-text` (ya es `#047857`, retira el override)
3. `bg-[#0A2540]` → `bg-navy`, etc.
4. Retirar la regla `!important`/`dark main` correspondiente de `globals.css`.
5. Comparar en `dev` claro y oscuro antes de pasar al siguiente.

Orden sugerido (de menor a mayor riesgo): `SectionHeading` (2 literales, es el
encabezado unificado) → `Footer` → `ProductCard` → `Navbar` → `page.tsx`.

### Fase 3 — Unificación de forma · RIESGO MEDIO
- Botones: migrar los 12+ patrones a `.btn` / `.btn-sm` / `.btn-lg`
  (una definición, altura táctil 44px uniforme). Migrar por página, revisando
  que ningún tamaño intencional se rompa.
- Secciones: `py-16/20/24` → `.section-pad` (2 valores: desktop 5rem, móvil 3rem).
- Radios: estandarizar a 2 valores — tarjetas `rounded-2xl`, acciones `rounded-full`.

### Fase 4 — Cumplimiento automático · RIESGO BAJO
Regla ESLint que prohíbe nuevos literales `-[#...]` en `className`, para que la
consistencia no se vuelva a erosionar. Convierte la disciplina en garantía de CI.

## 5. Por qué este orden gana el mercado

La capa `!important` de hoy funciona pero es deuda: cada nueva página exige otro
override. Al mover la verdad a tokens, el modo oscuro, el contraste AA y la
identidad de marca quedan garantizados por construcción — el sitio se ve
impecable en móvil y web, y **escala** sin volver a introducir inconsistencias.
La consistencia deja de ser una tarea de limpieza recurrente y pasa a ser una
propiedad del sistema.
