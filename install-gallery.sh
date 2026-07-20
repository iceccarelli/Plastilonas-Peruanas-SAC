#!/usr/bin/env bash
# ============================================================================
# install-gallery.sh — Galería ilustrativa del proceso · Plastilonas Peruanas
# ----------------------------------------------------------------------------
# Un solo archivo, idempotente. Escribe los 2 componentes, cablea la home
# contra su ancla actual, y coloca las 71 imágenes desde los dos ZIP del repo.
# Reporta ok/skip/MISS y sale con error si un ancla no existe (nunca corrompe).
# No toca git: al terminar, usted revisa y hace commit.
# ============================================================================
set -euo pipefail

fail(){ echo "MISS: $1" >&2; exit 1; }
[ -f app/page.tsx ] || fail "ejecútelo desde la raíz del repo (no encuentro app/page.tsx)"

# ---------------------------------------------------------------------------
# 1) lib/machinery.ts (sobrescribe siempre: es generado, fuente de verdad)
# ---------------------------------------------------------------------------
cat > lib/machinery.ts <<'PLASTILONAS_EOF_MARKER_9c3f'
/**
 * Galería ILUSTRATIVA del proceso de fabricación — Plastilonas Peruanas SAC.
 *
 * IMPORTANTE (no borrar): estas imágenes son ilustraciones EDUCATIVAS de las
 * *categorías* de maquinaria que intervienen en la fabricación de textiles
 * industriales (Big Bags, geomembranas, carpas, mallas, lonas). NO son
 * fotografías de la planta de Plastilonas. La UI debe rotularlas siempre como
 * "galería ilustrativa del proceso" y nunca como "nuestra maquinaria".
 *
 * Origen: dos lotes de render generados a la especificación del proyecto
 * (dos agentes → dos variantes por máquina). Cada máquina expone 1-2
 * variantes visuales, que la galería permite intercambiar (swipe/drag).
 * El PNG de la variante B de la máquina 02 llegó truncado y fue descartado;
 * se conservan sus WebP intactos. Fuentes verificadas por máquina en `fuente`.
 *
 * Data-driven igual que lib/products.ts: para editar la galería se edita este
 * arreglo, no el componente.
 */

export interface MachineryVariant {
  /** WebP optimizado para web (1600×1200). Siempre presente. */
  webp: string;
  /** Miniatura cuadrada 800×800 para la grilla. Siempre presente. */
  thumb: string;
  /** PNG maestro (1600×1200). Ausente si el master llegó corrupto. */
  png?: string;
}

export interface MachineryItem {
  slug: string;
  orden: number;
  titulo: string;
  /** Texto alternativo para lectores de pantalla (español). */
  alt: string;
  /** Frase educativa que se muestra en la tarjeta. */
  caption: string;
  /** Línea(s) de producto de Plastilonas a la que sirve la máquina. */
  linea: string;
  /** Fuente real verificada del proceso (para trazabilidad interna). */
  fuente: string;
  /** 1-2 variantes visuales de la misma máquina. */
  variants: MachineryVariant[];
}

const BASE = '/images/maquinaria';

