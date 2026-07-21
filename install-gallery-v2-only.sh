#!/usr/bin/env bash
# ============================================================================
# install-gallery-v2-only.sh — Galería estilo AWS usando SOLO los dos zips v2
# fotorrealistas. RETIRA las imágenes CGI antiguas (a/b) y deja únicamente las
# 4 vistas fotorrealistas por máquina (c = set1-a, d = set1-b, e = set2-a,
# f = set2-b). Idempotente. No toca git ni app/page.tsx.
# ============================================================================
set -euo pipefail
fail(){ echo "MISS: $1" >&2; exit 1; }
[ -f app/page.tsx ] || fail "ejecútelo desde la raíz del repo"
grep -q "MachineryGallery" app/page.tsx || fail "app/page.tsx no cablea <MachineryGallery/>"

Z1="galeria-maquinaria-v2-fotorrealista (1).zip"
Z2="galeria-maquinaria-v2-fotorrealista (2).zip"
for z in "$Z1" "$Z2"; do [ -f "$z" ] || fail "falta $z (git checkout origin/main -- \"$z\")"; done
DEST="public/images/maquinaria"; mkdir -p "$DEST"

# 1) RETIRAR imágenes antiguas CGI (variantes a/b) por completo.
rm -f "$DEST"/*-a.png "$DEST"/*-a.webp "$DEST"/*-a-thumb.webp \
      "$DEST"/*-b.png "$DEST"/*-b.webp "$DEST"/*-b-thumb.webp 2>/dev/null || true
echo "ok   imágenes CGI antiguas (a/b) retiradas"

# 2) Colocar SOLO las v2: set1 -> c/d, set2 -> e/f.
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
unzip -qo "$Z1" -d "$TMP/s1"; unzip -qo "$Z2" -d "$TMP/s2"
S1="$(dirname "$(find "$TMP/s1" -name '01-extrusion-rafia-a.webp' | head -1)")"
S2="$(dirname "$(find "$TMP/s2" -name '01-extrusion-rafia-a.webp' | head -1)")"
[ -d "$S1" ] || fail "no encuentro imágenes dentro de $Z1"
[ -d "$S2" ] || fail "no encuentro imágenes dentro de $Z2"
slugs=(01-extrusion-rafia 02-telar-circular 03-laminado-recubrimiento 04-impresora-flexografica 05-corte-automatico 06-coser-bigbags 07-calandra-pvc 08-soldadora-alta-frecuencia 09-soldadora-cuna-caliente 10-soldadora-aire-caliente 11-curvadora-tubo 12-telar-raschel)
cpv(){ for ext in webp png; do [ -f "$1/$2-$3.$ext" ] && cp -f "$1/$2-$3.$ext" "$DEST/$2-$4.$ext"; done; [ -f "$1/$2-$3-thumb.webp" ] && cp -f "$1/$2-$3-thumb.webp" "$DEST/$2-$4-thumb.webp"; :; }
for s in "${slugs[@]}"; do cpv "$S1" "$s" a c; cpv "$S1" "$s" b d; cpv "$S2" "$s" a e; cpv "$S2" "$s" b f; done
echo "ok   imágenes v2 colocadas ($(ls -1 "$DEST" | wc -l | tr -d ' ') archivos, solo c/d/e/f)"

# 3) Datos + componente.
cat > lib/machinery.ts <<'PLASTILONAS_EOF_9c3f'
/**
 * Galería ILUSTRATIVA del proceso de fabricación — Plastilonas Peruanas SAC.
 *
 * Imágenes EDUCATIVAS y FOTORREALISTAS de las categorías de maquinaria del
 * sector (Big Bags, geomembranas, carpas, mallas, lonas). NO son fotografías
 * de la planta de Plastilonas; la UI las rotula siempre como "ilustrativa".
 *
 * Solo se usan los DOS lotes fotorrealistas v2 (4 vistas por máquina). Los
 * renders CGI anteriores fueron retirados. El carrusel (estilo AWS) rota las
 * vistas de una misma máquina cada ~3 s con Ken Burns y avanza de máquina en
 * máquina cada ~5 s; el usuario puede deslizar y se pausa al pasar el cursor.
 */

export interface MachineryView {
  webp: string;
  thumb: string;
}

