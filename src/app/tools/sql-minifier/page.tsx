'use client';

import React, { useState, useCallback } from 'react';

/**
 * SQL Minifier - A high-end, professional React component
 * built with Tailwind CSS and TypeScript.
 */

interface SqlMinifierProps {
  className?: string;
}

const SQLMinifier: React.FC<SqlMinifierProps> = ({ className = "" }) => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [stats, setStats] = useState<{ original: number; minified: number; reduction: string }>({
    original: 0,
    minified: 0,
    reduction: '0'
  });

  const minifySQL = (sql: string): string => {
    if (!sql) return '';
    
    return sql
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      // Remove single-line comments (-- or #)
      .replace(/(--|#).*$/gm, ' ')
      // Replace newlines and tabs with spaces
      .replace(/[\r\n\t]+/g, ' ')
      // Collapse multiple spaces into one
      .replace(/\s+/g, ' ')
      // Remove spaces around common operators and punctuation
      .replace(/\s*([,()=<>!+*/;])\s*/g, '$1')
      .trim();
  };

  const handleProcess = useCallback(() => {
    const minified = minifySQL(input);
    setOutput(minified);
    
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([minified]).size;
    const reduction = originalSize > 0 
      ? (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1)
      : '0';

    setStats({
      original: originalSize,
      minified: minifiedSize,
      reduction
    });
  }, [input]);

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
    setStats({ original: 0, minified: 0, reduction: '0' });
  };

  return (
    <div className={`min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-8 font-sans ${className}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              SQL Minifier
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-md">
              Optimize your database queries by removing comments and unnecessary whitespace for production environments.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleProcess}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95"
            >
              Minify SQL
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Original Size', value: `${stats.original} B` },
            { label: 'Minified Size', value: `${stats.minified} B` },
            { label: 'Reduction', value: `${stats.reduction}%`, highlight: true },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <span className={`text-xl font-mono ${stat.highlight ? 'text-indigo-400' : 'text-slate-200'}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Main Editor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Input SQL
              </label>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your SQL here (SELECT * FROM...)"
                className="relative w-full h-[450px] bg-[#0d0d0f] border border-white/10 rounded-xl p-6 text-indigo-100/80 font-mono text-sm leading-relaxed focus:outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Minified Output
              </label>
              <button
                disabled={!output}
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  isCopied 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {isCopied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy SQL
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl pointer-events-none"></div>
              <textarea
                readOnly
                value={output}
                placeholder="Minified code will appear here..."
                className="relative w-full h-[450px] bg-[#0d0d0f]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-emerald-400/90 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="text-center pt-4">
          <p className="text-slate-600 text-xs flex items-center justify-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
            </svg>
            This tool processes data locally in your browser. No SQL data is sent to any server.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SQLMinifier;