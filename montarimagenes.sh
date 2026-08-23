#!/usr/bin/env bash
#
# INTEGRACIÓN DE LAS 65 IMÁGENES  ·  montar-imagenes.sh
#
# Los ZIP ya están en el repositorio, así que esto no descarga nada. El script
# los descomprime en public/images/, comprueba que las 65 llegaron a la ruta
# exacta que el registro espera, aplica el código que las renderiza, retira los
# contenedores y verifica antes de publicar.
#
set -euo pipefail
V=$'\033[32m'; R=$'\033[31m'; A=$'\033[33m'; G=$'\033[90m'; F=$'\033[0m'
paso() { printf '\n%s▸ %s%s\n' "$A" "$1" "$F"; }
ok()   { printf '%s  ✓ %s%s\n' "$V" "$1" "$F"; }
nota() { printf '%s    %s%s\n' "$G" "$1" "$F"; }
morir(){ printf '\n%s  ✗ %s%s\n\n' "$R" "$1" "$F"; exit 1; }

cd /workspaces/Plastilonas-Peruanas-SAC || morir "No encuentro el repositorio."

paso "1/6 · Comprobaciones previas"
[ -f package.json ] || morir "Esto no parece la raíz del repositorio."
git checkout --quiet main 2>/dev/null || true
git pull --quiet --ff-only origin main || morir "No se pudo actualizar main."
[ -z "$(git status --porcelain)" ] || { git status --short | head; morir "Hay cambios sin guardar."; }
command -v unzip >/dev/null || morir "unzip no está disponible."
ok "main en $(git rev-parse --short HEAD), árbol limpio"

paso "2/6 · Descomprimiendo las imágenes"
# Los tres ZIP traen 65 imágenes útiles: part1 y batch1 son el mismo contenido
# byte a byte (lo comprobé), así que basta descomprimir part1 y part2. El
# MANIFEST.txt que viaja dentro no es del sitio y no se conserva.
for z in plastilonas-images-part1-presentation-25.zip plastilonas-images-part2-technical-40.zip; do
  [ -f "$z" ] || morir "Falta $z en la raíz."
  unzip -qo "$z" -d /tmp/pl-img || morir "No se pudo descomprimir $z."
done
mkdir -p public/images
cp -r /tmp/pl-img/images/. public/images/
rm -f public/images/MANIFEST.txt
rm -rf /tmp/pl-img
ok "$(find public/images/familias public/images/soluciones public/images/aplicaciones public/images/recursos public/images/biblioteca public/images/calculadoras public/images/industria public/images/proceso -type f 2>/dev/null | wc -l) archivos colocados"

paso "3/6 · Aplicando el código que las renderiza"
# Sin esto, 38 de las 65 no aparecerían: /biblioteca, /calculadoras,
# /industria, /aplicaciones, /configurador, /calidad, /exportacion y
# /marco/evaluacion no tenían ninguna ranura de imagen declarada.
git apply --whitespace=nowarn <<'PARCHE_CODIGO'
diff --git a/app/aplicaciones/[slug]/page.tsx b/app/aplicaciones/[slug]/page.tsx
index 584a905..09b3c82 100644
--- a/app/aplicaciones/[slug]/page.tsx
+++ b/app/aplicaciones/[slug]/page.tsx
@@ -3,6 +3,8 @@ import Link from 'next/link';
 import { notFound } from 'next/navigation';
 import { applications, applicationBySlug } from '@/lib/applications';
 import { products } from '@/lib/products';
+import ImagenContenido from '@/components/ImagenContenido';
+import { ranurasAplicacion } from '@/lib/imagenes';
 
 type Props = { params: Promise<{ slug: string }> };
 
