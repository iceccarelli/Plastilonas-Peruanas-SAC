import { pillars, nivel, type PillarId } from './framework';

/**
 * PUNTUACIÓN DEL MARCO — lógica pura, sin dependencias pesadas.
 *
 * Vive separada de lib/framework-brief.ts a propósito: ese módulo importa
 * pdf-lib, y tenerlo en el mismo archivo metía ~210 kB de JavaScript en la
 * carga inicial de la evaluación, para una librería que solo hace falta si el
 * usuario decide descargar el PDF. Aquí queda lo que la página necesita desde
 * el primer render; el generador se carga bajo demanda.
 */

export type Answer = 'si' | 'no' | 'nose';
export type Answers = Record<string, Answer>;

export interface PillarScore {
  id: PillarId;
  nombre: string;
  obtenido: number;
  posible: number;
  porcentaje: number;
  pendientes: { pregunta: string; riesgo: string; critico: boolean }[];
}

export interface BriefResult {
  porcentaje: number;
  obtenido: number;
  posible: number;
  nivel: ReturnType<typeof nivel>;
  porPilar: PillarScore[];
}

/**
 * Puntúa las respuestas. "No sé" cuenta igual que "no": el objetivo es medir
 * qué está DEFINIDO, y un dato que nadie conoce no está definido.
 */
export function scoreAnswers(answers: Answers): BriefResult {
  const porPilar: PillarScore[] = pillars.map((p) => {
    let obtenido = 0;
    let posible = 0;
    const pendientes: PillarScore['pendientes'] = [];
    for (const c of p.criterios) {
      posible += c.peso;
      if (answers[c.id] === 'si') obtenido += c.peso;
      else pendientes.push({ pregunta: c.pregunta, riesgo: c.riesgo, critico: c.peso === 2 });
    }
    return {
      id: p.id,
      nombre: p.nombre,
      obtenido,
      posible,
      porcentaje: posible ? Math.round((obtenido / posible) * 100) : 0,
      pendientes,
    };
  });

  const obtenido = porPilar.reduce((n, p) => n + p.obtenido, 0);
  const posible = porPilar.reduce((n, p) => n + p.posible, 0);
  const porcentaje = posible ? Math.round((obtenido / posible) * 100) : 0;
  return { porcentaje, obtenido, posible, nivel: nivel(porcentaje), porPilar };
}
