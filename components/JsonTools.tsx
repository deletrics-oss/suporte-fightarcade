import React, { useState } from 'react';
import { Braces, Check, Copy, Trash2, FileJson, AlertCircle } from 'lucide-react';

const JsonTools: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const formatJson = () => {
    try {
      if (!input.trim()) {
        setOutput('');
        setStatus('idle');
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setStatus('success');
      setMessage('JSON Valid & Formatted');
    } catch (e) {
      setStatus('error');
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage('Invalid JSON');
      }
    }
  };

  const minifyJson = () => {
    try {
       if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setStatus('success');
      setMessage('JSON Minified');
    } catch (e) {
      setStatus('error');
      setMessage('Invalid JSON for Minification');
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setMessage('Copied to clipboard!');
      setTimeout(() => setMessage(status === 'success' ? 'Valid JSON' : ''), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center">
          <Braces className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Studio JSON</h2>
          <p className="text-slate-400 text-sm">Validador e formatador estruturado sem IA.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Input Column */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Input</label>
            <button 
              onClick={() => { setInput(''); setOutput(''); setStatus('idle'); }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Limpar
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cole seu JSON bagunçado aqui..."
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            spellCheck={false}
          />
        </div>

        {/* Actions (Mobile Only - rendered between columns visually on mobile via order usually, but here simple grid flow) */}
        <div className="lg:hidden flex gap-2">
             <button onClick={formatJson} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Format</button>
             <button onClick={minifyJson} className="flex-1 bg-slate-700 text-white py-2 rounded-lg">Minify</button>
        </div>

        {/* Output Column */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Output</label>
            <div className="flex items-center gap-2">
              {status === 'success' && <span className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3"/> Valid</span>}
              {status === 'error' && <span className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Error</span>}
              <button 
                onClick={copyToClipboard}
                disabled={!output}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                title="Copy Output"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className={`flex-1 bg-slate-950 border rounded-xl p-4 font-mono text-sm overflow-auto relative ${
            status === 'error' ? 'border-red-900/50' : status === 'success' ? 'border-emerald-900/50' : 'border-slate-800'
          }`}>
            {output ? (
               <pre className={status === 'error' ? 'text-red-400' : 'text-emerald-300'}>{output}</pre>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-50">
                <FileJson className="w-12 h-12 mb-2" />
                <span className="text-sm">Aguardando processamento</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions (Desktop) */}
      <div className="mt-6 pt-6 border-t border-slate-800 hidden lg:flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {message && <span className={`px-3 py-1 rounded-full ${status === 'error' ? 'bg-red-900/30 text-red-300' : 'bg-emerald-900/30 text-emerald-300'}`}>{message}</span>}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={minifyJson}
            className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all border border-slate-700 hover:border-slate-600"
          >
            Minificar
          </button>
          <button 
            onClick={formatJson}
            className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105"
          >
            Beautify / Validar
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonTools;