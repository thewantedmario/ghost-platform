'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ConversionState {
  json: string;
  yaml: string;
  error: string | null;
}

const JsonToYamlConverter: React.FC = () => {
  const [state, setState] = useState<ConversionState>({
    json: '{\n  "project": "Nexus Core",\n  "version": "1.0.0",\n  "active": true,\n  "metadata": {\n    "tags": ["typescript", "react", "premium"],\n    "author": "System-X"\n  }\n}',
    yaml: '',
    error: null,
  });

  const [isCopied, setIsCopied] = useState(false);

  const jsonToYaml = (obj: any, indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return 'null';
    if (typeof obj === 'string') return `"${obj}"`;
    if (typeof obj !== 'object') return String(obj);

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => `\n${spaces}- ${jsonToYaml(item, indent + 1)}`).join('');
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';

    return keys
      .map(key => {
        const value = obj[key];
        const formattedValue = typeof value === 'object' && value !== null 
          ? jsonToYaml(value, indent + 1)
          : ` ${jsonToYaml(value, indent + 1)}`;
        
        return `\n${spaces}${key}:${formattedValue}`;
      })
      .join('')
      .trim();
  };

  const convert = useCallback((input: string) => {
    if (!input.trim()) {
      setState(prev => ({ ...prev, yaml: '', error: null }));
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const result = jsonToYaml(parsed);
      setState(prev => ({ ...prev, yaml: result.trim(), error: null }));
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e.message }));
    }
  }, []);

  useEffect(() => {
    convert(state.json);
  }, [state.json, convert]);

  const handleCopy = async () => {
    if (!state.yaml) return;
    await navigator.clipboard.writeText(state.yaml);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setState({ json: '', yaml: '', error: null });
  };

  const handleSample = () => {
    const sample = {
      service: "api-gateway",
      replicas: 3,
      endpoints: ["/v1/auth", "/v1/user", "/v1/data"],
      config: {
        timeout: 5000,
        retries: {
          max: 5,
          delay: "100ms"
        }
      }
    };
    setState(prev => ({ ...prev, json: JSON.stringify(sample, null, 2) }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              JSON to YAML Converter
            </h1>
            <p className="text-slate-400 text-sm">Professional-grade data transformation tool.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSample}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700"
            >
              Load Sample
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700"
            >
              Clear
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Input Panel */}
          <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Input JSON</span>
              {state.error && (
                <span className="text-xs text-rose-400 font-medium animate-pulse">Invalid JSON Format</span>
              )}
            </div>
            <textarea
              value={state.json}
              onChange={(e) => setState(prev => ({ ...prev, json: e.target.value }))}
              placeholder="Paste your JSON here..."
              className="flex-1 w-full bg-transparent p-6 text-sm font-mono text-slate-300 outline-none resize-none placeholder:text-slate-700"
              spellCheck={false}
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden relative">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Output YAML</span>
              <button
                onClick={handleCopy}
                disabled={!state.yaml}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  isCopied 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isCopied ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy YAML
                  </>
                )}
              </button>
            </div>
            <div className="flex-1 relative overflow-auto">
              <pre className="p-6 text-sm font-mono text-slate-300 h-full">
                <code>{state.yaml || (state.error ? '' : '# Waiting for valid JSON input...')}</code>
              </pre>
              {state.error && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-8">
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 max-w-md w-full">
                    <div className="flex items-center gap-3 text-rose-400 mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold">Parsing Error</span>
                    </div>
                    <p className="text-xs font-mono text-rose-300/80 leading-relaxed break-words">
                      {state.error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer/Stats */}
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Real-time Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Safe Execution</span>
            </div>
          </div>
          <div className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
            v1.0.4 • Optimized for Next.js
          </div>
        </footer>
      </div>

      <style jsx global>{`
        textarea::-webkit-scrollbar, pre::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        textarea::-webkit-scrollbar-track, pre::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb, pre::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        textarea::-webkit-scrollbar-thumb:hover, pre::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default JsonToYamlConverter;