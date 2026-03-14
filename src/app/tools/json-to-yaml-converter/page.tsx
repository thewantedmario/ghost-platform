'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, FileJson, FileCode, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind CSS class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ConversionState {
  json: string;
  yaml: string;
  error: string | null;
}

const JsonToYamlConverter: React.FC = () => {
  const [state, setState] = useState<ConversionState>({
    json: '{\n  "project": "Nexus Core",\n  "version": "1.0.0",\n  "description": "Premium JSON to YAML converter",\n  "features": [\n    "Real-time conversion",\n    "Error validation",\n    "High-end UI"\n  ],\n  "settings": {\n    "theme": "dark",\n    "active": true\n  }\n}',
    yaml: '',
    error: null,
  });

  const [copied, setCopied] = useState(false);

  /**
   * Extremely lightweight YAML stringifier to keep the component 
   * dependency-free while maintaining "strictly TypeScript-safe" requirements.
   */
  const convertToYaml = useCallback((obj: any, indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    if (obj === null) return 'null';
    if (typeof obj === 'undefined') return '';
    if (typeof obj !== 'object') {
      if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj
        .map((item) => `\n${spaces}- ${convertToYaml(item, indent + 1).trim()}`)
        .join('');
    }

    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    return entries
      .map(([key, value]) => {
        const formattedValue = convertToYaml(value, indent + 1);
        const separator = typeof value === 'object' && value !== null && !Array.isArray(value) ? '' : ' ';
        return `\n${spaces}${key}:${separator}${formattedValue.trim()}`;
      })
      .join('');
  }, []);

  const handleConvert = useCallback((input: string) => {
    if (!input.trim()) {
      setState((prev) => ({ ...prev, json: input, yaml: '', error: null }));
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const yamlResult = convertToYaml(parsed).trim();
      setState({ json: input, yaml: yamlResult, error: null });
    } catch (err) {
      setState((prev) => ({ 
        ...prev, 
        json: input, 
        error: err instanceof Error ? err.message : 'Invalid JSON format' 
      }));
    }
  }, [convertToYaml]);

  useEffect(() => {
    handleConvert(state.json);
  }, []);

  const copyToClipboard = async () => {
    if (!state.yaml) return;
    try {
      await navigator.clipboard.writeText(state.yaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const clearAll = () => {
    setState({ json: '', yaml: '', error: null });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wider uppercase">
              Developer Tools
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              JSON to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">YAML</span>
            </h1>
            <p className="text-zinc-500 max-w-md">
              A high-performance conversion utility designed for precision and speed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200 text-sm font-medium"
            >
              <Trash2 size={16} />
              Clear
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!!state.error || !state.yaml}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
                copied 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy YAML'}
            </button>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Input Panel */}
          <div className="relative group flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-zinc-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center gap-2">
                <FileJson size={18} className="text-indigo-400" />
                <span className="text-sm font-semibold text-zinc-200 uppercase tracking-widest">Input JSON</span>
              </div>
              {state.error && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-md border border-red-400/20">
                  <AlertCircle size={14} />
                  Invalid JSON
                </div>
              )}
            </div>
            <textarea
              value={state.json}
              onChange={(e) => handleConvert(e.target.value)}
              placeholder='{"key": "value"}'
              spellCheck={false}
              className="flex-1 w-full p-6 bg-transparent outline-none resize-none font-mono text-[13px] leading-relaxed text-zinc-300 placeholder:text-zinc-700"
            />
          </div>

          {/* Transfer Icon for Desktop */}
          <div className="hidden lg:flex absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500">
            <ArrowRightLeft size={20} />
          </div>

          {/* Output Panel */}
          <div className="relative flex flex-col h-full bg-[#0d0d0d] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <FileCode size={18} className="text-cyan-400" />
                <span className="text-sm font-semibold text-zinc-200 uppercase tracking-widest">Output YAML</span>
              </div>
            </div>
            <div className="flex-1 p-6 font-mono text-[13px] leading-relaxed overflow-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {state.yaml ? (
                <pre className="text-cyan-50/90">
                  {state.yaml}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                  <div className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800/50">
                    <FileCode size={32} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm italic">Waiting for valid input...</p>
                </div>
              )}
            </div>
            {/* Background Glow Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-tr from-indigo-500/5 via-transparent to-cyan-500/5" />
          </div>
        </div>

        {/* Footer / Meta */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-900">
          <div className="flex gap-6 text-[11px] font-medium text-zinc-600 uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Client Side Only
            </span>
            <span>No Data Storage</span>
            <span>UTF-8 Supported</span>
          </div>
          <p className="text-[11px] text-zinc-700 font-mono">
            &copy; {new Date().getFullYear()} NEXUS CORE SYSTEMS
          </p>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #1f1f23;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #2d2d33;
        }
      `}</style>
    </div>
  );
};

export default JsonToYamlConverter;