export interface MachineryItem {
  slug: string;
  orden: number;
  titulo: string;
  alt: string;
  caption: string;
  linea: string;
  fuente: string;
  /** 4 vistas fotorrealistas de la misma máquina (rotan con Ken Burns). */
  views: MachineryView[];
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
    views: [
      { webp: `${BASE}/01-extrusion-rafia-c.webp`, thumb: `${BASE}/01-extrusion-rafia-c-thumb.webp` },
      { webp: `${BASE}/01-extrusion-rafia-d.webp`, thumb: `${BASE}/01-extrusion-rafia-d-thumb.webp` },
      { webp: `${BASE}/01-extrusion-rafia-e.webp`, thumb: `${BASE}/01-extrusion-rafia-e-thumb.webp` },
      { webp: `${BASE}/01-extrusion-rafia-f.webp`, thumb: `${BASE}/01-extrusion-rafia-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/02-telar-circular-c.webp`, thumb: `${BASE}/02-telar-circular-c-thumb.webp` },
      { webp: `${BASE}/02-telar-circular-d.webp`, thumb: `${BASE}/02-telar-circular-d-thumb.webp` },
      { webp: `${BASE}/02-telar-circular-e.webp`, thumb: `${BASE}/02-telar-circular-e-thumb.webp` },
      { webp: `${BASE}/02-telar-circular-f.webp`, thumb: `${BASE}/02-telar-circular-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/03-laminado-recubrimiento-c.webp`, thumb: `${BASE}/03-laminado-recubrimiento-c-thumb.webp` },
      { webp: `${BASE}/03-laminado-recubrimiento-d.webp`, thumb: `${BASE}/03-laminado-recubrimiento-d-thumb.webp` },
      { webp: `${BASE}/03-laminado-recubrimiento-e.webp`, thumb: `${BASE}/03-laminado-recubrimiento-e-thumb.webp` },
      { webp: `${BASE}/03-laminado-recubrimiento-f.webp`, thumb: `${BASE}/03-laminado-recubrimiento-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/04-impresora-flexografica-c.webp`, thumb: `${BASE}/04-impresora-flexografica-c-thumb.webp` },
      { webp: `${BASE}/04-impresora-flexografica-d.webp`, thumb: `${BASE}/04-impresora-flexografica-d-thumb.webp` },
      { webp: `${BASE}/04-impresora-flexografica-e.webp`, thumb: `${BASE}/04-impresora-flexografica-e-thumb.webp` },
      { webp: `${BASE}/04-impresora-flexografica-f.webp`, thumb: `${BASE}/04-impresora-flexografica-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/05-corte-automatico-c.webp`, thumb: `${BASE}/05-corte-automatico-c-thumb.webp` },
      { webp: `${BASE}/05-corte-automatico-d.webp`, thumb: `${BASE}/05-corte-automatico-d-thumb.webp` },
      { webp: `${BASE}/05-corte-automatico-e.webp`, thumb: `${BASE}/05-corte-automatico-e-thumb.webp` },
      { webp: `${BASE}/05-corte-automatico-f.webp`, thumb: `${BASE}/05-corte-automatico-f-thumb.webp` },
    ],
  },
  {
    slug: '06-coser-bigbags',
    orden: 6,
    titulo: 'Máquina de coser industrial para Big Bags',
    alt: 'Ilustración de una máquina de coser industrial pesada para confeccionar Big Bags, unir paneles y fijar asas de elevación',
    caption: 'Une paneles, cose costuras de refuerzo y fija las asas (webbing) que dan la capacidad de carga al FIBC.',
    linea: 'Big Bags / FIBC',
    fuente: 'https://fibcbigbags.com/fibc-making.php (sewing unit)',
    views: [
      { webp: `${BASE}/06-coser-bigbags-c.webp`, thumb: `${BASE}/06-coser-bigbags-c-thumb.webp` },
      { webp: `${BASE}/06-coser-bigbags-d.webp`, thumb: `${BASE}/06-coser-bigbags-d-thumb.webp` },
      { webp: `${BASE}/06-coser-bigbags-e.webp`, thumb: `${BASE}/06-coser-bigbags-e-thumb.webp` },
      { webp: `${BASE}/06-coser-bigbags-f.webp`, thumb: `${BASE}/06-coser-bigbags-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/07-calandra-pvc-c.webp`, thumb: `${BASE}/07-calandra-pvc-c-thumb.webp` },
      { webp: `${BASE}/07-calandra-pvc-d.webp`, thumb: `${BASE}/07-calandra-pvc-d-thumb.webp` },
      { webp: `${BASE}/07-calandra-pvc-e.webp`, thumb: `${BASE}/07-calandra-pvc-e-thumb.webp` },
      { webp: `${BASE}/07-calandra-pvc-f.webp`, thumb: `${BASE}/07-calandra-pvc-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/08-soldadora-alta-frecuencia-c.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-c-thumb.webp` },
      { webp: `${BASE}/08-soldadora-alta-frecuencia-d.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-d-thumb.webp` },
      { webp: `${BASE}/08-soldadora-alta-frecuencia-e.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-e-thumb.webp` },
      { webp: `${BASE}/08-soldadora-alta-frecuencia-f.webp`, thumb: `${BASE}/08-soldadora-alta-frecuencia-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/09-soldadora-cuna-caliente-c.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-c-thumb.webp` },
      { webp: `${BASE}/09-soldadora-cuna-caliente-d.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-d-thumb.webp` },
      { webp: `${BASE}/09-soldadora-cuna-caliente-e.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-e-thumb.webp` },
      { webp: `${BASE}/09-soldadora-cuna-caliente-f.webp`, thumb: `${BASE}/09-soldadora-cuna-caliente-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/10-soldadora-aire-caliente-c.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-c-thumb.webp` },
      { webp: `${BASE}/10-soldadora-aire-caliente-d.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-d-thumb.webp` },
      { webp: `${BASE}/10-soldadora-aire-caliente-e.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-e-thumb.webp` },
      { webp: `${BASE}/10-soldadora-aire-caliente-f.webp`, thumb: `${BASE}/10-soldadora-aire-caliente-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/11-curvadora-tubo-c.webp`, thumb: `${BASE}/11-curvadora-tubo-c-thumb.webp` },
      { webp: `${BASE}/11-curvadora-tubo-d.webp`, thumb: `${BASE}/11-curvadora-tubo-d-thumb.webp` },
      { webp: `${BASE}/11-curvadora-tubo-e.webp`, thumb: `${BASE}/11-curvadora-tubo-e-thumb.webp` },
      { webp: `${BASE}/11-curvadora-tubo-f.webp`, thumb: `${BASE}/11-curvadora-tubo-f-thumb.webp` },
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
    views: [
      { webp: `${BASE}/12-telar-raschel-c.webp`, thumb: `${BASE}/12-telar-raschel-c-thumb.webp` },
      { webp: `${BASE}/12-telar-raschel-d.webp`, thumb: `${BASE}/12-telar-raschel-d-thumb.webp` },
      { webp: `${BASE}/12-telar-raschel-e.webp`, thumb: `${BASE}/12-telar-raschel-e-thumb.webp` },
      { webp: `${BASE}/12-telar-raschel-f.webp`, thumb: `${BASE}/12-telar-raschel-f-thumb.webp` },
    ],
  },
];
PLASTILONAS_EOF_9c3f
echo "ok   lib/machinery.ts (solo v2, 4 vistas por máquina)"

