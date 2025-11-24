import { PlanType, PlanConfig } from './types';

export const PLANS: Record<PlanType, PlanConfig> = {
  [PlanType.FREE]: {
    id: 'plan_free',
    name: 'Plano Free (30 Dias)',
    priceId: 'prod_TSBEUvesZnyFJO',
    hasAI: true,
    description: 'Acesso completo ao Gemini IA por 30 dias.',
    priceLabel: 'Grátis',
  },
  [PlanType.JSON_ONLY]: {
    id: 'plan_json',
    name: 'Plano JSON (Sem IA)',
    priceId: 'prod_TSBFZleC61Rm5y',
    hasAI: false,
    description: 'Ferramentas exclusivas de manipulação JSON. IA Bloqueada.',
    priceLabel: 'R$ 29,90/mês',
  },
  [PlanType.PRINCIPAL]: {
    id: 'plan_principal',
    name: 'Plano Principal (IA Completa)',
    priceId: 'prod_TSBFAZOMsCNIAT',
    hasAI: true,
    description: 'Acesso ilimitado a IA e Ferramentas JSON.',
    priceLabel: 'R$ 59,90/mês',
  },
};

export const GEMINI_MODEL = 'gemini-2.5-flash'; // Standard fast model for chat