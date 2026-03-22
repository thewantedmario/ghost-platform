'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Zap, Check, Database, ArrowRightLeft } from 'lucide-react';

interface SQLMinifierStats {
  originalSize: number;
  minifiedSize: number;
  reduction: string;
}

const SQLMinifier: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [stats, setStats] = useState<SQLMinifierStats | null>(null);

  const minifySQL = useCallback((sql: string): string => {
    if (!sql) return '';

    return sql
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      // Remove single-line comments (starting with -- or #)
      .replace(/(--|#).*$/gm, ' ')
      // Replace newlines and tabs with single spaces
      .replace(/[\r\n\t]+/g, ' ')
      // Replace multiple spaces with a single space
      .replace(/\s+/g, ' ')
      // Remove spaces around common SQL operators/delimiters
      .replace(/\s?([,()=<>!+*/|])\s?/g, '$1')
      .trim();
  }, []);

  useEffect(() => {
    if (input) {
      const minified = minifySQL(input);
      setOutput(minified);

      const originalSize = input.length;
      const minifiedSize = minified.length;
      const reduction = originalSize > 0 
        ? (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1) 
        : '0';

      setStats({ originalSize, minifiedSize, reduction });
    } else {
      setOutput('');
      setStats(null);
    }
  }, [input, minifySQL]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStats(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                SQL Minifier
              </h1>
            </div>
            <p className="text-zinc-400 text-sm">
              Compress your SQL queries by removing comments and unnecessary whitespace.
            </p>
          </div>

          {stats && (
            <div className="flex items-center gap-6 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Reduction</span>
                <span className="text-indigo-400 font-mono font-bold">{stats.reduction}%</span>
              </div>
              <div className="w-[1px] h-8 bg-zinc-800" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Original</span>
                <span className="text-zinc-300 font-mono">{stats.originalSize} B</span>
              </div>
              <div className="w-[1px] h-8 bg-zinc-800" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Minified</span>
                <span className="text-zinc-300 font-mono">{stats.minifiedSize} B</span>
              </div>
            </div>
          )}
        </header>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                Input SQL
              </label>
              <button
                onClick={handleClear}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your SQL here (e.g., SELECT * FROM users -- get all users...)"
                className="w-full h-[400px] bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 font-mono text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none placeholder:text-zinc-700"
              />
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-zinc-400">
                Minified Output
              </label>
              <button
                disabled={!output}
                onClick={handleCopy}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${isCopied 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed'}
                `}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Result
                  </>
                )}
              </button>
            </div>
            <div className="relative group">
              <div className="w-full h-[400px] bg-zinc-950 border border-zinc-800 rounded-2xl p-4 font-mono text-sm text-indigo-300/90 overflow-auto break-all selection:bg-indigo-500/30">
                {output || (
                  <span className="text-zinc-800 italic select-none">
                    Minified code will appear here...
                  </span>
                )}
              </div>
              <div className="absolute bottom-4 right-4 pointer-events-none opacity-10">
                <ArrowRightLeft className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="pt-8 border-t border-zinc-900 text-center">
          <p className="text-zinc-600 text-[11px] uppercase tracking-[0.2em]">
            Optimized for PostgreSQL, MySQL, and SQLite • 100% Client-side Processing
          </p>
        </footer>
      </div>

      <style jsx global>{`
        textarea::-webkit-scrollbar, 
        div::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-track, 
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb, 
        div::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        textarea::-webkit-scrollbar-thumb:hover, 
        div::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default SQLMinifier;