cat > components/MachineryGallery.tsx <<'PLASTILONAS_EOF_9c3f'
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, Info, Pause, Play } from 'lucide-react';
import { machinery } from '@/lib/machinery';
import SectionHeading from '@/components/SectionHeading';

/**
 * Galería ILUSTRATIVA del proceso — estilo aws.amazon.com.
 *
 * - Escenario central dominante con tarjetas vecinas asomando (solo escritorio).
 * - Deslizamiento tipo Tinder/Bumble: arrastre horizontal con umbral + inercia.
 * - Ken Burns sobre la imagen; las vistas de una misma máquina rotan cada 3 s.
 * - La diapositiva (máquina) avanza sola cada 5 s. Se PAUSA al pasar el cursor
 *   o mantener pulsado, para no molestar a quien lee la ficha.
 * - Móvil: una sola tarjeta, sin vecinos.
 *
 * Honestidad: rotulada como ilustrativa; no es foto de la planta.
 * Robustez: una imagen que no cargue no rompe el escenario (respaldo con título).
 */

const SLIDE_MS = 5000; // avance automático de máquina
const KENBURNS_MS = 3000; // rotación de vista dentro de la máquina
const SWIPE_DISTANCE = 60; // px
const SWIPE_VELOCITY = 400; // px/s

