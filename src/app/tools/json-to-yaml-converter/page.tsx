'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, FileJson, AlertCircle, ArrowRightLeft, FileCode } from 'lucide-react';

interface ConversionState {
  json: string;
  yaml: string;
  error: string | null;
}

/**
 * Utility to convert an object to a YAML string.
 * Handled internally to avoid external dependency requirements while remaining robust.
 */
const stringifyToYaml = (obj: any, indent: number = 0): string => {
  const spaces = '  '.repeat(indent);
  
  if (obj === null) return 'null';
  if (typeof obj === 'string') return obj.includes('\n') ? `|-\n${obj.split('\n').map(line => spaces + '  ' + line).join('\n')}` : obj;
  if (typeof obj !== 'object') return String(obj);
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => `\n${spaces}- ${stringifyToYaml(item, indent + 1).trim()}`).join('');
  }
  
  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  
  return keys.map(key => {
    const value = obj[key];
    const formattedValue = stringifyToYaml(value, indent + 1);
    const separator = (typeof value === 'object' && value !== null && Object.keys(value).length > 0) || Array.isArray(value) ? '' : ' ';
    return `\n${spaces}${key}:${separator}${formattedValue.trim()}`;
  }).join('').trim();
};

const JsonToYamlConverter: React.FC = () => {
  const [state, setState] = useState<ConversionState>({
    json: '{\n  "project": "Nexus Converter",\n  "version": "1.0.0",\n  "features": [\n    "Real-time conversion",\n    "TypeScript Safe",\n    "High Performance"\n  ],\n  "config": {\n    "debug": true,\n    "theme": "dark"\n  }\n}',
    yaml: '',
    error: null,
  });

  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback((input: string) => {
    if (!input.trim()) {
      setState(prev => ({ ...prev, json: input, yaml: '', error: null }));
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const yamlResult = stringifyToYaml(parsed);
      setState({
        json: input,
        yaml: yamlResult,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        json: input,
        error: (err as Error).message,
      }));
    }
  }, []);

  useEffect(() => {
    handleConvert(state.json);
  }, []);

  const copyToClipboard = async () => {
    if (!state.yaml) return;
    await navigator.clipboard.writeText(state.yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setState({ json: '', yaml: '', error: null });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              JSON to YAML
            </h1>
            <p className="text-zinc-500 text-sm">Professional grade schema transformation tool.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all border border-zinc-800"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!!state.error || !state.yaml}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy YAML
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Input Panel */}
          <div className="flex flex-col rounded-xl border border-zinc-800 bg-[#0c0c0e] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Input JSON</span>
              </div>
              {state.error && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  Invalid JSON
                </div>
              )}
            </div>
            <textarea
              spellCheck={false}
              value={state.json}
              onChange={(e) => handleConvert(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent text-zinc-300 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
              placeholder='{ "key": "value" }'
            />
          </div>

          {/* Divider Arrow (Desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-zinc-900 border border-zinc-700 p-2 rounded-full shadow-xl">
              <ArrowRightLeft className="w-5 h-5 text-zinc-500" />
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col rounded-xl border border-zinc-800 bg-[#0c0c0e] overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Output YAML</span>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <div className="flex-1 w-full p-4 overflow-auto font-mono text-sm">
              {state.error ? (
                <div className="text-zinc-600 italic">Waiting for valid JSON input...</div>
              ) : (
                <pre className="text-emerald-400/90 leading-relaxed whitespace-pre-wrap">
                  {state.yaml || '# YAML output will appear here'}
                </pre>
              )}
            </div>
            
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/20" />
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium px-2">
          <div className="flex items-center gap-4">
            <span>Encoding: UTF-8</span>
            <span>Status: Ready</span>
          </div>
          <div>© {new Date().getFullYear()} NEXUS DATA SYSTEMS</div>
        </div>
      </div>

      <style jsx global>{`
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default JsonToYamlConverter;