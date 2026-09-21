import React from 'react';

/**
 * Envoltura visual común de las tarjetas de /asistente: mismo radio, borde y
 * sombra que el resto del sitio (ver components/Chatbot.tsx, .rounded-3xl
 * blanco sobre fondo gris), para que el panel central no invente un lenguaje
 * visual nuevo.
 */
export function CardShell({
  children,
  accent = false,
  className = '',
}: {
  children: React.ReactNode;
  /** Borde superior esmeralda: para tarjetas de acción/conversión. */
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-[var(--surface-raised)] border border-gray-100 dark:border-[var(--border)] rounded-3xl shadow-sm p-5 ${
        accent ? 'border-t-4 border-t-[#059669]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-[0.12em] text-[#059669] font-semibold mb-2">
      {children}
    </div>
  );
}

/** Línea de "siguiente paso" común a casi todas las variantes (BaseFields.followUp). */
export function CardFollowUp({ followUp }: { followUp?: string }) {
  if (!followUp) return null;
  return (
    <p className="mt-3 pt-3 border-t border-gray-100 dark:border-[var(--border)] text-sm text-gray-600 dark:text-[var(--text-muted)]">
      {followUp}
    </p>
  );
}
