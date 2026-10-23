import type {
  Channel, DeliveryOutcome, DeliveryRow, DeliveryStatus, InsertResult, LeadStore, NewQuote,
} from '@/lib/lead-store';
import type { LeadInput } from '@/lib/lead-schema';

/** Store en memoria con las MISMAS restricciones únicas que la migración. */
export function memoryLeadStore(opts: { failInsert?: boolean; failCount?: boolean } = {}) {
  const quotes: Array<NewQuote & { id: string; createdAt: number }> = [];
  const deliveries = new Map<string, DeliveryRow & { lastError: string | null; next: Date | null }>();
  let n = 0;
  const store: LeadStore & { quotes: typeof quotes; deliveries: typeof deliveries; forceRfqCollisions: number } = {
    quotes, deliveries, forceRfqCollisions: 0,
    async insertQuote(q): Promise<InsertResult> {
      if (opts.failInsert) throw new Error('db down');
      if (store.forceRfqCollisions > 0) { store.forceRfqCollisions--; return { kind: 'rfq_collision' }; }
      const dup = quotes.find((x) => x.idempotencyKey === q.idempotencyKey);
      if (dup) {
        const d: Record<string, DeliveryStatus> = {};
        for (const v of deliveries.values()) if (v.quoteId === dup.id) d[v.channel] = v.status;
        return { kind: 'duplicate', quote: { id: dup.id, rfqId: dup.rfqId }, deliveries: d };
      }
      if (quotes.some((x) => x.rfqId === q.rfqId)) return { kind: 'rfq_collision' };
      const row = { ...q, id: `q${++n}`, createdAt: Date.now() };
      quotes.push(row);
      return { kind: 'created', quote: { id: row.id, rfqId: row.rfqId } };
    },
    async countRecentByIp(h, since) {
      if (opts.failCount) throw new Error('db down');
      return quotes.filter((x) => x.ipHash === h && Date.now() - x.createdAt <= since).length;
    },
    async createDeliveries(quoteId, channels) {
      for (const c of channels) deliveries.set(`${quoteId}:${c}`, {
        id: `${quoteId}:${c}`, quoteId, channel: c, status: 'pending', attempts: 0, lastError: null, next: new Date(),
      });
    },
    async recordDelivery(quoteId, channel: Channel, o: DeliveryOutcome) {
      const d = deliveries.get(`${quoteId}:${channel}`)!;
      Object.assign(d, { status: o.status, attempts: o.attempts, lastError: o.lastError, next: o.nextAttemptAt });
    },
    async dueDeliveries(limit) {
      return [...deliveries.values()]
        .filter((d) => (d.status === 'pending' || d.status === 'failed') && d.next && d.next.getTime() <= Date.now())
        .slice(0, limit)
        .map((d) => {
          const q = quotes.find((x) => x.id === d.quoteId)!;
          return { ...d, rfqId: q.rfqId, lead: q.lead as LeadInput };
        });
    },
    async deliveryHealth() {
      const c = (s: DeliveryStatus) => [...deliveries.values()].filter((d) => d.status === s).length;
      return { pending: c('pending'), failed: c('failed'), dead: c('dead'), oldestDueAgeSec: null };
    },
  };
  return store;
}
