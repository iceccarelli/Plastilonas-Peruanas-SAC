'use client';

import { SOCIAL_LINKS } from '@/lib/social';

interface Props {
  /** Estilo de color: 'dark' para fondos oscuros (footer), 'light' para claros. */
  variant?: 'dark' | 'light';
  className?: string;
}

export default function SocialIcons({ variant = 'dark', className = '' }: Props) {
  const base =
    variant === 'dark'
      ? 'text-white/50 hover:text-white hover:bg-white/10 border-white/10'
      : 'text-gray-400 hover:text-[#0A2540] hover:bg-gray-100 border-gray-200';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map(({ name, href, Icon, ready }) => {
        const shared = `w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${base}`;

        // Marcador de posición: presente y visible, pero no navegable hasta
        // que se integre la URL real. No rompe el layout.
                // Solo mostramos redes con URL real configurada en lib/social.ts.
        if (!ready) return null;

        return (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={shared}
            title={name}
            aria-label={name}
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
}
