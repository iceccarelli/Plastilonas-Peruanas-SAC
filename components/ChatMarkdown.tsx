import React from 'react';

/**
 * RENDERIZADOR SEGURO DE MARKDOWN PARA EL CHATBOT.
 *
 * El asistente (Claude, vía Vercel AI SDK) responde en Markdown: **negrita**,
 * [enlaces](url), párrafos y listas simples. Hasta ahora `Chatbot.tsx` volcaba
 * `message.content` como texto plano, así que el visitante veía literalmente
 * `**Mallas Antiáfidas**` y `[Ver producto](https://...)` sin negrita ni
 * enlace — el correo de ventas y el WhatsApp del cierre de cada respuesta
 * quedaban como texto muerto, no como un canal clicable.
 *
 * Este componente NO usa `dangerouslySetInnerHTML`: parsea el subconjunto
 * exacto que el prompt del asistente puede producir (negrita, enlaces,
 * párrafos, saltos de línea, listas) y construye elementos React. No hay HTML
 * crudo del modelo que llegue al DOM sin pasar por JSX.
 *
 * ESQUEMAS DE URL. Solo se acepta https, http, mailto, tel y una ruta interna
 * que empieza en "/". Cualquier otro esquema (`javascript:`, `data:`, etc.)
 * se degrada a texto plano: el enlace no se renderiza como enlace, pero el
 * texto no desaparece. test/chat-markdown.test.ts prueba el rechazo.
 */

const ESQUEMAS_PERMITIDOS = new Set(['https:', 'http:', 'mailto:', 'tel:']);

/** Ruta interna "segura": empieza en "/" y no es protocolo-relativa ("//host"). */
function esRutaInterna(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

/** Devuelve la URL tal cual si su esquema está permitido, o null si no. */
export function urlSegura(href: string): string | null {
  const limpio = href.trim();
  if (!limpio) return null;
  if (esRutaInterna(limpio)) return limpio;
  try {
    const u = new URL(limpio);
    return ESQUEMAS_PERMITIDOS.has(u.protocol) ? limpio : null;
  } catch {
    return null;
  }
}

/** `**negrita**` y `[texto](url)` dentro de una sola línea de texto. */
function renderInline(texto: string, keyPrefix: string): React.ReactNode[] {
  const patron = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  const nodos: React.ReactNode[] = [];
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = patron.exec(texto)) !== null) {
    if (m.index > ultimo) nodos.push(texto.slice(ultimo, m.index));

    if (m[1] !== undefined) {
      nodos.push(<strong key={`${keyPrefix}-b${i}`}>{m[1]}</strong>);
    } else {
      const etiqueta = m[2];
      const href = urlSegura(m[3]);
      if (!href) {
        // Esquema no permitido: se conserva el texto visible, sin enlace.
        nodos.push(etiqueta);
      } else if (esRutaInterna(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
        nodos.push(
          <a key={`${keyPrefix}-l${i}`} href={href} className="underline font-medium text-[#047857] hover:text-[#059669]">
            {etiqueta}
          </a>,
        );
      } else {
        nodos.push(
          <a
            key={`${keyPrefix}-l${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-[#047857] hover:text-[#059669]"
          >
            {etiqueta}
          </a>,
        );
      }
    }
    ultimo = patron.lastIndex;
    i++;
  }
  if (ultimo < texto.length) nodos.push(texto.slice(ultimo));
  return nodos;
}

/** ¿La línea es un ítem de lista con o sin numerar? */
const esItemLista = (linea: string) => /^\s*(?:[-*]|\d+[.)])\s+/.test(linea);
const textoDeItem = (linea: string) => linea.replace(/^\s*(?:[-*]|\d+[.)])\s+/, '');

interface ChatMarkdownProps {
  content: string;
}

/**
 * Convierte el Markdown del asistente en bloques: listas (`<ul>`) y párrafos
 * (`<p>`, con `<br/>` entre líneas del mismo párrafo). Un párrafo termina en
 * una línea en blanco o al empezar/terminar una lista.
 */
export default function ChatMarkdown({ content }: ChatMarkdownProps) {
  const lineas = content.replace(/\r\n/g, '\n').split('\n');
  const bloques: React.ReactNode[] = [];
  let parrafoActual: string[] = [];
  let listaActual: string[] = [];
  let clave = 0;

  const cerrarParrafo = () => {
    if (parrafoActual.length === 0) return;
    const key = `p${clave++}`;
    bloques.push(
      <p key={key} className="whitespace-pre-wrap">
        {parrafoActual.map((linea, idx) => (
          <React.Fragment key={`${key}-${idx}`}>
            {idx > 0 && <br />}
            {renderInline(linea, `${key}-${idx}`)}
          </React.Fragment>
        ))}
      </p>,
    );
    parrafoActual = [];
  };

  const cerrarLista = () => {
    if (listaActual.length === 0) return;
    const key = `ul${clave++}`;
    bloques.push(
      <ul key={key} className="list-disc pl-5 space-y-1">
        {listaActual.map((item, idx) => (
          <li key={`${key}-${idx}`}>{renderInline(textoDeItem(item), `${key}-${idx}`)}</li>
        ))}
      </ul>,
    );
    listaActual = [];
  };

  for (const linea of lineas) {
    if (linea.trim() === '') {
      cerrarParrafo();
      cerrarLista();
      continue;
    }
    if (esItemLista(linea)) {
      cerrarParrafo();
      listaActual.push(linea);
    } else {
      cerrarLista();
      parrafoActual.push(linea);
    }
  }
  cerrarParrafo();
  cerrarLista();

  return <div className="space-y-2">{bloques}</div>;
}
