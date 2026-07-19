import fs from 'fs';

// 1) SocialIcons.tsx — limpio + tracking de clic
fs.writeFileSync('components/SocialIcons.tsx', `'use client';

import { SOCIAL_LINKS } from '@/lib/social';
import { trackSocialClick } from '@/lib/analytics';

interface Props {
  variant?: 'dark' | 'light';
  className?: string;
}

export default function SocialIcons({ variant = 'dark', className = '' }: Props) {
  const base =
    variant === 'dark'
      ? 'text-white/50 hover:text-white hover:bg-white/10 border-white/10'
      : 'text-gray-400 hover:text-[#0A2540] hover:bg-gray-100 border-gray-200';

  return (
    <div className={\`flex flex-wrap items-center gap-2 \${className}\`}>
      {SOCIAL_LINKS.map(({ name, href, Icon }) => (
        
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-social={name.toLowerCase()}
          onClick={() => trackSocialClick(name)}
          className={\`w-9 h-9 rounded-xl border flex items-center justify-center transition-all \${base}\`}
          title={name}
          aria-label={name}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
`);
console.log('  escrito components/SocialIcons.tsx');

// 2) CotizacionModal.tsx — evento quote_request (Lead)
let C = fs.readFileSync('components/CotizacionModal.tsx', 'utf8');
if (!C.includes('trackQuoteRequest')) {
  C = C.replace(
    "import { buildQuoteMessage, openWhatsApp, saveQuoteLocally } from '@/lib/whatsapp';",
    "import { buildQuoteMessage, openWhatsApp, saveQuoteLocally } from '@/lib/whatsapp';\nimport { trackQuoteRequest } from '@/lib/analytics';"
  );
  C = C.replace('    openWhatsApp(message);\n', '    openWhatsApp(message);\n    trackQuoteRequest(data.producto);\n');
  fs.writeFileSync('components/CotizacionModal.tsx', C);
  console.log('  parcheado components/CotizacionModal.tsx');
} else console.log('  CotizacionModal ya conectado — omitido');

// 3) lib/analytics.ts — logger de depuracion
let A = fs.readFileSync('lib/analytics.ts', 'utf8');
if (!A.includes('NEXT_PUBLIC_ANALYTICS_DEBUG')) {
  A = A.replace(
    'type EventParams = Record<string, string | number | boolean | undefined>;',
    "type EventParams = Record<string, string | number | boolean | undefined>;\n\nconst DEBUG =\n  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true' ||\n  process.env.NODE_ENV === 'development';"
  );
  A = A.replace(
    "  if (typeof window === 'undefined') return;\n  window.gtag?.('event', name, params);",
    "  if (typeof window === 'undefined') return;\n  if (DEBUG) console.debug('[analytics]', name, params);\n  window.gtag?.('event', name, params);"
  );
  fs.writeFileSync('lib/analytics.ts', A);
  console.log('  parcheado lib/analytics.ts (debug logger)');
} else console.log('  analytics.ts ya tenía debug — omitido');

// 4) .env.example — variable de debug
let E = fs.readFileSync('.env.example', 'utf8');
if (!E.includes('NEXT_PUBLIC_ANALYTICS_DEBUG')) {
  E += "# 'true' = registra cada evento en consola (util para verificar sin IDs).\nNEXT_PUBLIC_ANALYTICS_DEBUG=false\n";
  fs.writeFileSync('.env.example', E);
  console.log('  .env.example actualizado');
} else console.log('  .env.example ya tenía debug — omitido');

console.log('LISTO: conversiones + logger añadidos');
