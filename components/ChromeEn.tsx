import Link from 'next/link';
import Image from 'next/image';
import { SITE, HORARIO, TELEFONOS } from '@/lib/site';
import { MAPA_URL, DIRECCION_COMPLETA } from '@/components/NAP';
import WhatsAppLink from '@/components/WhatsAppLink';

/**
 * CABECERA Y PIE DEL GRUPO (en).
 *
 * POR QUÉ EXISTE. El grupo inglés reutilizaba `Navbar` y `Footer`, que están
 * en español: un comprador de fuera del Perú llegaba a una página en inglés
 * envuelta en «Productos · Industrias · Servicios · Recursos» y un pie con
 * catorce enlaces en español. Para la audiencia que estas páginas existen
 * para captar, ese marco no es un detalle estético — es la señal de que el
 * inglés fue un añadido y no un canal atendido.
 *
 * LO QUE NO HACE, y es deliberado: NO traduce el sitio. El catálogo, las
 * fichas y el silo técnico siguen en español porque ahí está el trabajo real
 * y traducirlos a medias sería peor. Este marco enlaza SOLO lo que existe de
 * verdad en inglés, y dice en una línea que el catálogo está en español para
 * que nadie se sienta engañado al hacer clic.
 *
 * El conmutador de idioma es un enlace de vuelta al sitio en español, no una
 * bandera decorativa: /en no tiene equivalentes uno a uno.
 */

const ENLACES_EN = [
  { href: '/en', label: 'Overview' },
  { href: '/en/sourcing-from-peru', label: 'Sourcing from Peru' },
  { href: '/en/rfq', label: 'Request a quote' },
];

export function HeaderEn() {
  return (
    <header className="border-b border-gray-200 dark:border-[var(--border)] bg-white/95 dark:bg-[#1C2C46]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
        <Link href="/en" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt={SITE.legalName}
            width={32}
            height={32}
            className="rounded-xl ring-1 ring-black/5"
          />
          <span className="font-semibold tracking-tight text-[#0A2540] dark:text-[var(--text)]">
            {SITE.legalName}
          </span>
        </Link>

        <nav aria-label="English pages" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {ENLACES_EN.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-[#0A2540] dark:text-[var(--text)] hover:text-[#059669] transition-colors"
            >
              {e.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="ml-auto rounded-full border border-gray-200 dark:border-[var(--border)] px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:border-[#059669] hover:text-[#047857] transition-colors"
        >
          Sitio en español →
        </Link>
      </div>
    </header>
  );
}

export function FooterEn() {
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-[var(--border)] bg-gray-50 dark:bg-white/5">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <div className="font-semibold text-[#0A2540] dark:text-inherit mb-2">{SITE.legalName}</div>
            {/* NAP idéntico al del sitio en español: mismo nombre, misma
                dirección carácter a carácter, mismos teléfonos. Un NAP que
                cambia entre idiomas rompe el SEO local y la verificación. */}
            <address className="not-italic text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div>
                {DIRECCION_COMPLETA}
                {' · '}
                <a href={MAPA_URL} target="_blank" rel="noopener noreferrer" className="text-[#047857] hover:underline">
                  Map
                </a>
              </div>
              <div>
                Peruvian tax ID (RUC) {SITE.ruc} — verifiable at SUNAT
              </div>
              <div>
                <a href={TELEFONOS.central.tel} className="hover:underline">
                  {TELEFONOS.central.display}
                </a>
                {' (switchboard) · '}
                <WhatsAppLink
                  context="footer-en"
                  message="Hello, I am an international buyer and would like to request a quotation."
                  className="text-[#047857] hover:underline"
                >
                  {TELEFONOS.whatsapp.display} (WhatsApp)
                </WhatsAppLink>
              </div>
              <div>
                <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
              </div>
              <div>Business hours: {HORARIO.corto} (Lima time, UTC−5)</div>
            </address>
          </div>

          <div className="text-sm">
            <div className="font-semibold text-[#0A2540] dark:text-inherit mb-2">In English</div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              {ENLACES_EN.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="hover:text-[#047857]">{e.label}</Link>
                </li>
              ))}
            </ul>
            {/* Decirlo antes del clic, no después. */}
            <p className="mt-5 text-gray-500">
              The product catalogue, technical library and specification guides are published in
              Spanish. These English pages cover identity, export terms and the RFQ path.
            </p>
            <p className="mt-3">
              <Link href="/" className="text-[#047857] hover:underline">Ir al sitio en español</Link>
              {' · '}
              <Link href="/pt" className="text-[#047857] hover:underline">Português</Link>
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 dark:border-[var(--border)] pt-6 text-xs text-gray-500">
          © {new Date().getFullYear()} {SITE.legalName}. Manufactured in Chorrillos, Lima, Peru
          since {SITE.foundingYear}. B2B by quotation — no price list.
        </div>
      </div>
    </footer>
  );
}
