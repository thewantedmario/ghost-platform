'use client';

"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Copy, Trash2, Zap, Check, Share2, Database, Scissors } from 'lucide-react';

interface SQLMinifierProps {}

const SQLMinifier: React.FC<SQLMinifierProps> = () => {
  const [inputSql, setInputSql] = useState<string>('');
  const [outputSql, setOutputSql] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [stats, setStats] = useState<{ original: number; minified: number; reduction: string }>({
    original: 0,
    minified: 0,
    reduction: '0'
  });

  const minifySQL = (sql: string): string => {
    if (!sql) return '';
    
    let minified = sql
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      // Remove single-line comments (starting with --)
      .replace(/--.*$/gm, ' ')
      // Replace newlines and tabs with spaces
      .replace(/[\r\n\t]+/g, ' ')
      // Replace multiple spaces with a single space
      .replace(/\s\s+/g, ' ')
      // Remove spaces around commas
      .replace(/\s*,\s*/g, ',')
      // Remove spaces around operators and parentheses
      .replace(/\s*([=<>!+\-*/()])\s*/g, '$1')
      // Final trim
      .trim();

    return minified;
  };

  const handleProcess = useCallback(() => {
    const result = minifySQL(inputSql);
    setOutputSql(result);

    const originalSize = new Blob([inputSql]).size;
    const minifiedSize = new Blob([result]).size;
    const reduction = originalSize > 0 
      ? (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1) 
      : '0';

    setStats({
      original: originalSize,
      minified: minifiedSize,
      reduction
    });
  }, [inputSql]);

  const handleCopy = async () => {
    if (!outputSql) return;
    await navigator.clipboard.writeText(outputSql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setInputSql('');
    setOutputSql('');
    setStats({ original: 0, minified: 0, reduction: '0' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
              <Database className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                SQL Minifier
              </h1>
              <p className="text-slate-500 text-sm">Professional query optimization & compression tool</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm">
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Reduction</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{stats.reduction}%</span>
            </div>
            <button 
              onClick={handleProcess}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <Zap className="w-4 h-4 fill-current" />
              Minify SQL
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="group relative">
            <div className="absolute -inset-px bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl" />
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/50">
                <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Raw Input
                </span>
                <button 
                  onClick={handleClear}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Clear Input"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={inputSql}
                onChange={(e) => setInputSql(e.target.value)}
                placeholder="Paste your SQL here (e.g. SELECT * FROM users WHERE active = 1;)"
                className="flex-1 bg-transparent p-6 outline-none resize-none font-mono text-sm leading-relaxed text-indigo-300 placeholder:text-slate-700"
                spellCheck={false}
              />
              <div className="px-5 py-3 border-t border-slate-800 text-[10px] text-slate-600 uppercase tracking-widest">
                Size: {stats.original} bytes
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="group relative">
            <div className="absolute -inset-px bg-gradient-to-b from-indigo-500/30 to-purple-500/30 rounded-2xl" />
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/50">
                <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Scissors className="w-4 h-4" /> Minified Output
                </span>
                <button 
                  onClick={handleCopy}
                  disabled={!outputSql}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isCopied 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'COPIED' : 'COPY'}
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-slate-950/40">
                {outputSql ? (
                  <pre className="font-mono text-sm leading-relaxed text-slate-300 break-all whitespace-pre-wrap">
                    {outputSql}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                    <Zap className="w-12 h-12 opacity-20" />
                    <p className="text-sm">Processed output will appear here</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest">
                  Size: {stats.minified} bytes
                </span>
                <button className="text-slate-600 hover:text-slate-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features / Footer */}
        <footer className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Comment Removal
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Automatically strips multi-line (/* */) and single-line (--) SQL comments to reduce payload size.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Whitespace Optimization
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Collapses unnecessary spaces, tabs, and line breaks while maintaining query integrity.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Operator Tightening
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Compresses characters around operators and punctuation for maximum byte-saving.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SQLMinifier;