export const machinery: MachineryItem[] = [
  {
    slug: '01-extrusion-rafia',
    orden: 1,
    titulo: 'Línea de extrusión de rafia',
    alt: 'Ilustración de una línea de extrusión de cintas de polipropileno (rafia) con extrusora, baño de enfriamiento, horno de estirado y bobinadoras, típica en la fabricación de Big Bags y lonas',
    caption: 'Convierte gránulos de PP en cintas orientadas de alta resistencia: el punto de partida de Big Bags, mallas y lonas de rafia.',
    linea: 'Big Bags / FIBC, mallas, lonas rafia',
    fuente: 'https://fpi-bd.com/manufacturing-process/ (proceso estándar de extrusión de cintas PP para FIBC)',
    variants: [
      { webp: `${BASE}/01-extrusion-rafia-a.webp`, thumb: `${BASE}/01-extrusion-rafia-a-thumb.webp`, png: `${BASE}/01-extrusion-rafia-a.png` },
      { webp: `${BASE}/01-extrusion-rafia-b.webp`, thumb: `${BASE}/01-extrusion-rafia-b-thumb.webp`, png: `${BASE}/01-extrusion-rafia-b.png` },
    ],
  },
  {
    slug: '02-telar-circular',
    orden: 2,
    titulo: 'Telar circular de tejido',
    alt: 'Ilustración de un telar circular tubular que teje cintas de polipropileno en tela tubular continua para el cuerpo de Big Bags',
    caption: 'Teje las cintas de PP en tela tubular: el corazón de la fabricación de Big Bags / FIBC.',
    linea: 'Big Bags / FIBC',
    fuente: 'https://fpi-bd.com/manufacturing-process/ y https://www.global-pak.com/blog/how-bulk-bags-are-manufactured',
    variants: [
      { webp: `${BASE}/02-telar-circular-a.webp`, thumb: `${BASE}/02-telar-circular-a-thumb.webp`, png: `${BASE}/02-telar-circular-a.png` },
      { webp: `${BASE}/02-telar-circular-b.webp`, thumb: `${BASE}/02-telar-circular-b-thumb.webp` },
    ],
  },
  {
    slug: '03-laminado-recubrimiento',
    orden: 3,
    titulo: 'Línea de laminado / extrusión-recubrimiento',
    alt: 'Ilustración de una línea de laminado o extrusión-recubrimiento que aplica film de PP sobre tela tejida para crear barrera de humedad',
    caption: 'Aplica una capa de film polimérico sobre la tela tejida para obtener Big Bags impermeables y lonas plastificadas.',
    linea: 'Big Bags impermeables, lonas plastificadas',
    fuente: 'https://fpi-bd.com/manufacturing-process/ (paso opcional de laminación/coating)',
    variants: [
      { webp: `${BASE}/03-laminado-recubrimiento-a.webp`, thumb: `${BASE}/03-laminado-recubrimiento-a-thumb.webp`, png: `${BASE}/03-laminado-recubrimiento-a.png` },
      { webp: `${BASE}/03-laminado-recubrimiento-b.webp`, thumb: `${BASE}/03-laminado-recubrimiento-b-thumb.webp`, png: `${BASE}/03-laminado-recubrimiento-b.png` },
    ],
  },
  {
    slug: '04-impresora-flexografica',
    orden: 4,
    titulo: 'Impresora flexográfica',
    alt: 'Ilustración de una impresora flexográfica industrial de varios colores para marcar y personalizar tela de polipropileno tejido',
    caption: 'Imprime logos, datos de carga y marcas en los paneles de tela tejida de los Big Bags.',
    linea: 'Big Bags / FIBC',
    fuente: 'https://www.qianfeng-machine.com/printing-machines/woven-bag-stack-type-flexographic-printing-machine (flexografía estándar para PP tejido)',
    variants: [
      { webp: `${BASE}/04-impresora-flexografica-a.webp`, thumb: `${BASE}/04-impresora-flexografica-a-thumb.webp`, png: `${BASE}/04-impresora-flexografica-a.png` },
      { webp: `${BASE}/04-impresora-flexografica-b.webp`, thumb: `${BASE}/04-impresora-flexografica-b-thumb.webp`, png: `${BASE}/04-impresora-flexografica-b.png` },
    ],
  },
  {
    slug: '05-corte-automatico',
    orden: 5,
    titulo: 'Máquina de corte automático de tela técnica',
    alt: 'Ilustración de una máquina de corte automático con mesa y cabezal de precisión para cortar paneles de tela técnica de polipropileno',
    caption: 'Corta con precisión los rollos de tela tejida a las dimensiones requeridas para cada producto.',
    linea: 'Big Bags, mallas, lonas y productos tejidos',
    fuente: 'https://fpi-bd.com/manufacturing-process/ (cutting stage en proceso FIBC)',
    variants: [
      { webp: `${BASE}/05-corte-automatico-a.webp`, thumb: `${BASE}/05-corte-automatico-a-thumb.webp`, png: `${BASE}/05-corte-automatico-a.png` },
      { webp: `${BASE}/05-corte-automatico-b.webp`, thumb: `${BASE}/05-corte-automatico-b-thumb.webp`, png: `${BASE}/05-corte-automatico-b.png` },
    ],
  },
  {
    slug: '06-coser-industrial-bigbags',
    orden: 6,
    titulo: 'Máquina de coser industrial para Big Bags',
    alt: 'Ilustración de una máquina de coser industrial pesada para confeccionar Big Bags, unir paneles y fijar asas de elevación',
    caption: 'Une paneles, cose costuras de refuerzo y fija las asas (webbing) que dan la capacidad de carga al FIBC.',
    linea: 'Big Bags / FIBC',
    fuente: 'https://fibcbigbags.com/fibc-making.php (sewing unit)',
    variants: [
      { webp: `${BASE}/06-coser-industrial-bigbags-a.webp`, thumb: `${BASE}/06-coser-industrial-bigbags-a-thumb.webp`, png: `${BASE}/06-coser-industrial-bigbags-a.png` },
      { webp: `${BASE}/06-coser-industrial-bigbags-b.webp`, thumb: `${BASE}/06-coser-industrial-bigbags-b-thumb.webp`, png: `${BASE}/06-coser-industrial-bigbags-b.png` },
    ],
  },
  {
    slug: '07-calandra-pvc',
    orden: 7,
    titulo: 'Calandra de PVC',
    alt: 'Ilustración de una calandra industrial de rodillos para producir lámina continua de PVC utilizada en geomembranas y lonas',
    caption: 'Forma la lámina de PVC de espesor controlado que sirve de base a geomembranas, carpas y toldos.',
    linea: 'Geomembranas de PVC, carpas, toldos, lonas',
    fuente: 'https://www.geomembrane.com/post/calendering-is-king y https://haogenplast.com/pvc-manufacturing-process/',
    variants: [
      { webp: `${BASE}/07-calandra-pvc-a.webp`, thumb: `${BASE}/07-calandra-pvc-a-thumb.webp`, png: `${BASE}/07-calandra-pvc-a.png` },
      { webp: `${BASE}/07-calandra-pvc-b.webp`, thumb: `${BASE}/07-calandra-pvc-b-thumb.webp`, png: `${BASE}/07-calandra-pvc-b.png` },
    ],
  },
  {
    slug: '08-soldadora-alta-frecuencia',
    orden: 8,
    titulo: 'Soldadora de PVC por alta frecuencia (HF/RF)',
    alt: 'Ilustración de una soldadora de alta frecuencia (RF) con electrodo de barra para unir paneles de lámina o lona PVC de forma hermética en fábrica',
    caption: 'Une paneles de PVC en fábrica mediante radiofrecuencia, creando costuras estancas para geomembranas y carpas.',
    linea: 'Geomembranas, carpas de lona PVC',
    fuente: 'https://skytop.me/products/high-frequency-pvc-welding-machines.html (HF welding para PVC technical textiles)',
    variants: [
      { webp: `${BASE}/08-soldadora-alta-frecuencia-a.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-a-thumb.webp`, png: `${BASE}/08-soldadora-alta-frecuencia-a.png` },
      { webp: `${BASE}/08-soldadora-alta-frecuencia-b.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-b-thumb.webp`, png: `${BASE}/08-soldadora-alta-frecuencia-b.png` },
    ],
  },
  {
    slug: '09-soldadora-cuna-caliente',
    orden: 9,
    titulo: 'Soldadora de cuña caliente',
    alt: 'Ilustración de una soldadora de cuña caliente autopropulsada para realizar costuras largas de geomembrana de PVC en obra',
    caption: 'Solda solapes largos de geomembrana en campo mediante cuña metálica calentada y rodillos de presión.',
    linea: 'Geomembranas de PVC (instalación en obra)',
    fuente: 'https://waterproofspecialist.com/pvc-geomembrane-welding-hdpe-lldpe/ (hot wedge welding)',
    variants: [
      { webp: `${BASE}/09-soldadora-cuna-caliente-a.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-a-thumb.webp`, png: `${BASE}/09-soldadora-cuna-caliente-a.png` },
      { webp: `${BASE}/09-soldadora-cuna-caliente-b.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-b-thumb.webp`, png: `${BASE}/09-soldadora-cuna-caliente-b.png` },
    ],
  },
  {
    slug: '10-soldadora-aire-caliente',
    orden: 10,
    titulo: 'Soldadora de aire caliente / extrusión',
    alt: 'Ilustración de una soldadora de aire caliente o de extrusión portátil para detalle, parches y reparaciones de geomembranas de PVC',
    caption: 'Permite uniones de detalle, parches y reparaciones en geomembranas y lonas mediante aire caliente o extrusión de cordón.',
    linea: 'Geomembranas, carpas (detalle y reparación)',
    fuente: 'https://waterproofspecialist.com/pvc-geomembrane-welding-hdpe-lldpe/ (hot air welding)',
    variants: [
      { webp: `${BASE}/10-soldadora-aire-caliente-a.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-a-thumb.webp`, png: `${BASE}/10-soldadora-aire-caliente-a.png` },
      { webp: `${BASE}/10-soldadora-aire-caliente-b.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-b-thumb.webp`, png: `${BASE}/10-soldadora-aire-caliente-b.png` },
    ],
  },
  {
    slug: '11-curvadora-tubo',
    orden: 11,
    titulo: 'Curvadora / dobladora de tubo',
    alt: 'Ilustración de una máquina curvadora de tubo industrial para formar arcos y estructuras de acero galvanizado destinadas a carpas y hangares',
    caption: 'Dobla tubos de acero galvanizado para crear los arcos y armazones de las carpas y galpones con lona PVC.',
    linea: 'Carpas de lona PVC con estructura metálica galvanizada',
    fuente: 'Equipos estándar de curvatura de tubo para estructuras de invernadero y carpas (proceso típico de fabricación de estructuras ligeras galvanizadas)',
    variants: [
      { webp: `${BASE}/11-curvadora-tubo-a.webp`, thumb: `${BASE}/11-curvadora-tubo-a-thumb.webp`, png: `${BASE}/11-curvadora-tubo-a.png` },
      { webp: `${BASE}/11-curvadora-tubo-b.webp`, thumb: `${BASE}/11-curvadora-tubo-b-thumb.webp`, png: `${BASE}/11-curvadora-tubo-b.png` },
    ],
  },
  {
    slug: '12-telar-raschel',
    orden: 12,
    titulo: 'Telar Raschel',
    alt: 'Ilustración de un telar Raschel de punto por urdimbre que produce mallas de polipropileno o polietileno para uso agrícola y mangas de ventilación',
    caption: 'Teje mallas de punto por urdimbre (Raschel) para mallas antiáfidas, redes agrícolas y mangas de ventilación.',
    linea: 'Mallas antiáfidas / agrícolas, mangas de ventilación',
    fuente: 'https://www.sciencedirect.com/science/article/abs/pii/S1537511021001124 y máquinas Raschel para redes agrícolas',
    variants: [
      { webp: `${BASE}/12-telar-raschel-a.webp`, thumb: `${BASE}/12-telar-raschel-a-thumb.webp`, png: `${BASE}/12-telar-raschel-a.png` },
      { webp: `${BASE}/12-telar-raschel-b.webp`, thumb: `${BASE}/12-telar-raschel-b-thumb.webp`, png: `${BASE}/12-telar-raschel-b.png` },
    ],
  },
];
PLASTILONAS_EOF_MARKER_9c3f
echo "ok   lib/machinery.ts"