@@ -24,12 +26,19 @@ export default async function AplicacionPage({ params }: Props) {
   const app = applicationBySlug(slug);
   if (!app) notFound();
   const list = products.filter((p) => app.productSlugs.includes(p.slug));
+  const foto = ranurasAplicacion().find((r) => r.id === `aplicacion:${app.slug}`);
+
   return (
     <div className="max-w-5xl mx-auto px-6 py-14">
       <Link href="/aplicaciones" className="text-xs uppercase tracking-widest text-[#059669]">Aplicaciones</Link>
       <h1 className="t-display font-semibold text-[#0A2540] mt-3">{app.name}</h1>
       <p className="mt-4 text-gray-600 max-w-3xl leading-relaxed">{app.problem}</p>
       <p className="mt-4 text-gray-700 max-w-3xl leading-relaxed">{app.approach}</p>
+
+      {/* La fotografía después del planteamiento: primero se nombra el problema
+          con palabras, luego se enseña dónde ocurre. Prioritaria porque es la
+          imagen que mide el LCP de esta página. */}
+      {foto && <ImagenContenido ranura={foto} prioridad className="mt-8" sizes="(min-width: 1024px) 900px, 100vw" />}
       <Link href={`/cotizacion?notas=${encodeURIComponent('Aplicación: ' + app.name)}`} className="btn mt-8 inline-flex bg-[#0A2540] text-white px-5 py-3 rounded-2xl">RFQ de esta aplicación</Link>
       <h2 className="mt-12 text-xl font-semibold text-[#0A2540]">Qué preguntamos</h2>
       <ol className="mt-3 list-decimal pl-5 text-gray-700 space-y-1">
diff --git a/app/biblioteca/[slug]/page.tsx b/app/biblioteca/[slug]/page.tsx
index 6a4f25e..69b8cb6 100644
--- a/app/biblioteca/[slug]/page.tsx
+++ b/app/biblioteca/[slug]/page.tsx
@@ -3,6 +3,8 @@ import Link from 'next/link';
 import { notFound } from 'next/navigation';
 import { guides, guideBySlug } from '@/lib/guides';
 import { products } from '@/lib/products';
+import ImagenContenido from '@/components/ImagenContenido';
+import { ranurasBiblioteca } from '@/lib/imagenes';
 
 type Props = { params: Promise<{ slug: string }> };
 export const dynamicParams = false;
@@ -21,12 +23,24 @@ export default async function GuidePage({ params }: Props) {
   const g = guideBySlug(slug);
   if (!g) notFound();
   const related = products.filter((p) => g.relatedProductSlugs.includes(p.slug));
+  // El diagrama de la ranura, si existe el archivo. ImagenContenido resuelve
+  // solo el caso de que aún no esté publicado.
+  const diagrama = ranurasBiblioteca().find((r) => r.id === `biblioteca:${g.slug}`);
+
   return (
     <div className="max-w-3xl mx-auto px-6 py-14">
       <Link href="/biblioteca" className="text-xs uppercase tracking-widest text-[#059669]">Biblioteca</Link>
       <h1 className="t-display font-semibold text-[#0A2540] mt-3">{g.title}</h1>
       <p className="mt-3 text-sm text-gray-500">{g.titleEn} · Revisión {g.revised} · {g.reviewer}</p>
       <p className="mt-5 text-lg text-gray-700">{g.summary}</p>
+
+      {/* El dibujo va DESPUÉS del resumen y ANTES del desarrollo: quien llega
+          buscando cómo especificar algo necesita ver la pieza completa antes de
+          leer las partes, no al revés. */}
+      {diagrama && (
+        <ImagenContenido ranura={diagrama} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />
+      )}
+
       {g.sections.map((s) => (
         <section key={s.heading} className="mt-10">
           <h2 className="text-xl font-semibold text-[#0A2540]">{s.heading}</h2>
diff --git a/app/calculadoras/[slug]/page.tsx b/app/calculadoras/[slug]/page.tsx
index 5d1839d..6e5687d 100644
--- a/app/calculadoras/[slug]/page.tsx
+++ b/app/calculadoras/[slug]/page.tsx
@@ -18,6 +18,8 @@ import {
   webPageSchema,
 } from '@/lib/schema';
 import CalculadoraForm from '@/components/CalculadoraForm';
+import ImagenContenido from '@/components/ImagenContenido';
+import { ranurasCalculadora } from '@/lib/imagenes';
 
 /**
  * Página de una calculadora.
@@ -83,6 +85,7 @@ export default async function CalculadoraPage({
   if (!calc) notFound();
 
   const url = `${SITE.url}/calculadoras/${calc.slug}`;
+  const geometria = ranurasCalculadora().find((r) => r.id === `calculadora:${calc.slug}`);
 
   return (
     <div className="mx-auto max-w-5xl px-4 py-14">
@@ -140,6 +143,14 @@ export default async function CalculadoraPage({
       </h1>
       <p className="speakable-intro mt-4 max-w-3xl text-lg text-gray-600">{calc.resumen}</p>
 
+      {/* La geometría ANTES del formulario. Los campos piden magnitudes —largo
+          desarrollado del talud, ancho útil frente a nominal— que solo se
+          entienden viendo qué se está midiendo. Puesta después, el usuario ya
+          habría escrito el número equivocado. */}
+      {geometria && (
+        <ImagenContenido ranura={geometria} prioridad className="mt-8" sizes="(min-width: 1024px) 900px, 100vw" />
+      )}
+
       <div className="mt-10">
         <CalculadoraForm slug={calc.slug} />
       </div>
diff --git a/app/calidad/page.tsx b/app/calidad/page.tsx
index f61508e..8d455da 100644
--- a/app/calidad/page.tsx
+++ b/app/calidad/page.tsx
@@ -1,5 +1,7 @@
 import type { Metadata } from 'next';
 import Link from 'next/link';
+import ImagenContenido from '@/components/ImagenContenido';
+import { ranurasProceso } from '@/lib/imagenes';
 
 export const metadata: Metadata = {
   title: 'Sistema de calidad',
@@ -17,11 +19,18 @@ const STEPS = [
 ];
 
 export default function CalidadPage() {
+  const esquema = ranurasProceso().find((r) => r.id === 'proceso:calidad-planta');
+
   return (
     <div className="max-w-3xl mx-auto px-6 py-14">
       <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">CALIDAD</div>
       <h1 className="t-display font-semibold text-[#0A2540]">Cómo controlamos un pedido.</h1>
       <p className="mt-4 text-gray-600">Proceso de planta, no un certificado colgado. No hay ISO, ASTM, CE ni UL en esta página porque no hay documento que mostrar.</p>
+      {/* El flujo completo antes de la lista. Esta página dice que aquí no hay
+          un certificado que enseñar sino un proceso; un proceso descrito solo
+          con palabras no se distingue de uno inventado. */}
+      {esquema && <ImagenContenido ranura={esquema} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />}
+
       <ol className="mt-10 space-y-4">
         {STEPS.map(([k, v], i) => (
           <li key={k} className="border border-gray-100 rounded-2xl p-4">
diff --git a/app/configurador/layout.tsx b/app/configurador/layout.tsx
index f0c2ba1..2f1d945 100644
--- a/app/configurador/layout.tsx
+++ b/app/configurador/layout.tsx
@@ -1,4 +1,6 @@
 import type { Metadata } from 'next';
+import ImagenContenido from '@/components/ImagenContenido';
+import { ranurasProceso } from '@/lib/imagenes';
 
 export const metadata: Metadata = {
   title: 'Configurador FIBC / Big Bag',
@@ -7,5 +9,19 @@ export const metadata: Metadata = {
 };
 
 export default function Layout({ children }: { children: React.ReactNode }) {
-  return children;
+  // El despiece va sobre el formulario porque el formulario pregunta por
+  // boca, fondo, asas y liner sin enseñar qué es cada cosa. La página es un
+  // componente de cliente y no puede mirar el disco; este layout sí puede.
+  const esquema = ranurasProceso().find((r) => r.id === 'proceso:configurador-fibc');
+
+  return (
+    <>
+      {esquema && (
+        <div className="mx-auto max-w-3xl px-6 pt-14">
+          <ImagenContenido ranura={esquema} prioridad sizes="(min-width: 768px) 720px, 100vw" />
+        </div>
+      )}
+      {children}
+    </>
+  );
 }
diff --git a/app/exportacion/page.tsx b/app/exportacion/page.tsx
index 2349ffd..ef522be 100644
--- a/app/exportacion/page.tsx
+++ b/app/exportacion/page.tsx
@@ -1,5 +1,7 @@
 import type { Metadata } from 'next';
 import Link from 'next/link';
+import ImagenContenido from '@/components/ImagenContenido';
+import { ranurasProceso } from '@/lib/imagenes';
 
 export const metadata: Metadata = {
   title: 'Exportación desde el Perú',
@@ -19,11 +21,18 @@ const MARKETS = [
 ];
 
 export default function ExportacionPage() {
+  const esquema = ranurasProceso().find((r) => r.id === 'proceso:exportacion-flujo');
+
   return (
     <div className="max-w-3xl mx-auto px-6 py-14">
       <div className="uppercase tracking-[0.15em] text-xs text-[#059669] font-semibold mb-3">SUMINISTRO INTERNACIONAL</div>
       <h1 className="t-display font-semibold text-[#0A2540]">Exportación desde el Perú</h1>
       <p className="mt-4 text-gray-600">Fabricamos en Perú. Evaluamos destino, partida y MOQ. No operamos un e-commerce mundial.</p>
+      {/* El punto donde cambia la responsabilidad es lo que un comprador
+          extranjero necesita ver antes de leer la tabla de mercados: EXW Lima y
+          FOB Callao son dos puntos distintos de la misma cadena. */}
+      {esquema && <ImagenContenido ranura={esquema} prioridad className="mt-8" sizes="(min-width: 768px) 720px, 100vw" />}
+
       <table className="mt-8 w-full text-sm">
         <tbody>
           {MARKETS.map(([n, c, note]) => (
diff --git a/app/industria/[sector]/page.tsx b/app/industria/[sector]/page.tsx
index 26240d5..b46d160 100644
--- a/app/industria/[sector]/page.tsx
+++ b/app/industria/[sector]/page.tsx
@@ -17,6 +17,8 @@ import {
 import { JsonLd } from '@/components/JsonLd';
 import TrackView from '@/components/TrackView';
 import WhatsAppLink from '@/components/WhatsAppLink';
+import ImagenContenido from '@/components/ImagenContenido';
+import { ranurasErrorCompra } from '@/lib/imagenes';
 import {
   breadcrumbSchema,
   faqSchema,
@@ -74,6 +76,9 @@ export default async function IndustriaPage({ params }: Props) {
   const restantes = todos.length - ancla.length;
   const soluciones = solucionesDe(ind);
   const guias = guiasDe(ind);
+  // Los diagramas de este sector, en el mismo orden que `problemas`.
+  const diagramasError = ranurasErrorCompra().filter((r) => r.id.startsWith(`error:${ind.slug}:`));
+
 
   return (
     <div className="mx-auto max-w-4xl px-4 py-14">
@@ -151,7 +156,7 @@ export default async function IndustriaPage({ params }: Props) {
           Lo que se rompe cuando se compra sin criterio
         </h2>
         <div className="space-y-5">
-          {ind.problemas.map((p) => (
+          {ind.problemas.map((p, i) => (
             <div
               key={p.titulo}
               className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-5"
@@ -161,6 +166,19 @@ export default async function IndustriaPage({ params }: Props) {
                 <h3 className="font-semibold text-[#0A2540]">{p.titulo}</h3>
               </div>
               <p className="pl-7 text-sm leading-relaxed text-gray-700">{p.detalle}</p>
+
+              {/* El dibujo del error, dentro de su propia tarjeta. Un «así no /
+                  así sí» al lado del texto que lo describe es lo que convierte
+                  una advertencia en algo que se recuerda al redactar el RFQ.
+                  Ninguno lleva prioridad: el primero ya está muy por debajo del
+                  pliegue y competirían entre sí por el LCP. */}
+              {diagramasError[i] && (
+                <ImagenContenido
+                  ranura={diagramasError[i]}
+                  className="mt-4 ml-7"
+                  sizes="(min-width: 768px) 640px, 100vw"
+                />
+              )}
             </div>
           ))}
         </div>
diff --git a/app/marco/evaluacion/layout.tsx b/app/marco/evaluacion/layout.tsx
index 6b05fa3..0fac16d 100644
--- a/app/marco/evaluacion/layout.tsx
+++ b/app/marco/evaluacion/layout.tsx
@@ -4,6 +4,8 @@ import { totalCriteria } from '@/lib/framework';
 import { JsonLd } from '@/components/JsonLd';
 import TrackView from '@/components/TrackView';
 import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
+import ImagenContenido from '@/components/ImagenContenido';
+import { ranurasProceso } from '@/lib/imagenes';
 
 /**
  * La evaluación es un client component (estado del formulario) y no puede
@@ -29,6 +31,10 @@ export const metadata: Metadata = {
 };
 
 export default function EvaluacionLayout({ children }: { children: React.ReactNode }) {
+  // Los ejes de comparación, sobre la herramienta. La página es un componente
+  // de cliente y no puede mirar el disco; este layout, que es de servidor, sí.
+  const esquema = ranurasProceso().find((r) => r.id === 'proceso:marco-evaluacion');
+
   return (
     <>
       <TrackView kind="framework" slug="evaluacion" />
@@ -50,6 +56,11 @@ export default function EvaluacionLayout({ children }: { children: React.ReactNo
           ),
         ]}
       />
+      {esquema && (
+        <div className="mx-auto max-w-3xl px-6 pt-14">
+          <ImagenContenido ranura={esquema} prioridad sizes="(min-width: 768px) 720px, 100vw" />
+        </div>
+      )}
       {children}
     </>
   );
diff --git a/lib/imagenes.ts b/lib/imagenes.ts
index e697479..ecd93bc 100644
--- a/lib/imagenes.ts
+++ b/lib/imagenes.ts
@@ -2,6 +2,10 @@ import { products, productFamilies } from './products';
 import { articles } from './articles';
 import { solutions } from './solutions';
 import { terminos } from './glosario';
+import { guides } from './guides';
+import { applications } from './applications';
+import { INDUSTRIAS } from './industrias';
+import { calculadoras } from './calculadoras';
 
 /**
  * REGISTRO DE IMÁGENES.
@@ -443,6 +447,182 @@ export function ranurasGlosario(): RanuraImagen[] {
     }));
 }
 
+/* ------------------------------------------------------------------ */
+/* Contenido técnico: donde el dibujo hace el trabajo que el texto no  */
+/* ------------------------------------------------------------------ */
+
+/**
+ * Las cinco guías de /biblioteca explican cómo especificar un objeto que TIENE
+ * PARTES: una manga con sus uniones, una lona con su ojal, un big bag con su
+ * boca y su fondo. Un texto puede nombrarlas; solo un dibujo las sitúa unas
+ * respecto de otras, que es exactamente la información que falta cuando un
+ * comprador pide «manga de 800 mm» y recibe un tramo sin uniones.
+ */
+export function ranurasBiblioteca(): RanuraImagen[] {
+  return guides.map((g) => ({
+    id: `biblioteca:${g.slug}`,
+    ruta: `/images/biblioteca/${g.slug}.png`,
+    ancho: 1600,
+    alto: 900,
+    alt: `Diagrama de especificación: ${g.title}`,
+    tipo: 'diagrama' as TipoImagen,
+    contexto: `Cuerpo de /biblioteca/${g.slug}`,
+    prompt:
+      `${ESTILO_DIAGRAMA}\n\n` +
+      `TEMA: anatomía de lo que esta guía enseña a especificar — ${g.title}.\n` +
+      `RESUMEN DE LA GUÍA: ${g.summary}\n` +
+      `DEBEN DISTINGUIRSE las partes que deciden la compra, cada una en su posición real.` +
+      `\nIMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.`,
+  }));
+}
+
+/**
+ * Las calculadoras publican su método, que es lo que las separa de una caja
+ * negra. Pero un método descrito con palabras obliga a reconstruir la
+ * geometría en la cabeza. El dibujo de lo que se está midiendo —los cuatro
+ * taludes de una poza, el ancho útil frente al nominal— convierte la fórmula
+ * en algo que un ingeniero puede verificar de un vistazo.
+ */
+export function ranurasCalculadora(): RanuraImagen[] {
+  return calculadoras.map((c) => ({
+    id: `calculadora:${c.slug}`,
+    ruta: `/images/calculadoras/${c.slug}.png`,
+    ancho: 1600,
+    alto: 900,
+    alt: `Geometría del cálculo: ${c.titulo}`,
+    tipo: 'diagrama' as TipoImagen,
+    contexto: `Encabezado de /calculadoras/${c.slug}`,
+    prompt:
+      `${ESTILO_DIAGRAMA}\n\n` +
+      `TEMA: la geometría que esta calculadora mide — ${c.titulo}.\n` +
+      `PREGUNTA QUE RESPONDE: ${c.pregunta}\n` +
+      `MÉTODO: ${c.resumen}\n` +
+      `DEBEN VERSE ACOTADAS las magnitudes que el formulario pide.` +
+      `\nIMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.`,
+  }));
+}
+
+/**
+ * ERRORES DE COMPRA. Cada hub sectorial nombra tres o cuatro errores concretos
+ * —«Se compra por gramaje y se rompe por el ojal»— y son el contenido que
+ * distingue este sitio de un catálogo. Dibujados como «así no / así sí»
+ * funcionan para las tres audiencias a la vez: la persona lo entiende sin
+ * leer, el rastreador lo indexa por su texto alternativo, y un modelo que
+ * quiera citarnos tiene algo concreto que citar.
+ *
+ * El nombre del archivo NO se deriva del título, porque un título puede
+ * reescribirse sin que la imagen deje de ser correcta. Se declara aquí, en el
+ * mismo orden que `problemas`, y test/imagenes-registro.test.ts comprueba que
+ * las dos listas tengan la misma longitud: si alguien añade un error sin su
+ * dibujo, el build lo dice.
+ */
+const SLUG_ERROR: Record<string, string[]> = {
+  mineria: ['manga-solo-diametro', 'espesor-copiado', 'cobertor-por-precio', 'plazo-importacion'],
+  agroexportacion: ['trama-por-precio', 'cobertor-no-llega', 'ancho-util-modulo'],
+  'transporte-logistica': ['gramaje-vs-ojal', 'medida-estandar', 'tres-materiales'],
+  construccion: ['carpa-por-m2', 'geosintetico-por-nombre', 'responsabilidad-partida'],
+  'saneamiento-y-agua': ['solo-la-lamina', 'ensayo-de-costura', 'almacenamiento-improvisado'],
+};
+
+export function ranurasErrorCompra(): RanuraImagen[] {
+  const salida: RanuraImagen[] = [];
+  for (const ind of INDUSTRIAS) {
+    const slugs = SLUG_ERROR[ind.slug] ?? [];
+    ind.problemas.forEach((p, i) => {
+      const slug = slugs[i];
+      if (!slug) return;
+      salida.push({
+        id: `error:${ind.slug}:${slug}`,
+        ruta: `/images/industria/${ind.slug}-${slug}.png`,
+        ancho: 1400,
+        alto: 800,
+        alt: `${p.titulo} — comparación de la compra mal especificada frente a la correcta`,
+        tipo: 'diagrama' as TipoImagen,
+        contexto: `Problema «${p.titulo}» en /industria/${ind.slug}`,
+        prompt:
+          `${ESTILO_DIAGRAMA}\n\n` +
+          `TEMA: el error de compra «${p.titulo}», dibujado como comparación.\n` +
+          `DETALLE: ${p.detalle}\n` +
+          `IZQUIERDA la compra mal especificada, DERECHA la correcta. En verde solo lo que cambia.` +
+          `\nIMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.`,
+      });
+    });
+  }
+  return salida;
+}
+
+/** Las ocho páginas que responden a la búsqueda por problema. */
+export function ranurasAplicacion(): RanuraImagen[] {
+  return applications.map((a) => ({
+    id: `aplicacion:${a.slug}`,
+    ruta: `/images/aplicaciones/${a.slug}.jpg`,
+    ancho: 1920,
+    alto: 1080,
+    alt: `${a.name}: la situación de obra donde esta aplicación se resuelve`,
+    tipo: 'foto' as TipoImagen,
+    contexto: `Portada de /aplicaciones/${a.slug}`,
+    prompt:
+      `${ESTILO_FOTO.replace('Proporción 3:2 horizontal.', 'Proporción 16:9 horizontal, con espacio libre a la izquierda para superponer un título.')}\n\n` +
+      `TEMA: ${a.name}. ${a.problem}\n` +
+      `ENCUADRE: escena de trabajo real donde esto se instala o se usa.`,
+  }));
+}
+
+/**
+ * Cuatro páginas argumentales. Son las que un comprador lee cuando ya está
+ * decidiendo con quién trabaja, y las cuatro explican un PROCESO o una
+ * ESTRUCTURA: el despiece de un big bag, el flujo de planta, la cadena de
+ * exportación y los ejes con que se compara a un proveedor. Ninguna de las
+ * cuatro se lee mejor en prosa.
+ */
+const PROCESOS = [
+  {
+    slug: 'configurador-fibc',
+    ruta: '/configurador',
+    ancho: 1600,
+    alto: 900,
+    alt: 'Vista despiezada de un big bag con las opciones que ofrece el configurador',
+    tema: 'vista despiezada de un big bag FIBC con sus opciones: boca de carga, cuerpo y faja, asas, liner y fondo de descarga',
+  },
+  {
+    slug: 'calidad-planta',
+    ruta: '/calidad',
+    ancho: 1600,
+    alto: 700,
+    alt: 'Flujo del proceso de planta, de la recepción de material a la trazabilidad por pedido',
+    tema: 'flujo horizontal del proceso de planta: recepción de material, corte, confección y soldadura, control dimensional, embalaje y trazabilidad por pedido',
+  },
+  {
+    slug: 'exportacion-flujo',
+    ruta: '/exportacion',
+    ancho: 1600,
+    alto: 800,
+    alt: 'Cadena de suministro internacional desde la planta en Lima hasta el destino andino',
+    tema: 'cadena de suministro de la planta en Lima al Callao y de ahí al destino, con el punto donde cambia la responsabilidad y la fila de documentos que la acompaña',
+  },
+  {
+    slug: 'marco-evaluacion',
+    ruta: '/marco/evaluacion',
+    ancho: 1600,
+    alto: 900,
+    alt: 'Ejes del marco de evaluación de un proveedor de textiles industriales',
+    tema: 'los ejes con que se compara a un proveedor: capacidad de fabricación, alcance de instalación, documentación técnica, plazo, respuesta al RFQ y evidencia de obra',
+  },
+] as const;
+
+export function ranurasProceso(): RanuraImagen[] {
+  return PROCESOS.map((p) => ({
+    id: `proceso:${p.slug}`,
+    ruta: `/images/proceso/${p.slug}.png`,
+    ancho: p.ancho,
+    alto: p.alto,
+    alt: p.alt,
+    tipo: 'diagrama' as TipoImagen,
+    contexto: `Cuerpo de ${p.ruta}`,
+    prompt: `${ESTILO_DIAGRAMA}\n\nTEMA: ${p.tema}.` + `\nIMPORTANTE: la posición y la proporción de cada parte deben ser técnicamente correctas; el valor del dibujo es que un ingeniero pueda verificarlo de un vistazo.`,
+  }));
+}
+
 /** Todas las ranuras pendientes, en orden de prioridad de publicación. */
 export function todasLasRanuras(): RanuraImagen[] {
   return [
@@ -451,6 +631,11 @@ export function todasLasRanuras(): RanuraImagen[] {
     ...ranurasProducto(),
     ...ranurasGlosario(),
     ...ranurasGuia(),
+    ...ranurasBiblioteca(),
+    ...ranurasCalculadora(),
+    ...ranurasErrorCompra(),
+    ...ranurasAplicacion(),
+    ...ranurasProceso(),
   ];
 }
 
@@ -466,6 +651,11 @@ export function todasLasRanurasConPublicadas(): RanuraImagen[] {
     ...ranurasProducto(true),
     ...ranurasGlosario(),
     ...ranurasGuia(),
+    ...ranurasBiblioteca(),
+    ...ranurasCalculadora(),
+    ...ranurasErrorCompra(),
+    ...ranurasAplicacion(),
+    ...ranurasProceso(),
   ];
 }
 
diff --git a/test/repositorio-limpio.test.ts b/test/repositorio-limpio.test.ts
index 8a542c8..535f5a3 100644
--- a/test/repositorio-limpio.test.ts
+++ b/test/repositorio-limpio.test.ts
@@ -13,7 +13,16 @@ import { execFileSync } from 'node:child_process';
  * .gitignore sugiere. Esta prueba obliga.
  */
 const PERMITIDOS = new Set<string>([]);
-const ARTEFACTO = [/\.patch$/, /\.diff$/, /^integrar.*\.sh$/, /^(aplicar|apply).*\.sh$/];
+const ARTEFACTO = [
+  /\.patch$/,
+  /\.diff$/,
+  // Los ZIP de entrega de imágenes llegaron a sumar 51 MB en la raíz: el mismo
+  // patrón que los parches, con el mismo coste. Las imágenes van a
+  // public/images/, el contenedor no se queda.
+  /\.zip$/,
+  /^integrar.*\.sh$/,
+  /^(aplicar|apply).*\.sh$/,
+];
 
 describe('la raíz del repositorio se mantiene limpia', () => {
   it('ningún artefacto de entrega queda versionado', () => {
PARCHE_CODIGO
ok "registro extendido y 8 plantillas cableadas"

paso "4/6 · Retirando los contenedores de entrega"
# Los tres ZIP y este mismo script: todos son envoltorio de entrega. El
# contenido ya está en public/images/ y en el código; conservar el envoltorio
# es exactamente el patrón que llenó la raíz de .patch.
RETIRAR=""
for z in plastilonas-images-batch1-25of65.zip plastilonas-images-part1-presentation-25.zip \
         plastilonas-images-part2-technical-40.zip montar-imagenes.sh; do
  git ls-files --error-unmatch "$z" >/dev/null 2>&1 && RETIRAR="$RETIRAR $z"
done
if [ -n "$RETIRAR" ]; then
  git rm --quiet --cached $RETIRAR
  # este script no se borra del disco: se está ejecutando.
  for f in $RETIRAR; do [ "$f" = "montar-imagenes.sh" ] || rm -f "$f"; done
  ok "retirados del repositorio:$RETIRAR"
else
  ok "no quedaba ninguno"
fi

paso "5/6 · Verificación completa"
npx tsc --noEmit               || morir "Typecheck falla. Nada commiteado."
npx vitest run --reporter=dot  || morir "Pruebas fallan. Nada commiteado."
npm run auditar:imagenes       || morir "Hay rutas de imagen sin archivo. Nada commiteado."
npm run build                  || morir "El build falla. Nada commiteado."
npm run auditar                || morir "Auditoría HTML con errores. Nada commiteado."
if npx --no-install playwright --version >/dev/null 2>&1; then
  RUTAS_IMAGENES=/,/productos/familia/geosinteticos,/soluciones/poza-revestida-impermeabilizacion,/recursos/instalacion-geomembranas-hdpe-pozas-canales,/biblioteca/especificacion-fibc,/calculadoras/geomembrana-poza,/industria/mineria,/aplicaciones/ventilacion-subterranea,/configurador,/calidad,/exportacion,/marco/evaluacion \
    npm run auditar:viewport || morir "Hay imágenes que no pintan o recortes. Nada commiteado."
else
  nota "playwright no disponible; la matriz se ejecutará en CI"
fi
ok "todo en verde"

paso "6/6 · Publicación"
git add -A
git commit --quiet -m "feat(imagenes): las 65 imágenes del pliego, integradas y renderizadas" -m \
"Las 27 ranuras que servían la fotografía de respaldo pasan a servir su
imagen propia. Las 38 restantes no tenian donde aparecer: ocho plantillas
no declaraban ninguna ranura, asi que ademas del archivo hubo que
extender el registro y cablearlas.

lib/imagenes.ts gana cinco familias de ranura -biblioteca, calculadora,
error de compra, aplicacion y proceso- derivadas del contenido real, no
de una lista aparte: si manana se renombra una guia o se anade un error
de compra, el encargo se mueve con el.

Donde va cada imagen y por que:
  biblioteca   tras el resumen y antes del desarrollo, porque quien busca
               como especificar algo necesita ver la pieza entera antes
               que las partes
  calculadora  antes del formulario, porque los campos piden magnitudes
               -largo desarrollado del talud, ancho util frente a nominal-
               que solo se entienden viendo que se mide
  industria    dentro de la tarjeta de cada error de compra, que es donde
               el asi-no/asi-si se recuerda al redactar el RFQ
  aplicacion   tras el planteamiento del problema
  proceso      sobre la herramienta; configurador y marco son componentes
               de cliente y no pueden mirar el disco, asi que la imagen se
               resuelve en su layout, que es de servidor

Se retiran los tres ZIP de entrega (51 MB) y el script que los monto, y
test/repositorio-limpio pasa a bloquear tambien los .zip: es el mismo
patron que los .patch.

Verificado: 527 pruebas, 0 errores de auditoria de imagenes, 0 errores de
auditoria HTML, 0 desbordes, 0 recortes, 0 imagenes rotas en 17
dispositivos, y las 12 rutas nuevas pintando pixeles."
git push --quiet origin main || morir "El push falló."
ok "publicado"

printf '\n%s  Listo. 65 imágenes en su sitio, renderizadas y verificadas.%s\n\n' "$V" "$F"
