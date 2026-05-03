'use client';

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Trash2, Zap, Check, Database, Info } from 'lucide-react';

interface SQLStats {
  originalSize: number;
  minifiedSize: number;
  savings: number;
}

export default function SQLMinifier() {
  const [inputSql, setInputSql] = useState<string>('');
  const [minifiedSql, setMinifiedSql] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo((): SQLStats => {
    const originalSize = new Blob([inputSql]).size;
    const minifiedSize = new Blob([minifiedSql]).size;
    const savings = originalSize > 0 
      ? Math.max(0, ((originalSize - minifiedSize) / originalSize) * 100) 
      : 0;

    return { originalSize, minifiedSize, savings };
  }, [inputSql, minifiedSql]);

  const minifySQL = useCallback((sql: string): string => {
    if (!sql.trim()) return '';
    
    try {
      let processed = sql;

      // Remove multi-line comments
      processed = processed.replace(/\/\*[\s\S]*?\*\//g, ' ');
      
      // Remove single-line comments (-- or #)
      processed = processed.replace(/(--|#).*$/gm, ' ');
      
      // Replace newlines and tabs with spaces
      processed = processed.replace(/[\r\n\t]+/g, ' ');
      
      // Remove multiple spaces
      processed = processed.replace(/\s\s+/g, ' ');
      
      // Remove spaces around operators and punctuation
      // (,), ,, ;, =, <, >, +, -, *, /
      processed = processed.replace(/\s*([(),;=<>+\-*/])\s*/g, '$1');
      
      return processed.trim();
    } catch (err) {
      setError('An error occurred while minifying the SQL.');
      return sql;
    }
  }, []);

  const handleMinify = () => {
    setError(null);
    const result = minifySQL(inputSql);
    setMinifiedSql(result);
  };

  const handleCopy = async () => {
    if (!minifiedSql) return;
    try {
      await navigator.clipboard.writeText(minifiedSql);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClear = () => {
    setInputSql('');
    setMinifiedSql('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                <Database size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                SQL<span className="text-indigo-500">Minifier</span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              Compress your SQL queries by removing comments, newlines, and unnecessary whitespace.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <Trash2 size={16} />
              Clear
            </button>
            <button
              onClick={handleMinify}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
            >
              <Zap size={16} fill="currentColor" />
              Minify SQL
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Input SQL Query</label>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase tracking-tighter">Raw</span>
            </div>
            <div className="relative group flex-1 min-h-[400px]">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <textarea
                value={inputSql}
                onChange={(e) => setInputSql(e.target.value)}
                placeholder="-- Paste your SQL here...&#10;SELECT * FROM users WHERE active = 1;&#10;/* This is a comment */"
                className="relative w-full h-full bg-[#111114] border border-slate-800 rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Minified Result</label>
              <div className="flex items-center gap-2">
                {minifiedSql && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[11px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors border border-slate-700"
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Result</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="relative group flex-1 min-h-[400px]">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-2xl blur opacity-10 transition duration-500"></div>
              <textarea
                readOnly
                value={minifiedSql}
                placeholder="Minified output will appear here..."
                className="relative w-full h-full bg-[#0d0d0f] border border-slate-800 rounded-xl p-4 text-sm font-mono text-indigo-300 focus:outline-none transition-all resize-none placeholder:text-slate-800"
              />
            </div>
          </div>
        </main>

        {/* Footer Stats & Info */}
        <footer className="mt-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <Info size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111114] border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">Original Size</span>
              <span className="text-2xl font-semibold text-white">{stats.originalSize} <span className="text-sm font-normal text-slate-500">bytes</span></span>
            </div>
            <div className="bg-[#111114] border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">Minified Size</span>
              <span className="text-2xl font-semibold text-indigo-400">{stats.minifiedSize} <span className="text-sm font-normal text-slate-500">bytes</span></span>
            </div>
            <div className="bg-[#111114] border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 overflow-hidden relative">
              <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">Compression</span>
              <span className="text-2xl font-semibold text-emerald-400">
                {stats.savings.toFixed(1)}%
              </span>
              <div 
                className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-1000" 
                style={{ width: `${stats.savings}%` }}
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.8)]"></div>
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                <span>Client-side only</span>
              </div>
            </div>
            <p>© {new Date().getFullYear()} SQLMinifier Engine v1.0.2</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0c;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e1e24;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2d2d35;
        }
      `}</style>
    </div>
  );
}