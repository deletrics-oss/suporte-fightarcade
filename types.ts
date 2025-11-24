export enum PlanType {
  FREE = 'FREE',
  JSON_ONLY = 'JSON_ONLY',
  PRINCIPAL = 'PRINCIPAL'
}

export interface PlanConfig {
  id: string;
  name: string;
  priceId: string;
  hasAI: boolean;
  description: string;
  priceLabel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum ViewMode {
  CHAT = 'CHAT',
  JSON_TOOLS = 'JSON_TOOLS',
  SETTINGS = 'SETTINGS'
}