import React, { useState } from 'react';
import { MessageSquare, Braces, Settings, CreditCard, Box, Lock, Zap, QrCode, X } from 'lucide-react';
import { ViewMode, PlanType } from '../types';
import { PLANS } from '../constants';

interface SidebarProps {
  currentView: ViewMode;
  currentPlan: PlanType;
  isAdmin: boolean;
  onNavigate: (view: ViewMode) => void;
  onOpenPricing: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, currentPlan, isAdmin, onNavigate, onOpenPricing }) => {
  const [showQr, setShowQr] = useState(false);
  const planConfig = PLANS[currentPlan];
  // Updated to the specific server IP requested
  const qrUrl = "http://72.60.246.250:3039/";

  return (
    <>
      <div className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-full transition-all duration-300 relative z-20">
        <div>
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-between px-0 lg:px-6 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-center lg:justify-start flex-1">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                <Box className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-bold text-white hidden lg:block tracking-tight">StripeAI</span>
            </div>
            
            {/* QR Code Trigger (Desktop only usually, but good for all) */}
            <button 
              onClick={() => setShowQr(true)}
              className="hidden lg:flex p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="QR Code de Suporte"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          {/* Menu de Lógicas */}
          <div className="flex-1 overflow-y-auto py-6 space-y-8">
            
            {/* Lógica IA Section */}
            <div className="px-2 lg:px-4">
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 hidden lg:flex items-center justify-between">
                Lógica IA
                {planConfig.hasAI ? (
                  <span className="text-emerald-500 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">ATIVO</span>
                ) : (
                   <span className="text-slate-500 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">BLOQUEADO</span>
                )}
              </h3>
              <button
                onClick={() => onNavigate(ViewMode.CHAT)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  currentView === ViewMode.CHAT
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className={`relative ${currentView === ViewMode.CHAT ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>
                  <MessageSquare className="w-5 h-5" />
                  {!planConfig.hasAI && (
                    <div className="absolute -top-1 -right-1 bg-slate-950 rounded-full">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                    </div>
                  )}
                </div>
                <span className="hidden lg:block font-medium">Chat Gemini</span>
              </button>
            </div>

            {/* Lógica Estrutural Section - ADMIN ONLY */}
            {isAdmin && (
              <div className="px-2 lg:px-4 animate-in fade-in slide-in-from-left-4 duration-500">
                 <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 hidden lg:block">
                  Lógica Estrutural
                </h3>
                <button
                  onClick={() => onNavigate(ViewMode.JSON_TOOLS)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                    currentView === ViewMode.JSON_TOOLS
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Braces className={`w-5 h-5 ${currentView === ViewMode.JSON_TOOLS ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                  <span className="hidden lg:block font-medium">Studio JSON</span>
                </button>
              </div>
            )}
            
          </div>
        </div>

        {/* Plan Info */}
        <div className="p-2 lg:p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${planConfig.hasAI ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                 {planConfig.hasAI ? <Zap className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Plano Atual</p>
                <p className="text-sm text-white font-medium truncate leading-tight">{planConfig.name}</p>
              </div>
            </div>
            
            <button
              onClick={onOpenPricing}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700 hover:border-indigo-500 rounded-lg text-xs text-slate-300 transition-all flex items-center justify-center gap-2 group"
            >
              <Settings className="w-3 h-3 group-hover:rotate-45 transition-transform" />
              <span className="hidden lg:inline">Gerenciar Plano</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal Overlay */}
      {showQr && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowQr(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center max-w-sm w-full animate-in zoom-in-95 duration-200 relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">Suporte Mobile</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">Escaneie para acessar o assistente de suporte diretamente no seu celular.</p>
            
            <div className="p-3 bg-white border-2 border-slate-100 rounded-xl shadow-inner mb-6">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`}
                alt="QR Code" 
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-600 truncate">{qrUrl}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(qrUrl)}
                className="text-indigo-600 text-xs font-bold hover:underline"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;