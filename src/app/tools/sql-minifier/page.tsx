'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Trash2, Zap, Check, FileCode, ArrowRight, Database } from 'lucide-react';

interface SQLStats {
  originalSize: number;
  minifiedSize: number;
  reduction: string;
}

const SQLMinifier: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo<SQLStats>(() => {
    const originalSize = input.length;
    const minifiedSize = output.length;
    const reduction = originalSize > 0 
      ? (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1) 
      : '0';
    
    return { originalSize, minifiedSize, reduction };
  }, [input, output]);

  const minifySQL = useCallback(() => {
    if (!input.trim()) return;

    let minified = input
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove single-line comments (starting with --)
      .replace(/--.*?\n/g, ' ')
      .replace(/--.*?$/g, ' ')
      // Replace tabs and newlines with a single space
      .replace(/[\t\n\r]+/g, ' ')
      // Remove unnecessary spaces around operators and punctuation
      .replace(/\s*([,()=<>!+*/-])\s*/g, '$1')
      // Collapse multiple spaces into one
      .replace(/\s{2,}/g, ' ')
      .trim();

    setOutput(minified);
  }, [input]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
              <Database className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">SQL <span className="text-indigo-400">Minifier</span></h1>
              <p className="text-slate-400 text-sm">Professional grade SQL compression for optimized transmission and storage.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={minifySQL}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              Minify SQL
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Raw SQL Input
              </label>
              <span className="text-xs text-slate-500">{input.length} characters</span>
            </div>
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your SQL code here (SELECT * FROM table...)"
                className="relative w-full h-[450px] bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Minified Output
              </label>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  copied 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-5 group-focus-within:opacity-20 transition duration-500"></div>
              <textarea
                value={output}
                readOnly
                placeholder="Your minified SQL will appear here..."
                className="relative w-full h-[450px] bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm font-mono focus:outline-none resize-none transition-all placeholder:text-slate-600 text-indigo-300"
              />
            </div>
          </div>
        </main>

        {/* Stats Footer */}
        <footer className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Original Size</span>
            <div className="text-2xl font-semibold text-white">{stats.originalSize} <span className="text-slate-600 text-sm font-normal">bytes</span></div>
          </div>
          <div className="flex flex-col gap-1 border-slate-800 sm:border-x sm:px-8">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Minified Size</span>
            <div className="text-2xl font-semibold text-indigo-400">{stats.minifiedSize} <span className="text-slate-600 text-sm font-normal">bytes</span></div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Space Savings</span>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-semibold text-emerald-400">-{stats.reduction}%</div>
              {parseFloat(stats.reduction) > 0 && (
                <div className="p-1 bg-emerald-500/10 rounded">
                  <ArrowRight className="w-4 h-4 text-emerald-500 -rotate-45" />
                </div>
              )}
            </div>
          </div>
        </footer>

        {/* Bottom Decorative Element */}
        <div className="text-center">
            <p className="text-slate-600 text-xs">
              Secure & Privacy-Focused: No data leaves your browser. All minification happens locally.
            </p>
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
          background: #1e293b;
          border-radius: 10px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default SQLMinifier;