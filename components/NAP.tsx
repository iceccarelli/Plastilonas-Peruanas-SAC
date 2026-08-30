import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { SITE, HORARIO, TELEFONOS } from '@/lib/site';
import WhatsAppLink from './WhatsAppLink';

/**
 * NAP (Name · Address · Phone) — UN componente para todo el sitio.
 *
 * El SEO local vive o muere por la consistencia del NAP: el mismo nombre, la
 * misma dirección carácter a carácter y los mismos teléfonos en cada página,
 * en el JSON-LD y (cuando exista) en el Google Business Profile. Este
 * componente es la única forma autorizada de pintar la sede.
 *
 * El mapa es una URL DE BÚSQUEDA (razón social + dirección): sin coordenadas
 * inventadas. El día que exista el Business Profile verificado, su URL exacta
 * reemplaza a esta búsqueda — TODO(HUMAN), ver docs/HUMAN-GATES.md.
 */

export const DIRECCION_COMPLETA = `${SITE.addressStreet}, ${SITE.addressLocality}, ${SITE.addressRegion}, Perú`;

/** URL de mapa por consulta (sin coordenadas): funciona sin GBP y sin API key. */
export const MAPA_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SITE.legalName}, ${DIRECCION_COMPLETA}`,
)}`;

export default function NAP({ compacto = false }: { compacto?: boolean }) {
  return (
    <address className="not-italic text-sm space-y-3">
      <div className="font-semibold text-[#0A2540] dark:text-inherit">{SITE.legalName}</div>
      <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#059669]" />
        <span>
          {DIRECCION_COMPLETA}
          {' · '}
          <a
            href={MAPA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#047857] hover:underline"
          >
            Ver en el mapa
          </a>
        </span>
      </div>
      <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
        <Phone className="w-4 h-4 mt-0.5 shrink-0 text-[#059669]" />
        <span>
          <a href={TELEFONOS.central.tel} className="hover:underline">{TELEFONOS.central.display}</a>
          {' (central) · '}
          <WhatsAppLink context="nap" message="Hola, quisiera información sobre sus productos." className="text-[#047857] hover:underline">
            {TELEFONOS.whatsapp.display} (WhatsApp)
          </WhatsAppLink>
        </span>
      </div>
      {!compacto && (
        <>
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[#059669]" />
            <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
          </div>
          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mt-0.5 shrink-0 text-[#059669]" />
            <span>{HORARIO.corto}</span>
          </div>
        </>
      )}
    </address>
  );
}
