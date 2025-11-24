import React, { useState } from 'react';
import { CheckCircle, XCircle, ShoppingCart, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { PLANS } from '../constants';
import { PlanType } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  currentPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, currentPlan, onSelectPlan, onClose }) => {
  const [processingPlan, setProcessingPlan] = useState<PlanType | null>(null);

  if (!isOpen) return null;

  const handleSelect = async (planType: PlanType) => {
    if (planType === currentPlan) return;

    setProcessingPlan(planType);
    
    // Simulate Stripe Checkout processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onSelectPlan(planType);
    setProcessingPlan(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Estrutura de Planos</h2>
                <p className="text-slate-400 text-xs mt-0.5">Selecione o pacote ideal para sua necessidade de lógica.</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = currentPlan === key;
            const planType = key as PlanType;
            const isProcessing = processingPlan === planType;
            const isFree = planType === PlanType.FREE;
            
            return (
              <div 
                key={plan.id} 
                className={`relative flex flex-col rounded-xl border-2 p-6 transition-all duration-300 group ${
                  isCurrent 
                    ? 'border-indigo-500 bg-slate-800 shadow-[0_0_30px_rgba(99,102,241,0.15)] transform scale-[1.02]' 
                    : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Atual
                  </div>
                )}
                
                <div className="mb-6 text-center">
                  <h3 className={`text-lg font-bold ${isCurrent ? 'text-white' : 'text-slate-200'}`}>{plan.name}</h3>
                  <div className={`text-3xl font-bold mt-2 ${isCurrent ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {plan.priceLabel}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2 opacity-50">
                     <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {plan.priceId}
                     </span>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6"></div>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-start gap-3">
                    {plan.hasAI ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className={`text-sm font-medium ${plan.hasAI ? 'text-slate-200' : 'text-slate-500'}`}>
                        Acesso Gemini IA
                      </span>
                      <p className="text-xs text-slate-500 leading-snug mt-0.5">
                        {plan.hasAI ? 'Processamento completo e ilimitado.' : 'Módulo de inteligência desativado.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                     <div>
                        <span className="text-sm font-medium text-slate-200">Ferramentas JSON</span>
                        <p className="text-xs text-slate-500 leading-snug mt-0.5">
                          Validação, formatação e minificação.
                        </p>
                     </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                     <div>
                        <span className="text-sm font-medium text-slate-200">Suporte Dedicado</span>
                        <p className="text-xs text-slate-500 leading-snug mt-0.5">
                          Prioridade na fila de atendimento.
                        </p>
                     </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelect(planType)}
                  disabled={isCurrent || isProcessing || (processingPlan !== null)}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-500 cursor-default border border-slate-700'
                      : isFree
                        ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 hover:shadow-indigo-500/20'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando...
                    </>
                  ) : isCurrent ? (
                    'Plano Ativo'
                  ) : isFree ? (
                    'Selecionar Grátis'
                  ) : (
                    <>
                      Assinar com Stripe <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                {!isCurrent && !isFree && (
                  <p className="text-[10px] text-center text-slate-600 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Pagamento seguro via Stripe
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;