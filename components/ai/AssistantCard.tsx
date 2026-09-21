import type { AssistantResponse } from '@/lib/ai/schema';
import NarrativeCard from './cards/NarrativeCard';
import RecommendationCard from './cards/RecommendationCard';
import ProductCard from './cards/ProductCard';
import ComparisonCard from './cards/ComparisonCard';
import EvidenceCard from './cards/EvidenceCard';
import RiskCard from './cards/RiskCard';
import CalculationCard from './cards/CalculationCard';
import MissingInformationCard from './cards/MissingInformationCard';
import RFQCard from './cards/RFQCard';
import NextActionCard from './cards/NextActionCard';

/**
 * DESPACHADOR de tarjetas — un componente por variante real del discriminated
 * union de lib/ai/schema.ts. No hay `default`/`unknown`: si Fase 1 agrega una
 * variante nueva, TypeScript marca este switch como no exhaustivo (ver el
 * `never` de abajo), en vez de dejar que una tarjeta desconocida caiga en un
 * genérico silencioso.
 */
export default function AssistantCard({ response }: { response: AssistantResponse }) {
  switch (response.type) {
    case 'narrative':
      return <NarrativeCard {...response} />;
    case 'recommendation':
      return <RecommendationCard {...response} />;
    case 'product':
      return <ProductCard {...response} />;
    case 'comparison':
      return <ComparisonCard {...response} />;
    case 'evidence':
      return <EvidenceCard {...response} />;
    case 'risk':
      return <RiskCard {...response} />;
    case 'calculation':
      return <CalculationCard {...response} />;
    case 'missingInformation':
      return <MissingInformationCard {...response} />;
    case 'rfq':
      return <RFQCard {...response} />;
    case 'nextAction':
      return <NextActionCard {...response} />;
    default: {
      const _exhaustive: never = response;
      return _exhaustive;
    }
  }
}
