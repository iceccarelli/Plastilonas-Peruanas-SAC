import { describe, it, expect } from 'vitest';
import { classify, capture, read, channelOfHost, type StorageLike } from '@/lib/attribution';
import { LeadSchema } from '@/lib/lead-schema';

const own = 'plastilonas.com';
const c = (search: string, referrer = '', landingPath = '/productos/mallas-antiafidas') =>
  classify({ search, referrer, landingPath, ownHost: own });

const memStore = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

describe('clasificación de canal', () => {
  it('asistentes de IA, por referrer o por utm_source (ChatGPT agrega utm_source=chatgpt.com)', () => {
    expect(c('?utm_source=chatgpt.com').channel).toBe('ai_assistant');
    expect(c('', 'https://chatgpt.com/').channel).toBe('ai_assistant');
    expect(c('', 'https://www.perplexity.ai/search?q=x').channel).toBe('ai_assistant');
    expect(c('', 'https://claude.ai/chat/abc').channel).toBe('ai_assistant');
  });
  it('gemini.google.com es IA y no «búsqueda orgánica»; google.com.pe sí es búsqueda', () => {
    expect(c('', 'https://gemini.google.com/app').channel).toBe('ai_assistant');
    expect(c('', 'https://www.google.com.pe/').channel).toBe('organic_search');
    expect(c('', 'https://www.bing.com/search?q=lona').channel).toBe('organic_search');
  });
  it('redes sociales y WhatsApp', () => {
    expect(c('', 'https://www.linkedin.com/feed/').channel).toBe('social');
    expect(c('', 'https://l.facebook.com/l.php').channel).toBe('social');
    expect(c('?utm_source=linkedin&utm_medium=social&utm_campaign=mallas').channel).toBe('social');
  });
  it('pago: utm_medium=cpc o clic publicitario sin referrer externo', () => {
    expect(c('?utm_source=google&utm_medium=cpc').channel).toBe('paid');
    expect(c('?gclid=abc').channel).toBe('paid');
    expect(c('?gclid=abc').ad_click).toBe(true);
  });
  it('campaña propia (boletín), referencia genérica y directo', () => {
    expect(c('?utm_source=boletin&utm_medium=email').channel).toBe('campaign');
    expect(c('', 'https://www.minem.gob.pe/').channel).toBe('referral');
    expect(c('', '').channel).toBe('direct');
  });
  it('un referrer del propio sitio no cuenta como referencia', () => {
    expect(c('', 'https://www.plastilonas.com/productos/x').channel).toBe('direct');
  });
  it('no guarda el valor del clic publicitario, solo que existió; y la ruta sin query', () => {
    const a = c('?gclid=SECRETO123&utm_source=google&utm_medium=cpc', '', '/productos/x?foo=1');
    expect(JSON.stringify(a)).not.toContain('SECRETO123');
    expect(a.landing_path).toBe('/productos/x');
  });
  it('recorta valores largos de utm (no deja que una URL hostil infle el registro)', () => {
    expect(c(`?utm_campaign=${'a'.repeat(500)}`).utm_campaign!.length).toBe(120);
  });
  it('channelOfHost: dominios parecidos no coinciden por sufijo engañoso', () => {
    expect(channelOfHost('notchatgpt.com')).toBeNull();
    expect(channelOfHost('chatgpt.com.evil.example')).toBeNull();
  });
});

describe('persistencia de primer contacto hasta el RFQ', () => {
  it('la campaña de la ficha de producto sobrevive a la navegación a /cotizacion (el defecto original)', () => {
    const s = memStore();
    // 1) Llega a la ficha desde un asistente de IA.
    capture({ search: '?utm_source=chatgpt.com', referrer: '', landingPath: '/productos/mallas-antiafidas', ownHost: own }, s);
    // 2) Navega a /cotizacion: URL sin campaña, referrer interno.
    capture({ search: '?producto=mallas-antiafidas', referrer: 'https://plastilonas.com/productos/mallas-antiafidas', landingPath: '/cotizacion', ownHost: own }, s);
    const a = read(s)!;
    expect(a.channel).toBe('ai_assistant');
    expect(a.landing_path).toBe('/productos/mallas-antiafidas');
    expect(a.utm_source).toBe('chatgpt.com');
  });
  it('una campaña explícita posterior reemplaza el primer contacto', () => {
    const s = memStore();
    capture({ search: '', referrer: 'https://www.google.com/', landingPath: '/', ownHost: own }, s);
    expect(read(s)!.channel).toBe('organic_search');
    capture({ search: '?utm_source=linkedin&utm_medium=social', referrer: '', landingPath: '/big-bags', ownHost: own }, s);
    expect(read(s)!.channel).toBe('social');
  });
  it('almacenamiento bloqueado o corrupto no rompe nada', () => {
    const roto: StorageLike = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(capture({ search: '', referrer: '', landingPath: '/', ownHost: own }, roto)).toBeNull();
    expect(read(roto)).toBeNull();
    expect(read({ getItem: () => '{no json', setItem: () => {} })).toBeNull();
    expect(read({ getItem: () => JSON.stringify({ channel: 'hack' }), setItem: () => {} })).toBeNull();
  });
});

describe('la atribución llega al registro del lead', () => {
  const base = { email: 'qa@example.com', telefono: '999000111' };
  it('el esquema conserva canal, referrer y landing (antes los descartaba en silencio)', () => {
    const r = LeadSchema.parse({ ...base, channel: 'ai_assistant', referrer_host: 'chatgpt.com', landing_path: '/productos/x', ad_click: false });
    expect(r).toMatchObject({ channel: 'ai_assistant', referrer_host: 'chatgpt.com', landing_path: '/productos/x' });
  });
  it('rechaza un canal inventado', () => {
    expect(LeadSchema.safeParse({ ...base, channel: 'hack' }).success).toBe(false);
  });
});
