import {
  Package,
  Droplets,
  Tent,
  Wind,
  Sprout,
  Truck,
  Thermometer,
  TreePine,
  Scissors,
  Flame,
  Wheat,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { Product } from '@/lib/types';

/**
 * Visual de producto con identidad de marca.
 *
 * Contexto: el repositorio no incluye fotografías (no existe /public/images),
 * por lo que hasta ahora el catálogo mostraba un emoji tenue al 5-10 % de
 * opacidad — el mayor asesino de conversión en un sitio de producto físico.
 *
 * Este componente renderiza una "placa" de categoría deliberada y consistente
 * (gradiente navy + textura de puntos del hero + ícono industrial + etiqueta)
 * en SVG/CSS puro: cero peso de red, seguro en conexiones lentas del Perú, y
 * evidentemente un diseño intencional, NO una foto falsa.
 *
 * Cuando lleguen fotos reales, basta reemplazar este componente por
 * <Image src={product.image} .../> — el campo `product.image` ya existe.
 */

interface CategoryVisual {
  icon: LucideIcon;
  /** Tinte de acento para diferenciar categorías de un vistazo (escaneo tipo grid). */
  accent: string;
}

const FALLBACK: CategoryVisual = { icon: Layers, accent: '#059669' };

const MAP: Array<{ match: (c: string) => boolean; visual: CategoryVisual }> = [
  { match: (c) => c.includes('Big'), visual: { icon: Package, accent: '#F59E0B' } },
  { match: (c) => c.includes('Biombo'), visual: { icon: Flame, accent: '#EF4444' } },
  { match: (c) => c.includes('Carpa'), visual: { icon: Tent, accent: '#0EA5E9' } },
  { match: (c) => c.includes('Geomembrana'), visual: { icon: Droplets, accent: '#06B6D4' } },
  { match: (c) => c.includes('Manga'), visual: { icon: Wind, accent: '#14B8A6' } },
  { match: (c) => c.includes('Malla'), visual: { icon: Sprout, accent: '#22C55E' } },
  { match: (c) => c.includes('Transporte'), visual: { icon: Truck, accent: '#F59E0B' } },
  { match: (c) => c.includes('Granja'), visual: { icon: Wheat, accent: '#EAB308' } },
  { match: (c) => c.includes('Aislante'), visual: { icon: Thermometer, accent: '#8B5CF6' } },
  { match: (c) => c.includes('Mulch'), visual: { icon: TreePine, accent: '#16A34A' } },
  { match: (c) => c.includes('Lona') || c.includes('Medida'), visual: { icon: Scissors, accent: '#059669' } },
];

function resolve(category: string): CategoryVisual {
  return MAP.find((m) => m.match(category))?.visual ?? FALLBACK;
}

interface ProductVisualProps {
  product: Product;
  /** 'card' para grillas, 'hero' para la página de detalle. */
  variant?: 'card' | 'hero';
  className?: string;
}

export default function ProductVisual({
  product,
  variant = 'card',
  className = '',
}: ProductVisualProps) {
  const { icon: Icon, accent } = resolve(product.category);
  const iconSize = variant === 'hero' ? 128 : 76;

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#0A2540] ${className}`}
      role="img"
      aria-label={`${product.name} — ${product.category}`}
    >
      {/* Textura de puntos, consistente con el hero */}
      <div className="absolute inset-0 bg-[radial-gradient(#1A3A5C_0.8px,transparent_1px)] bg-[length:6px_6px] opacity-50" />
      {/* Resplandor de acento por categoría */}
      <div
        className="absolute -inset-8 opacity-30 blur-2xl"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accent}, transparent 62%)`,
        }}
      />
      {/* Ícono industrial */}
      <Icon
        width={iconSize}
        height={iconSize}
        strokeWidth={1.25}
        className="relative z-10 text-white/90 drop-shadow"
        style={{ color: accent }}
        aria-hidden="true"
      />
      {variant === 'hero' && (
        <div className="relative z-10 mt-5 max-w-[80%] text-center">
          <div className="text-[11px] font-semibold tracking-[3px] text-white/50 uppercase">
            {product.category}
          </div>
          <div className="mt-1 text-lg font-semibold tracking-tight text-white/90">
            {product.name}
          </div>
        </div>
      )}
      {variant === 'card' && (
        <div className="relative z-10 mt-4 px-4 text-center text-[11px] font-semibold uppercase tracking-[2px] text-white/45">
          {product.category}
        </div>
      )}
    </div>
  );
}
