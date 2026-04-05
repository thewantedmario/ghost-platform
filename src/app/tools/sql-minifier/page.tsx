'use client';

"use client";

import React, { useState, useCallback, useRef } from 'react';
import { 
  Copy, 
  Trash2, 
  Zap, 
  Check, 
  AlertCircle, 
  FileCode, 
  Terminal,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface SQLMinifierState {
  input: string;
  output: string;
  isCopying: boolean;
  error: string | null;
  stats: {
    originalSize: number;
    minifiedSize: number;
    reduction: string;
  };
}

export default function SQLMinifier() {
  const [state, setState] = useState<SQLMinifierState>({
    input: '',
    output: '',
    isCopying: false,
    error: null,
    stats: {
      originalSize: 0,
      minifiedSize: 0,
      reduction: '0'
    }
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const minifySQL = (sql: string): string => {
    if (!sql.trim()) return '';

    return sql
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      // Remove single-line comments (starting with -- or #)
      .replace(/(--|#).*?(\n|$)/g, ' ')
      // Replace newlines and tabs with spaces
      .replace(/[\n\r\t]+/g, ' ')
      // Collapse multiple spaces into one
      .replace(/\s{2,}/g, ' ')
      // Remove spaces around special characters (comma, parens, operators)
      .replace(/\s?([,()=<>!+*/-])\s?/g, '$1')
      .trim();
  };

  const handleProcess = useCallback(() => {
    try {
      const minified = minifySQL(state.input);
      const originalSize = new Blob([state.input]).size;
      const minifiedSize = new Blob([minified]).size;
      const reduction = originalSize > 0 
        ? (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1) 
        : '0';

      setState(prev => ({
        ...prev,
        output: minified,
        error: null,
        stats: {
          originalSize,
          minifiedSize,
          reduction
        }
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "Failed to process SQL. Please check your syntax." }));
    }
  }, [state.input]);

  const handleCopy = async () => {
    if (!state.output) return;
    try {
      await navigator.clipboard.writeText(state.output);
      setState(prev => ({ ...prev, isCopying: true }));
      setTimeout(() => setState(prev => ({ ...prev, isCopying: false })), 2000);
    } catch (err) {
      setState(prev => ({ ...prev, error: "Failed to copy to clipboard" }));
    }
  };

  const handleClear = () => {
    setState({
      input: '',
      output: '',
      isCopying: false,
      error: null,
      stats: { originalSize: 0, minifiedSize: 0, reduction: '0' }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SQL Minifier <span className="text-indigo-500 font-mono text-sm ml-2 px-2 py-1 bg-indigo-500/10 rounded border border-indigo-500/20">v1.0</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Compress your SQL queries for optimal transmission and storage. 
            Removes comments, white spaces, and newlines without breaking logic.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <FileCode className="w-4 h-4 text-indigo-400" />
                Raw SQL Input
              </label>
              <button 
                onClick={handleClear}
                className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
            <div className="relative group h-[400px]">
              <textarea
                ref={textAreaRef}
                value={state.input}
                onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
                placeholder="Paste your SQL here... e.g. SELECT * FROM users WHERE status = 'active';"
                className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all resize-none placeholder:text-slate-700"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none" />
            </div>
            <button
              onClick={handleProcess}
              disabled={!state.input}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
            >
              <Zap className="w-5 h-5 fill-current" />
              Minify SQL
            </button>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Minimize2 className="w-4 h-4 text-emerald-400" />
                Minified Output
              </label>
              <div className="flex items-center gap-4">
                {state.stats.originalSize > 0 && (
                   <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    -{state.stats.reduction}% Saved
                   </span>
                )}
                <button 
                  onClick={handleCopy}
                  disabled={!state.output}
                  className={`text-xs flex items-center gap-1.5 transition-colors ${state.isCopying ? 'text-emerald-400' : 'text-indigo-400 hover:text-indigo-300 disabled:text-slate-600'}`}
                >
                  {state.isCopying ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {state.isCopying ? 'Copied!' : 'Copy Results'}
                </button>
              </div>
            </div>
            <div className="relative h-[400px]">
              <textarea
                readOnly
                value={state.output}
                placeholder="Your minified code will appear here..."
                className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 font-mono text-sm text-emerald-400/90 focus:outline-none transition-all resize-none placeholder:text-slate-700"
              />
              {!state.output && !state.error && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center space-y-2">
                    <Maximize2 className="w-8 h-8 text-slate-800 mx-auto" />
                    <p className="text-slate-700 text-xs">Ready for input</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-3 gap-4 h-[72px]">
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Original</span>
                <span className="text-sm font-mono text-slate-300">{state.stats.originalSize} B</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Minified</span>
                <span className="text-sm font-mono text-emerald-400">{state.stats.minifiedSize} B</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Efficiency</span>
                <span className="text-sm font-mono text-indigo-400">{state.stats.reduction}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {state.error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {state.error}
          </div>
        )}

        {/* Footer info */}
        <footer className="mt-12 pt-8 border-t border-slate-900 text-center">
          <p className="text-slate-600 text-xs font-mono">
            Secure processing • No data leaves your browser • MIT Licensed
          </p>
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #020617;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}