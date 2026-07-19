import {
  Package,
  Droplets,
  Tent,
  Wind,
  Sprout,
  Recycle,
  Wrench,
  Megaphone,
  TreePine,
  Scissors,
  Flame,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { Product } from '@/lib/types';

interface CategoryVisual {
  icon: LucideIcon;
  accent: string;
}

const FALLBACK: CategoryVisual = { icon: Layers, accent: '#059669' };

const MAP: Array<{ match: (c: string) => boolean; visual: CategoryVisual }> = [
  { match: (c) => c.includes('Envases'),        visual: { icon: Package,   accent: '#F59E0B' } },
  { match: (c) => c.includes('Lonas'),          visual: { icon: Scissors,  accent: '#059669' } },
  { match: (c) => c.includes('Estructuras'),    visual: { icon: Tent,      accent: '#0EA5E9' } },
  { match: (c) => c.includes('Mallas'),         visual: { icon: Sprout,    accent: '#22C55E' } },
  { match: (c) => c.includes('Ventilación'),    visual: { icon: Wind,      accent: '#14B8A6' } },
  { match: (c) => c.includes('Geosintéticos'),  visual: { icon: Droplets,  accent: '#06B6D4' } },
  { match: (c) => c.includes('Ambientales'),    visual: { icon: Recycle,   accent: '#10B981' } },
  { match: (c) => c.includes('Seguridad'),      visual: { icon: Flame,     accent: '#EF4444' } },
  { match: (c) => c.includes('Accesorios'),     visual: { icon: Wrench,    accent: '#64748B' } },
  { match: (c) => c.includes('Publicidad'),     visual: { icon: Megaphone, accent: '#EC4899' } },
  { match: (c) => c.includes('Especialidades'), visual: { icon: TreePine,  accent: '#16A34A' } },
];

function resolve(category: string): CategoryVisual {
  return MAP.find((m) => m.match(category))?.visual ?? FALLBACK;
}

interface ProductVisualProps {
  product: Product;
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
      <div className="absolute inset-0 bg-[radial-gradient(#1A3A5C_0.8px,transparent_1px)] bg-[length:6px_6px] opacity-50" />
      <div
        className="absolute -inset-8 opacity-30 blur-2xl"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accent}, transparent 62%)`,
        }}
      />
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
          <div className="t-micro font-semibold tracking-[3px] text-white/50 uppercase">
            {product.category}
          </div>
          <div className="mt-1 text-lg font-semibold tracking-tight text-white/90">
            {product.name}
          </div>
        </div>
      )}
      {variant === 'card' && (
        <div className="relative z-10 mt-4 px-4 text-center t-micro font-semibold uppercase tracking-[2px] text-white/45">
          {product.category}
        </div>
      )}
    </div>
  );
}
