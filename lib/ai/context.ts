/**
 * CONTEXTO DE PÁGINA PARA EL ASISTENTE — Fase 1.
 *
 * Hoy el endpoint de chat (`app/api/chat/route.ts`) solo recibe `currentPage`
 * como una ruta suelta (`string`) y la pega en una frase del prompt. Esto
 * tipa esa idea para que las tools y el prompt puedan razonar sobre en qué
 * página está el visitante sin volver a adivinar la ruta con regex.
 *
 * DELIBERADAMENTE SIMPLE: es un constructor puro sobre datos ya conocidos
 * (ruta, slug, idioma), no un resolutor de rutas de Next. La página que
 * invoca al asistente (el widget flotante hoy; una página `/asistente` en
 * una fase futura) es quien conoce su propio `pageType` y se lo pasa aquí.
 */

import { products } from '@/lib/products';
import type { Availability, Sourcing } from '@/lib/types';

/**
 * Tipos de página reconocidos. Se corresponden 1:1 con secciones reales del
 * sitio (ver la matriz de rutas en docs/entregas/2026-09-21-plastilonas-ai-audit.md,
 * punto 8) — nunca se agrega un valor aquí sin que exista la ruta.
 */
export type PageType =
  | 'home'
  | 'product'
  | 'catalog'
  | 'family'
  | 'application'
  | 'industry'
  | 'solution'
  | 'guide'
  | 'glossary'
  | 'calculator'
  | 'quote'
  | 'article'
  | 'report'
  | 'news'
  | 'project'
  | 'other';

export type ChatLanguage = 'es' | 'en' | 'pt';

/** Recorte honesto del producto: solo campos que ya existen en el catálogo. */
export interface ProductSnapshot {
  slug: string;
  name: string;
  category: string;
  sector: string[];
  sourcing?: Sourcing;
  availability?: Availability;
  url: string;
}

export interface PageContext {
  pageType: PageType;
  /** Slug del producto si `pageType === 'product'` (o el usuario lo mencionó). */
  productSlug?: string;
  /** Recorte del producto real, resuelto contra lib/products.ts. Nunca inventado. */
  product?: ProductSnapshot;
  /** Slug de la calculadora si `pageType === 'calculator'`. */
  calculatorId?: string;
  language: ChatLanguage;
  /**
   * Identificador de sesión efímero/anónimo (no de Auth.js): agrupa los
   * turnos de una conversación en el cliente para telemetría o para una
   * futura tool de "recordar cotización a medio hacer" (Fase 2/3, no
   * implementada aquí — ver gaps del audit, punto 2).
   */
  projectId: string;
}

/** Resuelve un slug de producto contra el catálogo real. Nunca fabrica datos. */
export function findProductSnapshot(slug: string | undefined): ProductSnapshot | undefined {
  if (!slug) return undefined;
  const p = products.find((item) => item.slug === slug);
  if (!p) return undefined;
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    sector: p.sector,
    sourcing: p.sourcing,
    availability: p.availability,
    url: `/productos/${p.slug}`,
  };
}

const LANGUAGES: ChatLanguage[] = ['es', 'en', 'pt'];

function normalizeLanguage(input: unknown): ChatLanguage {
  return typeof input === 'string' && (LANGUAGES as string[]).includes(input)
    ? (input as ChatLanguage)
    : 'es';
}

/** Genera un id de sesión anónimo corto, sin dependencias externas. */
function anonymousId(): string {
  return `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Infiera un `pageType` razonable a partir de una ruta del sitio (español).
 * Es un heurístico de respaldo para cuando quien llama solo tiene el
 * `pathname` (p.ej. el widget flotante hoy envía `currentPage`); una página
 * dedicada de Fase 2 debería pasar `pageType` explícito en vez de depender
 * de esto.
 */
export function inferPageType(pathname: string | undefined | null): PageType {
  if (!pathname) return 'other';
  const path = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/en' || path === '/pt') return 'home';
  if (path.startsWith('/productos/familia')) return 'family';
  if (path.startsWith('/productos')) return path === '/productos' ? 'catalog' : 'product';
  if (path.startsWith('/calculadoras')) return 'calculator';
  if (path.startsWith('/aplicaciones')) return 'application';
  if (path.startsWith('/industria')) return 'industry';
  if (path.startsWith('/soluciones')) return 'solution';
  if (path.startsWith('/recursos') || path.startsWith('/biblioteca')) return 'guide';
  if (path.startsWith('/glosario')) return 'glossary';
  if (path.startsWith('/cotizacion') || path.startsWith('/en/rfq')) return 'quote';
  if (path.startsWith('/informes')) return 'report';
  if (path.startsWith('/novedades')) return 'news';
  if (path.startsWith('/proyectos')) return 'project';
  return 'other';
}

export interface BuildPageContextInput {
  /** Ruta actual, tal como hoy la envía el widget (`currentPage`). */
  pathname?: string;
  /** Tipo de página explícito; gana sobre el heurístico de `pathname`. */
  pageType?: PageType;
  productSlug?: string;
  calculatorId?: string;
  language?: string;
  /** Id de sesión ya existente en el cliente; si falta, se genera uno. */
  projectId?: string;
}

/**
 * Constructor puro de `PageContext`. Toma lo que la superficie que llama ya
 * conoce (ruta, slug, idioma) y no intenta adivinar nada que no venga de
 * `lib/products.ts` o del propio input.
 */
export function buildPageContext(input: BuildPageContextInput): PageContext {
  const pageType = input.pageType ?? inferPageType(input.pathname);
  const slug =
    input.productSlug ??
    (pageType === 'product' && input.pathname
      ? input.pathname.split('?')[0].replace(/\/+$/, '').split('/').filter(Boolean).pop()
      : undefined);

  return {
    pageType,
    productSlug: slug,
    product: findProductSnapshot(slug),
    calculatorId: input.calculatorId,
    language: normalizeLanguage(input.language),
    projectId: input.projectId ?? anonymousId(),
  };
}
