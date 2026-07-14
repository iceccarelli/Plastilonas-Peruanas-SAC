'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Hand, type LucideIcon } from 'lucide-react';

export interface DeckCard {
  title: string;
  body: string;
  index: number;      // 1-based badge number
  Icon?: LucideIcon;  // optional per-card icon (Servicios)
}

// Soft tints so each stacked card is visibly distinct (the "deck" cue).
// Cycles by card index; face + peeking edge both show the hue.
const TINTS = [
  { bg: '#ECFDF5', ring: '#A7F3D0', ink: '#059669' }, // emerald
  { bg: '#FEF3C7', ring: '#FDE68A', ink: '#D97706' }, // amber
  { bg: '#E0F2FE', ring: '#BAE6FD', ink: '#0284C7' }, // sky
  { bg: '#EEF2FF', ring: '#C7D2FE', ink: '#4F46E5' }, // indigo
];

export default function SwipeDeck({
  cards,
  numbered = false,
  desktop,
}: {
  cards: DeckCard[];
  numbered?: boolean;
  desktop: React.ReactNode;
}) {
  const [order, setOrder] = useState(cards.map((_, i) => i));
  const total = cards.length;

  const sendToBack = () => setOrder((o) => [...o.slice(1), o[0]]);
  const bringPrev = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);

  const frontPos = cards[order[0]].index;

  return (
    <>
      <div className="hidden md:block">{desktop}</div>

      <div className="md:hidden">
        {/* Height driven by the front card; peeking cards sit behind it. */}
        <div className="relative">
          {order.map((cardIdx, stackPos) => {
            if (stackPos > 2) return null;
            const card = cards[cardIdx];
            const tint = TINTS[cardIdx % TINTS.length];
            const isFront = stackPos === 0;

            return (
              <motion.div
                key={card.index}
                className={isFront ? 'relative' : 'absolute inset-x-0 top-0'}
                style={{ zIndex: total - stackPos }}
                initial={false}
                animate={{ scale: 1 - stackPos * 0.045, y: stackPos * 12 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                drag={isFront ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) sendToBack();
                  else if (info.offset.x > 70) bringPrev();
                }}
              >
                <div
                  className="rounded-3xl p-6 flex flex-col shadow-sm border"
                  style={{
                    backgroundColor: tint.bg,
                    borderColor: tint.ring,
                    // Non-front cards get a hair less padding-bottom via min-height feel
                    minHeight: isFront ? '13.5rem' : '13.5rem',
                    cursor: isFront ? 'grab' : 'default',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold mb-4 shrink-0"
                    style={{ backgroundColor: tint.ink, color: '#fff' }}
                  >
                    {card.Icon ? <card.Icon className="w-5 h-5" /> : card.index}
                  </div>
                  <div className="font-semibold text-lg text-[#0A2540] mb-2 tracking-tight leading-snug">{card.title}</div>
                  <p className="text-gray-600 leading-relaxed text-[15px]">{card.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={bringPrev} aria-label="Anterior" className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0A2540] tabular-nums">
            <Hand className="w-4 h-4 text-[#059669]" />
            {frontPos} / {total} · desliza
          </div>
          <button onClick={sendToBack} aria-label="Siguiente" className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center active:scale-95 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5">
          {cards.map((c) => {
            const active = c.index === frontPos;
            const tint = TINTS[(c.index - 1) % TINTS.length];
            return (
              <span
                key={c.index}
                className="h-1.5 rounded-full transition-all"
                style={{ width: active ? '1.5rem' : '0.375rem', backgroundColor: active ? tint.ink : '#D1D5DB' }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
