'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, Code, Image as ImageIcon, Sparkles, Terminal } from 'lucide-react';

interface SVGConverterState {
  input: string;
  output: string;
  isBase64: boolean;
  isCopied: boolean;
  error: string | null;
}

export default function SVGToDataURI() {
  const [state, setState] = useState<SVGConverterState>({
    input: '',
    output: '',
    isBase64: false,
    isCopied: false,
    error: null,
  });

  const encodeSVG = useCallback((rawSvg: string, useBase64: boolean) => {
    try {
      if (!rawSvg.trim()) return '';

      // Basic validation
      if (!rawSvg.includes('<svg')) {
        throw new Error('Invalid SVG format');
      }

      const cleanedSvg = rawSvg
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (useBase64) {
        const base64 = btoa(unescape(encodeURIComponent(cleanedSvg)));
        return `data:image/svg+xml;base64,${base64}`;
      } else {
        const encoded = encodeURIComponent(cleanedSvg)
          .replace(/%20/g, ' ')
          .replace(/%3D/g, '=')
          .replace(/%3A/g, ':')
          .replace(/%2F/g, '/')
          .replace(/%22/g, "'");
        return `data:image/svg+xml,${encoded}`;
      }
    } catch (err) {
      throw new Error('Failed to process SVG. Please check your syntax.');
    }
  }, []);

  useEffect(() => {
    try {
      const result = encodeSVG(state.input, state.isBase64);
      setState(prev => ({ ...prev, output: result, error: null }));
    } catch (err: any) {
      setState(prev => ({ ...prev, output: '', error: err.message }));
    }
  }, [state.input, state.isBase64, encodeSVG]);

  const handleCopy = async () => {
    if (!state.output) return;
    await navigator.clipboard.writeText(state.output);
    setState(prev => ({ ...prev, isCopied: true }));
    setTimeout(() => setState(prev => ({ ...prev, isCopied: false })), 2000);
  };

  const clearInput = () => {
    setState(prev => ({ ...prev, input: '', output: '', error: null }));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 selection:bg-indigo-500/30 font-sans antialiased p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wider uppercase">
            <Sparkles size={14} />
            Developer Utilities
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            SVG to <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Data URI</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg">
            Convert your raw SVG code into highly optimized data URIs for CSS, HTML, or JavaScript. 
            Clean, fast, and secure processing.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Code size={18} className="text-indigo-400" />
                <span>Source SVG</span>
              </div>
              <button
                onClick={clearInput}
                className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                title="Clear input"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-xl blur-[1px] group-focus-within:from-indigo-500 transition-all" />
              <textarea
                value={state.input}
                onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
                placeholder="Paste your <svg> code here..."
                className="relative w-full h-[400px] bg-zinc-900 rounded-xl p-4 font-mono text-sm text-zinc-300 outline-none resize-none placeholder:text-zinc-600 border border-zinc-800/50"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Terminal size={18} className="text-cyan-400" />
                <span>Data URI Result</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">Base64</span>
                  <div 
                    onClick={() => setState(prev => ({ ...prev, isBase64: !prev.isBase64 }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${state.isBase64 ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${state.isBase64 ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-xl blur-[1px] group-focus-within:from-cyan-500 transition-all" />
              <div className="relative w-full h-[400px] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/50 flex flex-col">
                <div className="flex-1 p-4 font-mono text-sm text-cyan-200/80 break-all overflow-y-auto">
                  {state.error ? (
                    <span className="text-red-400/80 italic">{state.error}</span>
                  ) : (
                    state.output || <span className="text-zinc-700 italic">Result will appear here...</span>
                  )}
                </div>
                
                {state.output && (
                  <div className="p-3 bg-zinc-950/50 border-t border-zinc-800/50 flex justify-between items-center">
                    <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest px-2">
                      {state.output.length} characters
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        state.isCopied 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
                      }`}
                    >
                      {state.isCopied ? (
                        <><Check size={16} /> Copied</>
                      ) : (
                        <><Copy size={16} /> Copy URI</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {state.output && !state.error && (
          <section className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold mb-4">
              <ImageIcon size={18} className="text-emerald-400" />
              <span>Live Preview</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
              <img 
                src={state.output} 
                alt="SVG Preview" 
                className="max-w-full max-h-[300px] relative z-10 drop-shadow-2xl"
              />
              <div className="mt-6 text-zinc-500 text-xs font-mono bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                Rendered via Data URI
              </div>
            </div>
          </section>
        )}

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
          <p>© 2024 SVG Data URI Tool • Professional Grade</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-300 cursor-default transition-colors">UTF-8 Optimized</span>
            <span className="hover:text-zinc-300 cursor-default transition-colors">No Data Tracking</span>
            <span className="hover:text-zinc-300 cursor-default transition-colors">Fast Encoding</span>
          </div>
        </footer>
      </div>
    </div>
  );
}