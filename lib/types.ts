// lib/types.ts
// -----------------------------------------------------------------------------
// Modelo de datos del catálogo. Se amplía con un sistema de "estado de oferta"
// que permite listar TODO el portafolio (estilo AWS: catálogo completo visible)
// manteniendo honestidad comercial: cada producto declara CÓMO lo entregamos
// (`sourcing`) y en QUÉ estado de disponibilidad está (`availability`).
// Esto convierte la transparencia en un activo de venta ante compradores
// técnicos (minería, construcción, agroexportación), que exigen fichas y
// certificados antes de comprar.
// -----------------------------------------------------------------------------

/** Cómo abastecemos realmente el producto. Alimenta el badge de origen. */
export type Sourcing =
  | 'fabricacion_propia'   // Lo fabricamos/confeccionamos nosotros.
  | 'importacion_directa'  // Importación directa premium bajo nuestra marca/control.
  | 'bajo_pedido'          // Se produce/adquiere contra pedido, con lead time.
  | 'partner';             // Provisto mediante aliado técnico especializado.

/**
 * Estado de disponibilidad, análogo a los estados "GA / Preview / Contact us"
 * de un catálogo empresarial:
 *  - 'stock'      → SKU estandarizado, entrega rápida.
 *  - 'a_medida'   → se fabrica según especificación del cliente.
 *  - 'bajo_pedido'→ línea disponible bajo pedido; ficha técnica y certificado
 *                    de lote del fabricante se entregan en la cotización.
 */
export type Availability = 'stock' | 'a_medida' | 'bajo_pedido';

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Familia de nivel superior (define navegación y filtros, estilo AWS). */
  category: string;
  sector: string[];
  shortDescription: string;
  description: string;
  specifications: Array<{
    label: string;
    value: string;
  }>;
  applications: string[];
  benefits: string[];
  image: string;
  gallery: string[];
  featured: boolean;
  popular: boolean;

  // --- Estado de oferta (nuevo) --------------------------------------------
  /** Cómo lo entregamos. Si se omite, la UI no muestra badge de origen. */
  sourcing?: Sourcing;
  /** Estado de disponibilidad. Si se omite, se asume 'a_medida'. */
  availability?: Availability;
  /** Plazo de entrega referencial mostrado en ficha (opcional). */
  leadTime?: string;
  /** Nota de sostenibilidad/materiales (opcional). */
  sustainability?: string;
  /**
   * Certificaciones o documentación que PODEMOS entregar. Regla de honestidad:
   * incluir aquí solo lo que se puede respaldar con un documento real
   * (ficha técnica, certificado de lote del fabricante, ensayo). Para líneas
   * `bajo_pedido` usar el texto: "Ficha técnica y certificado de lote a
   * solicitud, en cotización." — nunca afirmar certificados no verificables.
   */
  documentation?: string;

  /**
   * Precio de lista en PEN. OPCIONAL a propósito: la mayoría de productos
   * industriales son a medida y siguen siendo "cotizar". Solo los SKUs
   * estandarizados llevan precio y se vuelven comprables.
   */
  price?: number;
  /** Unidad de venta mostrada junto al precio: 'unidad' | 'm²' | 'rollo'... */
  priceUnit?: string;
  /** Si es true, se puede añadir al carrito y comprar. Requiere `price`. */
  purchasable?: boolean;
}

/** Metadatos de presentación por familia (para mega menú y páginas índice). */
export interface ProductFamily {
  /** Debe coincidir con `Product.category`. */
  name: string;
  /** Slug para futuras páginas /productos/familia/[slug] (opcional). */
  slug: string;
  /** Descripción corta de una línea para el mega menú. */
  tagline: string;
}

export interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  sector: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
  benefits: string[];
}
