'use client';

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Zap, Check, Database, Sparkles, AlertCircle } from 'lucide-react';

interface SQLMinifierState {
  raw: string;
  minified: string;
  isCopied: boolean;
  error: string | null;
}

const SQLMinifier: React.FC = () => {
  const [state, setState] = useState<SQLMinifierState>({
    raw: '',
    minified: '',
    isCopied: false,
    error: null,
  });

  const minifySQL = (sql: string): string => {
    if (!sql.trim()) return '';

    return sql
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      // Remove single-line comments (starting with --)
      .replace(/--.*$/gm, ' ')
      // Replace newlines and tabs with spaces
      .replace(/\r?\n|\r|\t/g, ' ')
      // Collapse multiple spaces into one
      .replace(/\s{2,}/g, ' ')
      // Remove spaces around common SQL operators and punctuation
      .replace(/\s*([,;()=<>!+*/])\s*/g, '$1')
      .trim();
  };

  const handleMinify = useCallback(() => {
    try {
      const result = minifySQL(state.raw);
      setState(prev => ({ ...prev, minified: result, error: null }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Failed to process SQL. Please check your syntax.' }));
    }
  }, [state.raw]);

  const handleCopy = async () => {
    if (!state.minified) return;
    await navigator.clipboard.writeText(state.minified);
    setState(prev => ({ ...prev, isCopied: true }));
    setTimeout(() => setState(prev => ({ ...prev, isCopied: false })), 2000);
  };

  const handleClear = () => {
    setState({ raw: '', minified: '', isCopied: false, error: null });
  };

  const stats = {
    originalSize: new Blob([state.raw]).size,
    minifiedSize: new Blob([state.minified]).size,
  };

  const reduction = stats.originalSize > 0 
    ? Math.round(((stats.originalSize - stats.minifiedSize) / stats.originalSize) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
            <Database className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 tracking-tight mb-4">
            SQL Minifier
          </h1>
          <p className="text-zinc-400 max-w-lg text-lg leading-relaxed">
            Compress your SQL queries for production. Remove comments, whitespace, and optimize for performance.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                Input Query
                <span className="text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded border border-zinc-700">Raw SQL</span>
              </label>
              <button 
                onClick={handleClear}
                className="text-zinc-500 hover:text-red-400 transition-colors duration-200 p-1"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <textarea
                value={state.raw}
                onChange={(e) => setState(prev => ({ ...prev, raw: e.target.value }))}
                placeholder="Paste your SQL here... e.g. SELECT * FROM users WHERE active = 1;"
                className="relative w-full h-[400px] bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-sm font-mono focus:outline-none focus:ring-0 resize-none transition-all placeholder:text-zinc-600 text-indigo-100"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                Minified Output
                <span className="text-[10px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">Optimized</span>
              </label>
              <div className="flex items-center gap-4">
                {state.minified && (
                  <span className="text-[11px] font-medium text-emerald-400 animate-pulse">
                    {reduction}% saved
                  </span>
                )}
                <button 
                  onClick={handleCopy}
                  disabled={!state.minified}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-zinc-700"
                >
                  {state.isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {state.isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur opacity-10 transition duration-500"></div>
              <textarea
                readOnly
                value={state.minified}
                placeholder="Minified code will appear here..."
                className="relative w-full h-[400px] bg-[#0c0c0e] border border-zinc-800 rounded-xl p-6 text-sm font-mono focus:outline-none resize-none transition-all placeholder:text-zinc-700 text-emerald-400/90"
              />
              {!state.minified && !state.error && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Sparkles className="w-12 h-12 text-zinc-800 opacity-20" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {state.error}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleMinify}
            disabled={!state.raw}
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="relative flex items-center gap-2">
              <Zap className="w-5 h-5 fill-current" />
              Minify SQL Query
            </span>
          </button>
        </div>

        {/* Stats Footer */}
        <footer className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-800 pt-8">
          {[
            { label: 'Original Size', value: `${stats.originalSize} bytes` },
            { label: 'Compressed Size', value: `${stats.minifiedSize} bytes` },
            { label: 'Efficiency', value: `${reduction}%` },
            { label: 'Status', value: state.minified ? 'Ready' : 'Idle' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{stat.label}</span>
              <span className="text-sm font-mono text-zinc-300">{stat.value}</span>
            </div>
          ))}
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #09090b;
        }
        ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default SQLMinifier;