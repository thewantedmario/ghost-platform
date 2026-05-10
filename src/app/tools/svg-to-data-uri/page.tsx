'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, FileCode, Zap, Image as ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';

type ConversionMode = 'base64' | 'encodeURIComponent' | 'mini';

interface ConversionResult {
  dataUri: string;
  cssUrl: string;
  imgTag: string;
}

const SAMPLE_SVG = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="indigo" stroke-width="4" fill="purple" />
  <path d="M30 50 L70 50 M50 30 L50 70" stroke="white" stroke-width="4" stroke-linecap="round" />
</svg>`;

export default function SvgToDataUri() {
  const [svgInput, setSvgInput] = useState<string>('');
  const [mode, setMode] = useState<ConversionMode>('base64');
  const [results, setResults] = useState<ConversionResult>({ dataUri: '', cssUrl: '', imgTag: '' });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const encodeSvg = useCallback((svg: string, conversionMode: ConversionMode): string => {
    if (!svg.trim()) return '';
    
    // Clean up the SVG
    const cleaned = svg.replace(/>\s+</g, '><').trim();

    if (conversionMode === 'base64') {
      try {
        const base64 = btoa(unescape(encodeURIComponent(cleaned)));
        return `data:image/svg+xml;base64,${base64}`;
      } catch (e) {
        return 'Invalid SVG for Base64 conversion';
      }
    }

    if (conversionMode === 'mini') {
      // Optimized for CSS usage
      const encoded = cleaned
        .replace(/"/g, "'")
        .replace(/%/g, '%25')
        .replace(/#/g, '%23')
        .replace(/{/g, '%7B')
        .replace(/}/g, '%7D')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/\s+/g, ' ');
      return `data:image/svg+xml,${encoded}`;
    }

    // Default URI Encoding
    return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
  }, []);

  useEffect(() => {
    const dataUri = encodeSvg(svgInput, mode);
    setResults({
      dataUri,
      cssUrl: dataUri ? `background-image: url("${dataUri}");` : '',
      imgTag: dataUri ? `<img src="${dataUri}" alt="Converted SVG" />` : '',
    });
  }, [svgInput, mode, encodeSvg]);

  const copyToClipboard = async (text: string, key: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClear = () => {
    setSvgInput('');
  };

  const loadSample = () => {
    setSvgInput(SAMPLE_SVG);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 tracking-tight mb-3">
            SVG to Data URI
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-lg">
            Convert your SVG code into ultra-fast Data URIs for CSS and HTML.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                Input SVG Code
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={loadSample}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  Load Sample
                </button>
                <button 
                  onClick={handleClear}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <textarea
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                placeholder="Paste your SVG code here (e.g., <svg>...</svg>)"
                className="relative w-full h-[450px] bg-[#0f172a] border border-slate-800 rounded-2xl p-5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col gap-6">
            {/* Mode Selector */}
            <div className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-xl flex items-center gap-1">
              {[
                { id: 'base64', label: 'Base64' },
                { id: 'mini', label: 'Mini SVG (Optimized)' },
                { id: 'encodeURIComponent', label: 'URI Encoded' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id as ConversionMode)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    mode === opt.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Output Cards */}
            <div className="space-y-4">
              <OutputCard 
                title="Data URI" 
                value={results.dataUri} 
                onCopy={() => copyToClipboard(results.dataUri, 'uri')}
                isCopied={copiedKey === 'uri'}
              />
              <OutputCard 
                title="CSS Background" 
                value={results.cssUrl} 
                onCopy={() => copyToClipboard(results.cssUrl, 'css')}
                isCopied={copiedKey === 'css'}
              />
              <OutputCard 
                title="HTML Image Tag" 
                value={results.imgTag} 
                onCopy={() => copyToClipboard(results.imgTag, 'img')}
                isCopied={copiedKey === 'img'}
              />
            </div>

            {/* Preview Area */}
            <div className="flex-1 min-h-[140px] bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                <ImageIcon className="w-3 h-3" />
                Live Preview
              </div>
              {svgInput ? (
                <div 
                  className="max-w-full max-h-full transition-transform duration-500 hover:scale-110"
                  dangerouslySetInnerHTML={{ __html: svgInput }} 
                />
              ) : (
                <div className="text-slate-600 text-sm flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin-slow opacity-20" />
                  Waiting for input...
                </div>
              )}
              {/* Checkerboard Pattern for transparent SVGs */}
              <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'conic-gradient(#fff 90deg, transparent 90deg 180deg, #fff 180deg 270deg, transparent 270deg)', backgroundSize: '20px 20px' }} 
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> High Performance</span>
            <span className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Client-side Secure</span>
            <span className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Cross-browser Ready</span>
          </div>
          <p>© {new Date().getFullYear()} SVG Foundry. Professional Developer Tools.</p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

interface OutputCardProps {
  title: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
}

function OutputCard({ title, value, onCopy, isCopied }: OutputCardProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
        <button
          onClick={onCopy}
          disabled={!value}
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            isCopied 
              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' 
              : 'bg-white/5 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isCopied ? (
            <>
              <Check className="w-3 h-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="relative group">
        <div className="w-full bg-black/40 rounded-lg p-3 text-[13px] font-mono text-indigo-300/90 break-all line-clamp-2 min-h-[3.5rem] border border-white/5">
          {value || <span className="text-slate-700 italic">Empty output...</span>}
        </div>
      </div>
    </div>
  );
}