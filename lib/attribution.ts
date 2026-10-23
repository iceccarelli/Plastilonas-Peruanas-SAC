/**
 * Atribución de primer contacto que SOBREVIVE hasta el RFQ.
 *
 * EL DEFECTO. El formulario leía `utm_*` de la URL de /cotizacion. Pero nadie
 * llega a /cotizacion con campaña puesta: llega a una ficha de producto
 * (donde sí estaba `?utm_source=chatgpt.com`) y pulsa «Cotizar», que enlaza a
 * /cotizacion?producto=… SIN la campaña. El RFQ salía como «directo» aunque
 * hubiera nacido de una búsqueda, de LinkedIn o de un asistente de IA, y la
 * pregunta «¿qué canal produce cotizaciones?» no tenía respuesta.
 *
 * Aquí se guarda, UNA vez por sesión y solo en el navegador (sessionStorage),
 * de dónde vino la visita; el dato solo sale del navegador si la persona envía
 * un RFQ. Es contexto de la solicitud, no seguimiento entre sitios.
 */
export const CHANNELS = ['ai_assistant', 'organic_search', 'social', 'paid', 'campaign', 'referral', 'direct'] as const;
export type Channel = (typeof CHANNELS)[number];

export interface Attribution {
  channel: Channel;
  referrer_host?: string;
  landing_path?: string;
  ad_click?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const AI_HOSTS = [
  'chatgpt.com', 'chat.openai.com', 'openai.com', 'perplexity.ai', 'claude.ai', 'gemini.google.com',
  'copilot.microsoft.com', 'you.com', 'phind.com', 'poe.com', 'deepseek.com', 'grok.com', 'meta.ai',
];
const SEARCH_HOSTS = ['google.', 'bing.com', 'duckduckgo.com', 'yahoo.', 'ecosia.org', 'search.brave.com', 'yandex.', 'baidu.com'];
const SOCIAL_HOSTS = ['linkedin.com', 'lnkd.in', 'facebook.com', 'fb.com', 'instagram.com', 'x.com', 'twitter.com', 't.co', 'youtube.com', 'youtu.be', 'whatsapp.com', 'tiktok.com'];

const inList = (host: string, list: string[]) =>
  list.some((h) => (h.endsWith('.') ? host.includes(h) : host === h || host.endsWith(`.${h}`)));

export function hostOf(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Clasifica un host (de referrer o de utm_source) en un canal. */
export function channelOfHost(host: string): Channel | null {
  // La IA va antes que la búsqueda: gemini.google.com también es «google.».
  if (inList(host, AI_HOSTS)) return 'ai_assistant';
  if (inList(host, SOCIAL_HOSTS)) return 'social';
  if (inList(host, SEARCH_HOSTS)) return 'organic_search';
  return null;
}

const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'li_fat_id'];
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export function classify(input: { search: string; referrer: string; landingPath: string; ownHost: string }): Attribution {
  const q = new URLSearchParams(input.search);
  const utm: Partial<Record<(typeof UTM_KEYS)[number], string>> = {};
  for (const k of UTM_KEYS) {
    const v = q.get(k)?.trim().slice(0, 120);
    if (v) utm[k] = v;
  }
  const adClick = CLICK_IDS.some((k) => q.has(k));
  const ref = hostOf(input.referrer);
  const externalRef = ref && ref !== input.ownHost.replace(/^www\./, '') ? ref : null;
  const medium = (utm.utm_medium ?? '').toLowerCase();
  const source = (utm.utm_source ?? '').toLowerCase();

  let channel: Channel = 'direct';
  if (/^(cpc|ppc|paid|paidsearch|paid_social|display)$/.test(medium) || (adClick && !externalRef)) channel = 'paid';
  else if (source && channelOfHost(source.includes('.') ? source : `${source}.com`) === 'ai_assistant') channel = 'ai_assistant';
  else if (externalRef && channelOfHost(externalRef)) channel = channelOfHost(externalRef)!;
  else if (source) channel = channelOfHost(source.includes('.') ? source : `${source}.com`) ?? 'campaign';
  else if (externalRef) channel = 'referral';
  if (adClick && channel !== 'paid' && /^(cpc|ppc|paid)/.test(medium)) channel = 'paid';

  return {
    channel,
    ...(externalRef ? { referrer_host: externalRef } : {}),
    landing_path: input.landingPath.split('?')[0].slice(0, 400),
    ...(adClick ? { ad_click: true } : {}),
    ...utm,
  };
}

const KEY = 'pp-attr';
export interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

/** Primer contacto de la sesión; una campaña explícita posterior lo reemplaza. */
export function capture(
  env: { search: string; referrer: string; landingPath: string; ownHost: string },
  store: StorageLike,
): Attribution | null {
  try {
    const next = classify(env);
    const prevRaw = store.getItem(KEY);
    const explicit = Boolean(next.utm_source || next.ad_click);
    if (prevRaw && !explicit) return JSON.parse(prevRaw) as Attribution;
    store.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return null; // sessionStorage bloqueado: el RFQ sigue sin atribución, no falla
  }
}

export function read(store: StorageLike): Attribution | null {
  try {
    const raw = store.getItem(KEY);
    const a = raw ? (JSON.parse(raw) as Attribution) : null;
    return a && (CHANNELS as readonly string[]).includes(a.channel) ? a : null;
  } catch {
    return null;
  }
}
