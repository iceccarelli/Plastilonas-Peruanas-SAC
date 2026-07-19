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

/**
 * Las 10 plataformas sociales más usadas, en orden de prioridad para el mercado
 * peruano B2B. Se muestran TODAS (base para wiring con n8n y campañas pagadas).
 *
 * WhatsApp y Facebook apuntan a destinos reales de Plastilonas. El resto enlazan
 * por ahora a la plataforma (marcador de posición): reemplace el `href` por la
 * URL del perfil real cuando la cuenta exista — el patrón está en el TODO de cada
 * línea. Los enlaces https abren la app nativa en móvil automáticamente
 * (universal links de iOS/Android); en escritorio abren el sitio en pestaña nueva.
 *
 * `ready`: true = perfil real ya configurado; false = marcador pendiente.
 */

export interface SocialLink {
  name: string;
  href: string;
  Icon: IconType;
  ready: boolean;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'WhatsApp',  href: 'https://wa.me/51946085270',                    Icon: SiWhatsapp,  ready: true  },
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
