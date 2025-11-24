import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import JsonTools from './components/JsonTools';
import PricingModal from './components/PricingModal';
import { ViewMode, PlanType } from './types';
import { PLANS } from './constants';
import { Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.CHAT);
  const [currentPlan, setCurrentPlan] = useState<PlanType>(PlanType.FREE);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const planConfig = PLANS[currentPlan];

  // Guard: If current view is Chat but plan doesn't allow AI, show Lock screen
  const isChatLocked = currentView === ViewMode.CHAT && !planConfig.hasAI;

  const handleEnableAdmin = () => {
    setIsAdmin(true);
  };

  const renderContent = () => {
    if (isChatLocked) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Acesso Bloqueado</h2>
          <p className="text-slate-400 max-w-md mb-8">
            Seu plano atual ({planConfig.name}) não inclui acesso às ferramentas de Inteligência Artificial Gemini.
          </p>
          <button
            onClick={() => setIsPricingOpen(true)}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-900/40 transition-all transform hover:scale-105"
          >
            Fazer Upgrade Agora
          </button>
          {isAdmin && (
            <button
               onClick={() => setCurrentView(ViewMode.JSON_TOOLS)}
               className="mt-4 text-sm text-slate-500 hover:text-slate-300 underline"
            >
              Ir para Ferramentas JSON
            </button>
          )}
        </div>
      );
    }

    switch (currentView) {
      case ViewMode.CHAT:
        return <ChatInterface onEnableAdmin={handleEnableAdmin} />;
      case ViewMode.JSON_TOOLS:
        return <JsonTools />;
      default:
        return <div className="p-10 text-white">View not implemented</div>;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden">
      <Sidebar 
        currentView={currentView}
        currentPlan={currentPlan}
        isAdmin={isAdmin}
        onNavigate={setCurrentView}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {renderContent()}
      </main>

      <PricingModal
        isOpen={isPricingOpen}
        currentPlan={currentPlan}
        onSelectPlan={setCurrentPlan}
        onClose={() => setIsPricingOpen(false)}
      />
    </div>
  );
};

export default App;