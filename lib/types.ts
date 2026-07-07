export interface Product {
  id: string;
  slug: string;
  name: string;
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
