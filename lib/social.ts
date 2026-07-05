import type { LucideIcon } from 'lucide-react';
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Music2,
  Send,
  Video,
  AtSign,
} from 'lucide-react';

/**
 * Redes sociales más usadas en Sudamérica para una empresa industrial B2B.
 *
 * `href` con '#' es un marcador de posición: reemplácelo por la URL real del
 * perfil cuando la cuenta esté creada. Los enlaces con URL real abren en una
 * pestaña nueva; los marcadores quedan deshabilitados visualmente pero
 * presentes, para que el layout no cambie al integrarlos después.
 *
 * WhatsApp y Facebook ya apuntan a destinos reales de Plastilonas.
 */

export interface SocialLink {
  name: string;
  href: string;
  Icon: LucideIcon;
  /** true = URL real; false = marcador de posición pendiente de integrar. */
  ready: boolean;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'WhatsApp',
    href: 'https://wa.me/51946085270',
    Icon: MessageCircle,
    ready: true,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/plastilonasperuanas',
    Icon: Facebook,
    ready: true,
  },
  {
    name: 'Instagram',
    href: '#', // TODO: https://instagram.com/USUARIO
    Icon: Instagram,
    ready: false,
  },
  {
    name: 'TikTok',
    href: '#', // TODO: https://tiktok.com/@USUARIO
    Icon: Music2,
    ready: false,
  },
  {
    name: 'YouTube',
    href: '#', // TODO: https://youtube.com/@CANAL
    Icon: Youtube,
    ready: false,
  },
  {
    name: 'LinkedIn',
    href: '#', // TODO: https://linkedin.com/company/EMPRESA
    Icon: Linkedin,
    ready: false,
  },
  {
    name: 'X',
    href: '#', // TODO: https://x.com/USUARIO
    Icon: AtSign,
    ready: false,
  },
  {
    name: 'Telegram',
    href: '#', // TODO: https://t.me/USUARIO
    Icon: Send,
    ready: false,
  },
  {
    name: 'Kwai',
    href: '#', // TODO: https://kwai.com/@USUARIO
    Icon: Video,
    ready: false,
  },
];
