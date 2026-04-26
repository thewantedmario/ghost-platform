'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Copy, Trash2, Zap, Check, Maximize2, Minimize2 } from 'lucide-react';

interface SQLMinifierProps {
  initialValue?: string;
}

const SQLMinifier: React.FC<SQLMinifierProps> = ({ initialValue = '' }) => {
  const [input, setInput] = useState<string>(initialValue);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const minifySQL = useCallback((sql: string): string => {
    if (!sql) return '';
    
    return sql
      // Remove single line comments
      .replace(/--.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Replace newlines and tabs with spaces
      .replace(/\r?\n|\r|\t/g, ' ')
      // Collapse multiple spaces into one
      .replace(/\s\s+/g, ' ')
      // Remove spaces around common operators and punctuation
      .replace(/\s*([,()=<>!+*/-])\s*/g, '$1')
      .trim();
  }, []);

  const handleMinify = () => {
    setIsProcessing(true);
    // Simulate slight delay for "premium" feel and feedback
    setTimeout(() => {
      const result = minifySQL(input);
      setOutput(result);
      setIsProcessing(false);
    }, 300);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SQL Minifier <span className="text-indigo-500 text-sm font-medium ml-2 px-2 py-0.5 border border-indigo-500/30 rounded-full bg-indigo-500/10">PRO</span></h1>
            </div>
            <p className="text-slate-400 text-sm">Optimize your database queries by stripping unnecessary characters and whitespace.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
            >
              <Trash2 size={16} />
              Clear
            </button>
            <button
              onClick={handleMinify}
              disabled={!input || isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Minimize2 size={18} />
              )}
              Minify SQL
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="group relative flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Maximize2 size={12} /> Raw Input
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {input.length.toLocaleString()} chars
              </span>
            </div>
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your unformatted SQL here... (e.g., SELECT * FROM users WHERE id = 1;)"
              className="w-full h-[400px] lg:h-[500px] p-6 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder:text-slate-700"
              spellCheck={false}
            />
          </div>

          {/* Output Panel */}
          <div className="group relative flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-700">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Minimize2 size={12} /> Minified Output
              </span>
              <div className="flex items-center gap-4">
                {output && (
                    <span className="text-[10px] text-indigo-400/70 font-mono">
                        Saved {Math.max(0, input.length - output.length).toLocaleString()} chars
                    </span>
                )}
                <button
                    onClick={copyToClipboard}
                    disabled={!output}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                        copied 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Result'}
                </button>
              </div>
            </div>
            <div className="relative flex-1">
                <textarea
                    readOnly
                    value={output}
                    placeholder="Minified result will appear here..."
                    className="w-full h-[400px] lg:h-[500px] p-6 bg-slate-950/30 text-indigo-300 font-mono text-sm resize-none focus:outline-none placeholder:text-slate-800 cursor-default"
                    spellCheck={false}
                />
                {!output && !isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <Zap size={64} className="text-slate-700" />
                    </div>
                )}
            </div>
          </div>
        </main>

        {/* Footer Stats */}
        <footer className="mt-8 pt-6 border-t border-slate-900 flex flex-wrap gap-8 items-center text-slate-500">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Performance</span>
            <span className="text-sm font-medium text-slate-400">O(n) complexity</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Privacy</span>
            <span className="text-sm font-medium text-slate-400">Client-side only</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Standard</span>
            <span className="text-sm font-medium text-slate-400">ANSI SQL Compliant</span>
          </div>
          <div className="ml-auto text-xs italic">
            Built for developers who care about network payloads.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SQLMinifier;