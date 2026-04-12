'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Trash2, Zap, Check, Database, Maximize2, Minimize2 } from 'lucide-react';

interface SQLMinifierProps {
  initialValue?: string;
}

const SQLMinifier: React.FC<SQLMinifierProps> = ({ initialValue = '' }) => {
  const [input, setInput] = useState<string>(initialValue);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const minifySQL = (sql: string): string => {
    if (!sql) return '';
    
    return sql
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      // Remove single-line comments (standard SQL --)
      .replace(/--.*?\n/g, ' ')
      // Replace new lines and tabs with spaces
      .replace(/[\r\n\t]+/g, ' ')
      // Replace multiple spaces with a single space
      .replace(/\s\s+/g, ' ')
      // Remove spaces around commas and operators for maximum compression
      .replace(/\s*([,()=<>!+*/])\s*/g, '$1')
      .trim();
  };

  const handleMinify = useCallback(() => {
    setIsProcessing(true);
    // Artificial slight delay for "premium" feel UI feedback
    setTimeout(() => {
      const minified = minifySQL(input);
      setOutput(minified);
      setIsProcessing(false);
    }, 150);
  }, [input]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                SQL Minifier
              </h1>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              Professional-grade SQL compression tool. Remove comments, whitespace, and optimize your queries for production environments.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={handleMinify}
              disabled={!input || isProcessing}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-95"
            >
              <Zap className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : ''}`} />
              {isProcessing ? 'Processing...' : 'Minify SQL'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col h-[500px]">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-x border-t border-slate-800 rounded-t-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Maximize2 className="w-3 h-3" /> Raw Input
              </span>
              <span className="text-[10px] text-slate-600">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="-- Paste your raw SQL here...
SELECT * FROM users
WHERE active = true
ORDER BY created_at DESC;"
              className="flex-1 p-6 bg-slate-950 border border-slate-800 rounded-b-2xl outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col h-[500px]">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-x border-t border-slate-800 rounded-t-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Minimize2 className="w-3 h-3" /> Minified Output
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-600">
                   {output.length > 0 && `${Math.round((1 - output.length / (input.length || 1)) * 100)}% reduced`}
                </span>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      COPY
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="relative flex-1 group">
              <div
                className={`absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-b-2xl`}
              />
              <textarea
                readOnly
                value={output}
                placeholder="Result will appear here..."
                className="w-full h-full p-6 bg-slate-900/30 border border-slate-800 rounded-b-2xl outline-none transition-all resize-none font-mono text-sm leading-relaxed text-indigo-100/90 scrollbar-thin scrollbar-thumb-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Features / Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-900 pt-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <span className="text-indigo-400 text-xs font-bold">01</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Comment Stripping</h3>
              <p className="text-xs text-slate-500 leading-normal">Automatically removes multi-line /* */ and single-line -- comments for safety.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <span className="text-indigo-400 text-xs font-bold">02</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Space Optimization</h3>
              <p className="text-xs text-slate-500 leading-normal">Collapses all whitespace and line breaks into minimal footprints for lower payloads.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <span className="text-indigo-400 text-xs font-bold">03</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Client-Side Secure</h3>
              <p className="text-xs text-slate-500 leading-normal">Processing happens entirely in your browser. Your data never touches our servers.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
};

export default SQLMinifier;