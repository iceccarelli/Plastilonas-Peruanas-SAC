'use client';

import { useEffect, useState } from 'react';
import { HORARIO } from '@/lib/site';

/**
 * ¿Abierto ahora? — calculado en la zona horaria de la planta.
 *
 * El horario publicado es el de Lima; el visitante puede estar en otra zona
 * (o su reloj puede estarlo). Intl con timeZone 'America/Lima' da la hora que
 * rige de verdad la atención. Se calcula tras montar para no arriesgar una
 * discrepancia de hidratación entre el reloj del servidor y el del cliente;
 * hasta entonces se muestra solo el horario, que es correcto siempre.
 */
function abiertoEnLima(ahora: Date): boolean {
  const partes = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    hour12: false,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(ahora);
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? '';
  const dia = get('weekday').toLowerCase(); // lun, mar, ..., sáb, dom
  const minutos = Number(get('hour')) * 60 + Number(get('minute'));
  if (dia.startsWith('dom')) return false;
  if (dia.startsWith('s')) return minutos >= 8 * 60 && minutos < 13 * 60; // sáb 8–13
  return minutos >= 8 * 60 && minutos < 18 * 60; // L–V 8–18
}

export default function EstadoHorario({ className = '' }: { className?: string }) {
  const [abierto, setAbierto] = useState<boolean | null>(null);

  useEffect(() => {
    const calcular = () => setAbierto(abiertoEnLima(new Date()));
    calcular();
    const id = setInterval(calcular, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className}>
      {abierto !== null && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${
            abierto ? 'bg-[#34D399]' : 'bg-gray-400'
          }`}
          aria-hidden="true"
        />
      )}
      {abierto === null ? HORARIO.corto : abierto ? `Abierto ahora · ${HORARIO.corto}` : `Fuera de horario · ${HORARIO.corto}`}
    </span>
  );
}