export default function MachineryGallery() {
  const total = machinery.length;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const [view, setView] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const regionRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  const item = machinery[index];
  const views = item.views;
  const current = views[view % views.length];

  const paginate = useCallback(
    (d: number) => {
      setDir(d);
      setView(0);
      setIndex((p) => (p + d + total) % total);
    },
    [total]
  );

  const goTo = useCallback(
    (target: number) => {
      if (target === index) return;
      setDir(target > index ? 1 : -1);
      setView(0);
      setIndex(target);
    },
    [index]
  );

  const running = autoplay && !paused;

  // Avance de máquina cada 5 s.
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => paginate(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [running, index, paginate]);

  // Rotación de vista (Ken Burns) cada 3 s dentro de la máquina activa.
  useEffect(() => {
    if (!running || views.length <= 1) return;
    const t = setInterval(() => setView((v) => (v + 1) % views.length), KENBURNS_MS);
    return () => clearInterval(t);
  }, [running, views.length, index]);

  // Teclado ←/→ con foco en la galería.
  useEffect(() => {
    const node = regionRef.current;
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); paginate(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); paginate(-1); }
      if (e.key === ' ') { e.preventDefault(); setAutoplay((a) => !a); }
    };
    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, [paginate]);

  // Autocentrar miniatura activa.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index]);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    const swipe = Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY;
    if (!swipe) return;
    paginate(info.offset.x < 0 ? 1 : -1);
  };

  // Vecinos para el efecto AWS (asoman a los lados, solo escritorio).
  const prevItem = machinery[(index - 1 + total) % total];
  const nextItem = machinery[(index + 1) % total];

  const variants = useMemo(
    () => ({
      enter: (d: number) => ({ x: d >= 0 ? '60%' : '-60%', opacity: 0, scale: 0.96 }),
      center: { x: 0, opacity: 1, scale: 1 },
      exit: (d: number) => ({ x: d >= 0 ? '-60%' : '60%', opacity: 0, scale: 0.96 }),
    }),
    []
  );

  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Cómo se fabrica"
          title="El proceso, paso a paso"
          description="Doce categorías de maquinaria que intervienen en la fabricación de textiles industriales — para que vea exactamente qué hay detrás de cada Big Bag, geomembrana y carpa."
          className="mb-6"
        />

        <div className="flex items-center justify-between mb-5">
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Imágenes ilustrativas de las categorías de maquinaria del sector; no
            corresponden a una fotografía específica de nuestra planta.
          </p>
          <button
            type="button"
            onClick={() => setAutoplay((a) => !a)}
            aria-label={autoplay ? 'Pausar reproducción' : 'Reproducir'}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#0A2540] transition"
          >
            {autoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoplay ? 'Pausar' : 'Reproducir'}
          </button>
        </div>

        {/* ===== Escenario estilo AWS ===== */}
        <div
          ref={regionRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carrusel"
          aria-label="Galería del proceso de fabricación"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-4 rounded-2xl"
        >
          <div className="relative flex items-stretch justify-center gap-4">
            {/* Vecino izquierdo (asoma, solo escritorio) */}
            <NeighborCard item={prevItem} side="left" onClick={() => paginate(-1)} failed={failed} setFailed={setFailed} />

            {/* Tarjeta central */}
            <div className="relative w-full lg:w-[68%] shrink-0">
              <div className="relative aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-[#0A2540] shadow-xl">
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.div
                    key={index}
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={onDragEnd}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  >
                    {/* Ken Burns: cross-fade + lento zoom/pan por vista */}
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={view % views.length}
                        initial={{ opacity: 0, scale: 1.12 }}
                        animate={{ opacity: 1, scale: 1.0 }}
                        exit={{ opacity: 0 }}
                        transition={{ opacity: { duration: 0.9 }, scale: { duration: KENBURNS_MS / 1000 + 1, ease: 'linear' } }}
                        className="absolute inset-0"
                      >
                        {failed[current.webp] ? (
                          <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
                            {item.titulo}
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={current.webp}
                            alt={item.alt}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            draggable={false}
                            onError={() => setFailed((f) => ({ ...f, [current.webp]: true }))}
                            className="absolute inset-0 h-full w-full object-cover object-center select-none pointer-events-none"
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/70 to-transparent pointer-events-none" />

                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 pointer-events-none">
                      <span className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#34d399] font-semibold mb-2">
                        Paso {item.orden} de {total} · {item.linea}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                        {item.titulo}
                      </h3>
                      <p className="mt-2 text-sm md:text-base text-white/85 max-w-2xl">
                        {item.caption}
                      </p>
                      {/* Puntos de vista (Ken Burns) */}
                      {views.length > 1 && (
                        <div className="flex gap-1.5 mt-4">
                          {views.map((_, vi) => (
                            <span
                              key={vi}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                vi === view % views.length ? 'w-5 bg-[#34d399]' : 'w-1.5 bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Controles */}
                <button
                  type="button"
                  onClick={() => paginate(-1)}
                  aria-label="Máquina anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-11 h-11 rounded-full bg-white/90 text-[#0A2540] hover:bg-white shadow-lg transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => paginate(1)}
                  aria-label="Máquina siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-11 h-11 rounded-full bg-white/90 text-[#0A2540] hover:bg-white shadow-lg transition"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Vecino derecho */}
            <NeighborCard item={nextItem} side="right" onClick={() => paginate(1)} failed={failed} setFailed={setFailed} />
          </div>
        </div>

        {/* Contador + barra de progreso de máquinas */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <span className="text-xs font-medium text-gray-500 tabular-nums">
            {String(item.orden).padStart(2, '0')} / {total}
          </span>
          <div className="hidden sm:flex gap-1">
            {machinery.map((m, i) => (
              <button
                key={m.slug}
                type="button"
                aria-label={`Ir a ${m.titulo}`}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all ${i === index ? 'w-6 bg-[#059669]' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>

        {/* Filmstrip con nombres */}
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x
                     [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5
                     [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
          role="tablist"
          aria-label="Seleccionar máquina"
        >
          {machinery.map((m, i) => {
            const t = m.views[0];
            const active = i === index;
            return (
              <button
                key={m.slug}
                ref={active ? activeThumbRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${m.orden}. ${m.titulo}`}
                onClick={() => goTo(i)}
                className={`group relative shrink-0 snap-start w-36 sm:w-44 rounded-xl overflow-hidden text-left ring-1 transition-all ${
                  active ? 'ring-2 ring-[#059669] shadow-md' : 'ring-gray-200 hover:ring-gray-400 hover:shadow-sm'
                }`}
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {failed[t.thumb] ? (
                    <span className="absolute inset-0 grid place-items-center text-gray-400 text-xs font-medium px-2 text-center">
                      {m.orden}. {m.titulo}
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={() => setFailed((f) => ({ ...f, [t.thumb]: true }))}
                      className={`h-full w-full object-cover transition ${active ? '' : 'opacity-80 group-hover:opacity-100'}`}
                    />
                  )}
                  <span className="absolute top-1.5 left-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-[#0A2540]/85 text-white text-[10px] font-semibold tabular-nums">
                    {m.orden}
                  </span>
                </div>
                <div className={`px-2.5 py-2 ${active ? 'bg-[#059669]/5' : 'bg-white'}`}>
                  <p className={`text-xs font-medium leading-snug line-clamp-2 ${active ? 'text-[#0A2540]' : 'text-gray-600'}`}>
                    {m.titulo}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          Deslice para explorar · las vistas rotan solas · pase el cursor para pausar
        </p>
      </div>
    </section>
  );
}

/* Tarjeta vecina que asoma a los lados (solo escritorio, estilo AWS). */
function NeighborCard({
  item,
  side,
  onClick,
  failed,
  setFailed,
}: {
  item: (typeof machinery)[number];
  side: 'left' | 'right';
  onClick: () => void;
  failed: Record<string, boolean>;
  setFailed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const v = item.views[0];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ver ${item.titulo}`}
      tabIndex={-1}
      className={`relative hidden lg:block w-[16%] shrink-0 rounded-2xl overflow-hidden opacity-55 hover:opacity-80 transition ${
        side === 'left' ? 'origin-right' : 'origin-left'
      }`}
    >
      <div className="relative aspect-[16/9] h-full bg-[#0A2540]">
        {!failed[v.webp] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.webp}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed((f) => ({ ...f, [v.webp]: true }))}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[#0A2540]/30" />
      </div>
    </button>
  );
}
PLASTILONAS_EOF_9c3f
echo "ok   components/MachineryGallery.tsx (estilo AWS)"
echo "----"
echo "Verifique:  rm -rf .next && npm run build"
echo "Commit:     git add lib/machinery.ts components/MachineryGallery.tsx public/images/maquinaria"
echo "            git commit -m \"feat(gallery): solo imágenes v2 fotorrealistas + carrusel AWS\""
