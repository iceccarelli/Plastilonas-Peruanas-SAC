'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react';

export interface DeckCard {
  title: string;
  body: string;
  index: number; // 1-based badge number
}

/**
 * Stacked swipe deck (mobile) + grid (desktop).
 * - Front card = order[0]. Swiping/dragging sends it to the back (loop of 4).
 * - Visible depth (2 cards peeking behind) signals "this is a deck — swipe me".
 * - Spring transitions, works both directions, with a "n/total · desliza" hint.
 */
export default function SwipeDeck({
  cards,
  accent = '#059669',
  numbered = false,
  desktop,
}: {
  cards: DeckCard[];
  accent?: string;
  numbered?: boolean;
  desktop: React.ReactNode; // the existing grid, shown on md+
}) {
  const [order, setOrder] = useState(cards.map((_, i) => i));
  const [dir, setDir] = useState(1);

  const sendToBack = () => { setDir(1); setOrder((o) => [...o.slice(1), o[0]]); };
  const bringPrev = () => { setDir(-1); setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]); };

  const frontPos = cards[order[0]].index;
  const total = cards.length;

  return (
    <>
      {/* Desktop: the normal grid, untouched */}
      <div className="hidden md:block">{desktop}</div>

      {/* Mobile: stacked deck */}
      <div className="md:hidden">
        <div className="relative h-[19rem] select-none" style={{ perspective: 1000 }}>
          {order.map((cardIdx, stackPos) => {
            const card = cards[cardIdx];
            const isFront = stackPos === 0;
            // Only render the top 3 for depth; rest hidden behind
            if (stackPos > 2) return null;
            return (
              <motion.div
                key={card.index}
                className="absolute inset-0"
                style={{ zIndex: total - stackPos }}
                initial={false}
                animate={{
                  scale: 1 - stackPos * 0.05,
                  y: stackPos * 14,
                  opacity: stackPos > 2 ? 0 : 1,
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                drag={isFront ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) sendToBack();
                  else if (info.offset.x > 70) bringPrev();
                }}
                whileTap={isFront ? { cursor: 'grabbing' } : undefined}
              >
                <div className="h-full bg-white border border-gray-100 rounded-3xl p-7 flex flex-col shadow-sm">
                  {numbered && (
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold mb-4 text-white shrink-0"
                      style={{ backgroundColor: accent }}
                    >
                      {card.index}
                    </div>
                  )}
                  <div className="font-semibold text-xl text-[#0A2540] mb-3 tracking-tight">{card.title}</div>
                  <p className="text-gray-600 leading-relaxed text-[15px] overflow-hidden">{card.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Controls + hint */}
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

        {/* Dots */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {cards.map((c) => (
            <span key={c.index} className={`h-1.5 rounded-full transition-all ${c.index === frontPos ? 'w-6' : 'w-1.5 bg-gray-300'}`} style={c.index === frontPos ? { backgroundColor: accent, width: '1.5rem' } : {}} />
          ))}
        </div>
      </div>
    </>
  );
}