# ---------------------------------------------------------------------------
# 2) components/MachineryGallery.tsx
# ---------------------------------------------------------------------------
cat > components/MachineryGallery.tsx <<'PLASTILONAS_EOF_MARKER_9c3f'
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { machinery } from '@/lib/machinery';
import SectionHeading from '@/components/SectionHeading';

/**
 * Galería ILUSTRATIVA del proceso de fabricación.
 *
 * Educa al comprador sobre CÓMO se fabrican los productos de Plastilonas,
 * mostrando las categorías de maquinaria del sector. Se rotula de forma
 * explícita como ilustrativa (no es una foto de la planta): esa honestidad
 * es justamente lo que un ingeniero de compras premia.
 *
 * Interacción:
 *  - Swipe/drag horizontal (framer-motion) para pasar de máquina en máquina.
 *  - Flechas + teclado (←/→) para accesibilidad.
 *  - Cada máquina puede tener 2 variantes visuales: un toque a "Ver otra vista"
 *    las intercambia sin salir de la tarjeta.
 *  - Miniaturas debajo para salto directo.
 *
 * Robustez heredada de HeroCarousel: una imagen que falle se oculta y deja el
 * fondo pulido; nunca un ícono de imagen rota. `prefers-reduced-motion`
 * desactiva el deslizamiento animado.
 */

