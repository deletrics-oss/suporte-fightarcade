import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, AlertTriangle, RotateCcw, Mic, MicOff, Volume2, VolumeX, PlayCircle, Palette, ExternalLink } from 'lucide-react';
import { createChatSession, sendMessageStream, FIGHT_ARCADE_WELCOME_TEXT } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';

// Simple Speech Recognition Type Definition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface ChatInterfaceProps {
  onEnableAdmin: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onEnableAdmin }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: FIGHT_ARCADE_WELCOME_TEXT,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio States
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatSessionRef = useRef(createChatSession());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Text-to-Speech (TTS) when a new model message finishes loading
  useEffect(() => {
    if (!isLoading && isAudioEnabled) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'model' && !lastMsg.isError) {
        speakText(lastMsg.text);
      }
    }
  }, [isLoading, isAudioEnabled, messages]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
      // Remove URLs, markers and brackets for cleaner speech
      const cleanText = text
        .replace(/\[VIDEO_LOCAL\]/g, '')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR'; // Set to Portuguese
      utterance.rate = 1.1; // Slightly faster for better flow
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    if (!newState) {
      window.speechSynthesis.cancel();
    }
  };

  const handleMicClick = () => {
    // 1. Check for HTTPS (Required for mobile Mic)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert("⚠️ O microfone requer conexão segura (HTTPS). Por favor, acesse o site via https://");
      return;
    }

    // 2. Check for iOS (Apple limits Web Speech API)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      alert("⚠️ Em dispositivos Apple (iOS), o reconhecimento de voz via navegador pode ser bloqueado pelo sistema. Tente usar o ditado do próprio teclado.");
      // We don't return here, we try anyway, but the warning is important.
    }

    const windowObj = window as unknown as IWindow;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz nativo.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert("Acesso ao microfone negado. Verifique as permissões do seu navegador.");
        } else if (event.error === 'no-speech') {
          // Silent fail or small toast
        } else {
          alert(`Erro no microfone: ${event.error}`);
        }
      };

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      alert("Erro ao iniciar microfone.");
      setIsListening(false);
    }
  };

  const handleReset = useCallback(() => {
    // Stop any audio
    window.speechSynthesis.cancel();

    // Reset visual state
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: FIGHT_ARCADE_WELCOME_TEXT,
      timestamp: new Date(),
    }]);
    setInput('');
    setError(null);
    setIsLoading(false);
    
    // Reset AI session context
    chatSessionRef.current = createChatSession();
  }, []);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // ADMIN COMMAND CHECK
    if (trimmedInput.toLowerCase() === '/admin') {
      onEnableAdmin();
      setMessages(prev => [...prev, 
        {
          id: Date.now().toString(),
          role: 'user',
          text: trimmedInput,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "🔓 **Modo Admin Ativado**\nO menu de Lógica Estrutural (JSON) agora está visível na barra lateral.",
          timestamp: new Date(),
        }
      ]);
      setInput('');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const currentChat = chatSessionRef.current;
      const streamResult = await sendMessageStream(currentChat, userMsg.text);

      const botMsgId = (Date.now() + 1).toString();
      
      // Initialize bot message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date(),
      }]);

      let fullText = '';

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || '';
        fullText += textChunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      }
      
    } catch (err) {
      console.error(err);
      setError("Failed to generate response. Please check your API key or connection.");
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sinto muito, ocorreu um erro ao processar sua solicitação.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onEnableAdmin]);

  const renderMessageContent = (text: string) => {
    const localVideoMarker = "[VIDEO_LOCAL]";
    const canvaUrlSub = "canva.com/design";
    const videoManualUrl = "https://www.fightarcade.com.br/videomanual";
    
    const canvaMatch = text.match(/https:\/\/www\.canva\.com\/design\/[^\s]+/);
    const canvaUrlFull = canvaMatch ? canvaMatch[0] : null;

    const hasLocalVideo = text.includes(localVideoMarker);
    const hasManualLink = text.includes(videoManualUrl);
    const hasCanva = !!canvaUrlFull;
    
    let displayText = text;
    if (hasLocalVideo) {
      displayText = displayText.replace(localVideoMarker, '').trim();
    }
    if (hasCanva && canvaUrlFull) {
       displayText = displayText.replace(canvaUrlFull, '').trim();
    }
    if (hasManualLink) {
       displayText = displayText.replace(videoManualUrl, '').trim();
    }

    // 2. Split text to handle Markdown links [Label](URL) and raw URLs
    const parts = displayText.split(/(\[.*?\]\(.*?\)|https?:\/\/[^\s]+)/g);

    return (
      <div className="flex flex-col gap-2">
        
        {/* MEDIA CARDS ROW */}
        <div className="flex flex-wrap gap-4 mb-2">
            {hasLocalVideo && (
              <div className="w-full max-w-md rounded-xl overflow-hidden shadow-lg border border-slate-700 bg-black relative group">
                <video 
                  controls 
                  playsInline
                  preload="metadata"
                  controlsList="nodownload" 
                  className="w-full aspect-video bg-black"
                  title="Manual em Vídeo - Fight Arcade"
                >
                  {/* FIX: Use relative path './manual.mp4' instead of absolute '/manual.mp4' */}
                  <source src="./manual.mp4" type="video/mp4" />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                      Seu navegador não suporta a reprodução.
                  </div>
                </video>
                <div className="p-3 bg-gradient-to-t from-slate-900 to-slate-800 border-t border-slate-700">
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-red-500" />
                    Manual em Vídeo
                    </p>
                    <p className="text-slate-400 text-xs pl-6">Fight Arcade (Arquivo Local)</p>
                </div>
              </div>
            )}

            {/* BACKUP LINK CARD */}
            {hasManualLink && (
               <a 
                 href={videoManualUrl}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex flex-col justify-center w-full sm:w-48 bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-slate-700 rounded-xl p-4 transition-all no-underline shadow-md group"
               >
                  <div className="flex items-center gap-2 mb-2">
                     <ExternalLink className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                     <span className="text-indigo-200 font-bold text-sm">Link Reserva</span>
                  </div>
                  <p className="text-slate-400 text-xs">Se o vídeo acima não carregar, assista online aqui.</p>
               </a>
            )}

            {hasCanva && canvaUrlFull && (
                <a 
                href={canvaUrlFull}
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full sm:w-64 group overflow-hidden rounded-xl border border-indigo-500/30 bg-indigo-950/20 relative aspect-video shadow-lg hover:shadow-purple-500/20 transition-all no-underline"
                >
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-pink-600 group-hover:from-purple-500 group-hover:to-pink-500 rounded-full flex items-center justify-center shadow-xl transition-transform transform group-hover:scale-110">
                        <Palette className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-900 to-slate-950 opacity-80 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-indigo-950/90 to-transparent">
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                    <Palette className="w-4 h-4 text-pink-400" />
                    Catálogo de Estampas
                    </p>
                    <p className="text-indigo-300 text-xs pl-6">Ver opções online</p>
                </div>
                </a>
            )}
        </div>

        <div className="whitespace-pre-wrap">
          {parts.map((part, index) => {
             // Match Markdown Link [text](url)
             const mdMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
             if (mdMatch) {
                return (
                  <a key={index} href={mdMatch[2]} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold underline decoration-emerald-500/30 hover:decoration-emerald-500/100 transition-all break-words">
                    {mdMatch[1]}
                  </a>
                );
             }
             // Match Raw URL
             if (part.match(/^https?:\/\//)) {
                 if (!part.trim()) return null; // skip empty
                 return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline break-all">
                      {part}
                    </a>
                 );
             }
             return <span key={index}>{part}</span>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Arcade Master AI</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-emerald-400 font-medium">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg transition-colors border ${
              isAudioEnabled 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isAudioEnabled ? "Desativar leitura de voz" : "Ativar leitura de voz"}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-sm font-medium border border-slate-700"
            title="Voltar ao início da conversa"
          >
             <RotateCcw className="w-4 h-4" />
             <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-300" /> : <Bot className="w-5 h-5 text-white" />}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl shadow-md ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-slate-100 rounded-tr-sm border border-slate-700' 
                  : msg.isError 
                    ? 'bg-red-900/20 border border-red-800 text-red-200 rounded-tl-sm'
                    : 'bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 text-slate-100 rounded-tl-sm'
              }`}>
                <div className="text-sm leading-relaxed font-light">
                  {msg.text ? renderMessageContent(msg.text) : <span className="animate-pulse">...</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-900/50 border-t border-red-800 flex items-center gap-2 text-red-200 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        
        {/* Persistent "Menu" Instruction */}
        <div className="mb-2 flex justify-center">
             <span className="text-[10px] uppercase tracking-widest text-indigo-400 bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-500/20">
                Digite <span className="font-bold text-indigo-300">"MENU"</span> a qualquer momento para voltar ao início
             </span>
        </div>

        <div className="relative max-w-4xl mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isListening ? "Ouvindo..." : "Digite sua mensagem..."}
            className={`flex-1 bg-slate-800 text-white placeholder-slate-500 border rounded-xl pl-4 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[56px] max-h-32 scrollbar-hide ${
                isListening ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'
            }`}
            rows={1}
            disabled={isLoading}
          />
          
          {/* Mic Button */}
          <button
            onClick={handleMicClick}
            disabled={isLoading}
            className={`p-3 rounded-lg transition-all flex-shrink-0 ${
                isListening 
                 ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                 : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
            title="Falar mensagem"
          >
             {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors text-white flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="text-center mt-2 text-xs text-slate-600">
          Fight Arcade AI. Verifique informações importantes.
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;