'use client';

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Trash2, Zap, Check, Terminal, Database, Sparkles } from 'lucide-react';

interface SQLMinifierProps {
  className?: string;
}

const SQLMinifier: React.FC<SQLMinifierProps> = ({ className = "" }) => {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [stats, setStats] = useState<{ original: number; minified: number; savings: number }>({
    original: 0,
    minified: 0,
    savings: 0,
  });

  const minifySQL = (sql: string): string => {
    if (!sql) return "";

    let minified = sql
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      // Remove single-line comments (starting with -- or #)
      .replace(/(--|#).*?(\n|$)/g, " ")
      // Replace newlines and tabs with spaces
      .replace(/[\r\n\t]+/g, " ")
      // Collapse multiple spaces
      .replace(/\s+/g, " ")
      // Remove spaces around commas and operators for tighter minification
      .replace(/\s*([,;()=<>!+*/-])\s*/g, "$1")
      // Final trim
      .trim();

    return minified;
  };

  const handleProcess = useCallback(() => {
    const result = minifySQL(input);
    setOutput(result);

    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([result]).size;
    const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

    setStats({
      original: originalSize,
      minified: minifiedSize,
      savings: Math.max(0, Math.round(savings)),
    });
  }, [input]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setStats({ original: 0, minified: 0, savings: 0 });
  };

  useEffect(() => {
    if (input.length > 0) {
      handleProcess();
    } else {
      setOutput("");
      setStats({ original: 0, minified: 0, savings: 0 });
    }
  }, [input, handleProcess]);

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-8 bg-slate-950 text-slate-200 selection:bg-indigo-500/30 ${className}`}>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/10 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Database className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">SQL Minifier</h1>
            <p className="text-slate-400 text-sm">Compress your queries for production efficiency.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 ${
              isCopied 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {isCopied ? "Copied!" : "Copy Minified"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex flex-col h-[500px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Input SQL
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {input.length} characters
              </span>
            </div>
            <textarea
              className="flex-1 w-full p-4 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-0 placeholder:text-slate-700"
              placeholder="SELECT * FROM users WHERE status = 'active' -- Get active users..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Area */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex flex-col h-[500px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Minified Output
              </span>
              {stats.savings > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Reduced by {stats.savings}%
                </span>
              )}
            </div>
            <textarea
              readOnly
              className="flex-1 w-full p-4 bg-transparent text-indigo-200 font-mono text-sm resize-none focus:outline-none focus:ring-0 placeholder:text-slate-700"
              placeholder="SELECT*FROM users WHERE status='active'"
              value={output}
            />
            {output && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex gap-4">
                    <span>Original: <b className="text-slate-300">{stats.original} B</b></span>
                    <span>Minified: <b className="text-indigo-400">{stats.minified} B</b></span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Optimized</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features/Footer */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Strip Comments", desc: "Removes -- and /* */ comments automatically." },
          { title: "Whitespace Removal", desc: "Collapses redundant spaces and newlines." },
          { title: "Operator Packing", desc: "Trims spaces around arithmetic and logic symbols." }
        ].map((feat, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-300 mb-1">{feat.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SQLMinifier;