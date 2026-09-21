import { AlertTriangle } from 'lucide-react';
import type { z } from 'zod';
import type { RiskResponse } from '@/lib/ai/schema';
import { CardShell, CardEyebrow, CardFollowUp } from './CardShell';

type Props = z.infer<typeof RiskResponse>;

const PILLAR_LABEL: Record<Props['pillarId'], string> = {
  compatibilidad: 'Compatibilidad',
  cargas: 'Cargas',
  exposicion: 'Exposición',
  ejecucion: 'Ejecución',
  documentacion: 'Documentación',
  operacion: 'Operación',
};

/** Un criterio del Marco de Especificación (lib/framework.ts): qué preguntar y qué riesgo corre el proyecto si no se responde. */
export default function RiskCard({ pillarId, pregunta, riesgo, followUp }: Props) {
  return (
    <CardShell>
      <CardEyebrow>Marco de especificación · {PILLAR_LABEL[pillarId]}</CardEyebrow>
      <p className="text-sm font-semibold text-[#0A2540] dark:text-[var(--text)]">{pregunta}</p>
      <div className="mt-3 flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2.5">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <span>{riesgo}</span>
      </div>
      <CardFollowUp followUp={followUp} />
    </CardShell>
  );
}
