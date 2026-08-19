import type { IconType } from 'react-icons';
import {
  SiWhatsapp,
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiX,
  SiTelegram,
  SiPinterest,
  SiSnapchat,
} from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { WHATSAPP_NUMBER } from './whatsapp';

/**
 * Perfiles sociales. SOLO se renderizan los que apuntan a una cuenta real.
 *
 * Por qué. Esta lista se mostraba entera, incluidos ocho marcadores que
 * enlazaban a la portada de la plataforma: quien hacía clic en "LinkedIn"
 * aterrizaba en linkedin.com, no en la empresa. Eso es tres defectos a la vez —
 * rompe la confianza del comprador justo en el pie de página, manda ocho
 * enlaces salientes a portadas genéricas desde las 157 páginas del sitio, y
 * emite eventos `social_click` que no significan nada.
 *
 * Es la misma regla que ya gobierna `SITE.sameAs`: un perfil ausente es
 * infinitamente mejor que uno falso. La lista de marcadores se conserva como
 * dato — con el patrón de URL real en cada TODO — para que el día que exista
 * la cuenta baste cambiar el href y poner `ready: true`. Un test impide que
 * un marcador vuelva a renderizarse.
 *
 * Los enlaces https abren la app nativa en móvil (universal links de
 * iOS/Android); en escritorio abren el sitio en pestaña nueva.
 *
 * `ready`: true = perfil real verificado; false = marcador, NO se renderiza.
 */

export interface SocialLink {
  name: string;
  href: string;
  Icon: IconType;
  ready: boolean;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'WhatsApp',  href: `https://wa.me/${WHATSAPP_NUMBER}`,             Icon: SiWhatsapp,  ready: true  },
  { name: 'Facebook',  href: 'https://www.facebook.com/plastilonasperuanas', Icon: SiFacebook,  ready: true  },
  // TODO perfil real: https://www.instagram.com/USUARIO
  { name: 'Instagram', href: 'https://www.instagram.com/',                   Icon: SiInstagram, ready: false },
  // TODO perfil real: https://www.tiktok.com/@USUARIO
  { name: 'TikTok',    href: 'https://www.tiktok.com/',                      Icon: SiTiktok,    ready: false },
  // TODO perfil real: https://www.youtube.com/@CANAL
  { name: 'YouTube',   href: 'https://www.youtube.com/',                     Icon: SiYoutube,   ready: false },
  // TODO perfil real: https://www.linkedin.com/company/EMPRESA
  { name: 'LinkedIn',  href: 'https://www.linkedin.com/',                    Icon: FaLinkedin,  ready: false },
  // TODO perfil real: https://x.com/USUARIO
  { name: 'X',         href: 'https://x.com/',                               Icon: SiX,         ready: false },
  // TODO perfil real: https://t.me/USUARIO
  { name: 'Telegram',  href: 'https://telegram.org/',                        Icon: SiTelegram,  ready: false },
  // TODO perfil real: https://www.pinterest.com/USUARIO
  { name: 'Pinterest', href: 'https://www.pinterest.com/',                   Icon: SiPinterest, ready: false },
  // TODO perfil real: https://www.snapchat.com/add/USUARIO
  { name: 'Snapchat',  href: 'https://www.snapchat.com/',                    Icon: SiSnapchat,  ready: false },
];

/**
 * Los únicos enlaces que el sitio puede mostrar. Toda superficie que pinte
 * iconos sociales debe consumir ESTA función, nunca SOCIAL_LINKS directamente.
 */
export const readySocialLinks = (): SocialLink[] => SOCIAL_LINKS.filter((l) => l.ready);

/** Marcadores pendientes de cuenta real. Existe para que los tests los vigilen. */
export const pendingSocialLinks = (): SocialLink[] => SOCIAL_LINKS.filter((l) => !l.ready);
