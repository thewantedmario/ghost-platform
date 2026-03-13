'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, FileJson, FileCode, AlertCircle, ArrowRightLeft } from 'lucide-react';

const JsonToYamlConverter = () => {
  const [jsonInput, setJsonInput] = useState('{\n  "project": "Modern UI Tool",\n  "version": "1.0.0",\n  "features": [\n    "Fast",\n    "Secure",\n    "Elegant"\n  ],\n  "author": {\n    "name": "Design Studio",\n    "role": "Developer"\n  }\n}');
  const [yamlOutput, setYamlOutput] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Simplified robust YAML stringifier to keep component dependency-free
  const stringifyYaml = useCallback((obj, indent = 0) => {
    const spaces = '  '.repeat(indent);
    if (obj === null) return 'null';
    if (typeof obj !== 'object') {
      if (typeof obj === 'string') return obj.includes('\n') ? `|-\n${obj.split('\n').map(line => '  ' + spaces + line).join('\n')}` : obj;
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => {
        const value = stringifyYaml(item, indent + 1);
        const formattedValue = typeof item === 'object' && item !== null ? `\n${value}` : ` ${value}`;
        return `${spaces}-${formattedValue}`;
      }).join('\n');
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return keys.map(key => {
      const value = obj[key];
      const formattedValue = typeof value === 'object' && value !== null 
        ? `\n${stringifyYaml(value, indent + 1)}` 
        : ` ${stringifyYaml(value, indent + 1)}`;
      return `${spaces}${key}:${formattedValue}`;
    }).join('\n');
  }, []);

  useEffect(() => {
    if (!jsonInput.trim()) {
      setYamlOutput('');
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const yaml = stringifyYaml(parsed);
      setYamlOutput(yaml);
      setError(null);
    } catch (err) {
      setError(err.message);
      setYamlOutput('');
    }
  }, [jsonInput, stringifyYaml]);

  const handleCopy = async () => {
    if (!yamlOutput) return;
    await navigator.clipboard.writeText(yamlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setJsonInput('');
    setYamlOutput('');
    setError(null);
  };

  const handleSample = () => {
    setJsonInput(JSON.stringify({
      name: "Config",
      enabled: true,
      data: [10, 20, 30],
      meta: { type: "system" }
    }, null, 2));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              JSON to YAML
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Professional grade data transformation tool.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSample}
              className="px-4 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
            >
              Load Sample
            </button>
            <button 
              onClick={handleClear}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Clear all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Input Panel */}
          <div className="flex flex-col group relative">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <FileJson size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">JSON Input</span>
              </div>
              {error && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs animate-pulse">
                  <AlertCircle size={14} />
                  <span>Invalid JSON</span>
                </div>
              )}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent p-4 font-mono text-sm resize-none outline-none text-zinc-300 placeholder:text-zinc-700 custom-scrollbar"
                placeholder="Paste your JSON here..."
              />
            </div>
          </div>

          {/* Icon Separator for Desktop */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-2 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-500">
            <ArrowRightLeft size={20} />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col group relative">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <FileCode size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">YAML Output</span>
              </div>
              <button
                onClick={handleCopy}
                disabled={!yamlOutput}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  copied 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy to Clipboard
                  </>
                )}
              </button>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
              <pre className="w-full h-full p-4 font-mono text-sm overflow-auto text-indigo-300/90 custom-scrollbar">
                {yamlOutput || <span className="text-zinc-800 italic">YAML result will appear here...</span>}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium px-1">
          <div className="flex gap-4">
            <span>Encoding: UTF-8</span>
            <span>Input Size: {new Blob([jsonInput]).size} bytes</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <span>{error ? 'Parser Error' : 'System Ready'}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default JsonToYamlConverter;