const SWIPE_CONFIDENCE = 60; // px de arrastre mínimo para cambiar de slide

export default function MachineryGallery() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [variantByIndex, setVariantByIndex] = useState<Record<number, number>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const regionRef = useRef<HTMLDivElement>(null);

  const total = machinery.length;
  const item = machinery[index];
  const variantIdx = variantByIndex[index] ?? 0;
  const variant = item.variants[variantIdx] ?? item.variants[0];
  const hasAlt = item.variants.length > 1;

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => (prev + dir + total) % total);
    },
    [total]
  );

  const jump = useCallback(
    (target: number) => {
      setDirection(target > index ? 1 : -1);
      setIndex(target);
    },
    [index]
  );

  // Teclado: solo cuando la galería tiene el foco, para no secuestrar la página.
  useEffect(() => {
    const node = regionRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [go]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_CONFIDENCE) go(1);
    else if (info.offset.x > SWIPE_CONFIDENCE) go(-1);
  };

  const swapVariant = () =>
    setVariantByIndex((m) => ({
      ...m,
      [index]: ((variantByIndex[index] ?? 0) + 1) % item.variants.length,
    }));

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Cómo se fabrica"
          title="El proceso, paso a paso"
          description="Una galería ilustrativa de la maquinaria que interviene en la fabricación de textiles industriales — para que sepa exactamente qué hay detrás de cada Big Bag, geomembrana y carpa."
          className="mb-8"
        />

        {/* Aviso de honestidad: son ilustraciones del proceso, no fotos de planta. */}
        <p className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Info className="w-3.5 h-3.5 shrink-0" />
          Imágenes ilustrativas de las categorías de maquinaria del sector; no
          corresponden a una fotografía específica de nuestra planta.
        </p>

        <div
          ref={regionRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carrusel"
          aria-label="Galería del proceso de fabricación"
          className="relative rounded-2xl overflow-hidden bg-[#0A2540] outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2"
        >
          {/* Fondo base garantizado si la imagen no carga. */}
          <div className="absolute inset-0 bg-[radial-gradient(#1A3A5C_0.8px,transparent_1px)] bg-[length:6px_6px] opacity-40" />

          <div className="relative aspect-[16/10] md:aspect-[16/8]">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={`${index}-${variantIdx}`}
                custom={direction}
                initial={{ opacity: 0, x: direction >= 0 ? 80 : -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction >= 0 ? -80 : 80 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={onDragEnd}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                {failed[variant.webp] ? (
                  <div className="h-full w-full flex items-center justify-center text-white/60 text-sm">
                    {item.titulo}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={variant.webp}
                    alt={item.alt}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                    onError={() => setFailed((f) => ({ ...f, [variant.webp]: true }))}
                    className="h-full w-full object-cover object-center select-none pointer-events-none"
                  />
                )}
                {/* Scrim inferior para legibilidad del rótulo. */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/70 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Rótulo de la máquina. */}
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 pointer-events-none">
              <span className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#34d399] font-semibold mb-1.5">
                Paso {item.orden} de {total} · {item.linea}
              </span>
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
                {item.titulo}
              </h3>
              <p className="mt-1.5 text-sm md:text-base text-white/80 max-w-2xl">
                {item.caption}
              </p>
            </div>

            {/* Controles prev/next. */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Máquina anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-[#0A2540] hover:bg-white shadow-md transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Máquina siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-[#0A2540] hover:bg-white shadow-md transition"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Cambiar variante visual (solo si existe una segunda vista). */}
            {hasAlt && (
              <button
                type="button"
                onClick={swapVariant}
                className="absolute top-3 right-3 text-xs font-medium bg-white/90 text-[#0A2540] hover:bg-white rounded-full px-3 py-1.5 shadow-md transition"
              >
                Ver otra vista
              </button>
            )}
          </div>
        </div>

        {/* Miniaturas: salto directo + progreso visible. */}
        <div className="mt-4 grid grid-cols-6 md:grid-cols-12 gap-2">
          {machinery.map((m, i) => {
            const t = m.variants[variantByIndex[i] ?? 0] ?? m.variants[0];
            const active = i === index;
            return (
              <button
                key={m.slug}
                type="button"
                onClick={() => jump(i)}
                aria-label={`Ir a: ${m.titulo}`}
                aria-current={active}
                className={`relative aspect-square rounded-lg overflow-hidden ring-2 transition ${
                  active ? 'ring-[#059669]' : 'ring-transparent hover:ring-gray-300'
                }`}
              >
                {failed[t.thumb] ? (
                  <span className="absolute inset-0 grid place-items-center text-[10px] text-gray-400 bg-gray-100">
                    {m.orden}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.thumb}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailed((f) => ({ ...f, [t.thumb]: true }))}
                    className={`h-full w-full object-cover transition ${active ? '' : 'opacity-70 hover:opacity-100'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
PLASTILONAS_EOF_MARKER_9c3f
echo "ok   components/MachineryGallery.tsx"

# ---------------------------------------------------------------------------
# 3) Cablear la home (idempotente, anclado al page.tsx ACTUAL)
# ---------------------------------------------------------------------------
PAGE=app/page.tsx

if grep -q "MachineryGallery" "$PAGE"; then
  echo "skip page.tsx ya cablea MachineryGallery"
else
  # 3a. import — tras el import de SectionHeading
  IMPORT_ANCHOR="import SectionHeading from '@/components/SectionHeading';"
  grep -qF "$IMPORT_ANCHOR" "$PAGE" || fail "no encuentro el import de SectionHeading en $PAGE"
  # inserta la línea de import justo después del ancla
  awk -v a="$IMPORT_ANCHOR" '
    { print }
    $0==a && !done { print "import MachineryGallery from '"'"'@/components/MachineryGallery'"'"';"; done=1 }
  ' "$PAGE" > "$PAGE.tmp" && mv "$PAGE.tmp" "$PAGE"
  echo "ok   import agregado"

  # 3b. sección — antes del bloque SERVICIOS actual
  SEC_ANCHOR="{/* ===== 4 · SERVICIOS"
  grep -qF "$SEC_ANCHOR" "$PAGE" || fail "no encuentro el ancla de la sección SERVICIOS en $PAGE"
  awk -v a="$SEC_ANCHOR" '
    index($0,a) && !done {
      print "      {/* CÓMO SE FABRICA — galería ilustrativa del proceso */}"
      print "      <MachineryGallery />"
      print ""
      done=1
    }
    { print }
  ' "$PAGE" > "$PAGE.tmp" && mv "$PAGE.tmp" "$PAGE"
  echo "ok   sección <MachineryGallery /> insertada"
fi

# ---------------------------------------------------------------------------
# 4) Imágenes desde los dos ZIP (71; descarta el PNG truncado de #02-B)
# ---------------------------------------------------------------------------
Z0="galeria-maquinaria-plastilonas.zip"; Z1="galeria-maquinaria-plastilonas (1).zip"
DEST="public/images/maquinaria"
for z in "$Z0" "$Z1"; do [ -f "$z" ] || fail "falta $z en la raíz (recupérelo con: git checkout origin/main -- \"$z\")"; done
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/a" "$TMP/b" "$DEST"
unzip -qo "$Z0" -d "$TMP/a"; unzip -qo "$Z1" -d "$TMP/b"
A="$TMP/a/galeria-maquinaria-plastilonas/img"; B="$TMP/b/galeria-maquinaria-plastilonas/img"
map_a=(01-extrusion-rafia 02-telar-circular 03-laminado-recubrimiento 04-impresora-flexografica 05-corte-automatico 06-coser-industrial-bigbags 07-calandra-pvc 08-soldadora-alta-frecuencia 09-soldadora-cuna-caliente 10-soldadora-aire-caliente 11-curvadora-tubo 12-telar-raschel)
map_b=(01-extrusion-rafia 02-telar-circular 03-laminado-recubrimiento 04-impresora-flexografica 05-corte-automatico 06-coser-bigbags 07-calandra-pvc 08-soldadora-hf 09-soldadora-cuna 10-soldadora-aire 11-curvadora-tubo 12-telar-raschel)
map_d=(01-extrusion-rafia 02-telar-circular 03-laminado-recubrimiento 04-impresora-flexografica 05-corte-automatico 06-coser-bigbags 07-calandra-pvc 08-soldadora-alta-frecuencia 09-soldadora-cuna-caliente 10-soldadora-aire-caliente 11-curvadora-tubo 12-telar-raschel)
cpx(){ [ -f "$1" ] && { cp -f "$1" "$2"; } || echo "   (sin origen: $(basename "$2"))"; }
for i in "${!map_d[@]}"; do d="${map_d[$i]}"; a="${map_a[$i]}"; b="${map_b[$i]}"
  cpx "$A/$a.png" "$DEST/$d-a.png"; cpx "$A/$a.webp" "$DEST/$d-a.webp"; cpx "$A/$a-thumb.webp" "$DEST/$d-a-thumb.webp"
  if [ "$d" = "02-telar-circular" ]; then echo "skip 02-telar-circular-b.png (PNG truncado; se usan sus WebP)"; else cpx "$B/$b.png" "$DEST/$d-b.png"; fi
  cpx "$B/$b.webp" "$DEST/$d-b.webp"; cpx "$B/$b-thumb.webp" "$DEST/$d-b-thumb.webp"
done
N=$(ls -1 "$DEST" | wc -l | tr -d ' ')
echo "ok   imágenes en $DEST: $N (esperado 71)"
[ "$N" = "71" ] || echo "AVISO: se esperaban 71 imágenes, hay $N"

echo "----"
echo "Listo. Revise con: git status  y luego:"
echo "  git add app/page.tsx components/MachineryGallery.tsx lib/machinery.ts public/images/maquinaria"
echo "  git commit -m \"feat(gallery): galería ilustrativa del proceso de fabricación\""
