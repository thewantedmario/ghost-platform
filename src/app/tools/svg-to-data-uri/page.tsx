'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Trash2, Check, Code2, Eye, Zap, FileJson, ArrowRightLeft } from 'lucide-react';

type EncodingType = 'base64' | 'uri';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => (
  <div className="group relative flex items-center">
    {children}
    <span className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-slate-800 text-white text-xs py-1 px-2 rounded border border-slate-700 shadow-xl">
      {text}
    </span>
  </div>
);

const SAMPLE_SVG = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="url(#paint0_linear)" stroke-width="8" stroke-linecap="round"/>
  <defs>
    <linearGradient id="paint0_linear" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
      <stop stop-color="#8B5CF6"/>
      <stop offset="1" stop-color="#EC4899"/>
    </linearGradient>
  </defs>
</svg>`;

const SvgToDataUri: React.FC = () => {
  const [input, setInput] = useState<string>(SAMPLE_SVG);
  const [output, setOutput] = useState<string>('');
  const [encoding, setEncoding] = useState<EncodingType>('uri');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const convertToDataUri = useCallback((svg: string, type: EncodingType) => {
    try {
      if (!svg.trim()) return '';
      
      const cleanedSvg = svg.trim().replace(/>\s+</g, '><');
      
      if (type === 'base64') {
        const base64 = btoa(unescape(encodeURIComponent(cleanedSvg)));
        return `data:image/svg+xml;base64,${base64}`;
      } else {
        // Optimizing for URL encoding
        const encoded = encodeURIComponent(cleanedSvg)
          .replace(/%20/g, ' ')
          .replace(/%3D/g, '=')
          .replace(/%3A/g, ':')
          .replace(/%2F/g, '/')
          .replace(/%22/g, "'");
        return `data:image/svg+xml,${encoded}`;
      }
    } catch (err) {
      setError('Invalid SVG syntax or encoding error');
      return '';
    }
  }, []);

  useEffect(() => {
    setError(null);
    setOutput(convertToDataUri(input, encoding));
  }, [input, encoding, convertToDataUri]);

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

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <ArrowRightLeft className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">SVG to Data URI</h1>
            </div>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">
              Convert raw SVG code into production-ready Data URIs for CSS, HTML, or JavaScript.
              Optimized for performance and compatibility.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setEncoding('uri')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  encoding === 'uri' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                URL Encoded
              </button>
              <button
                onClick={() => setEncoding('base64')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  encoding === 'base64' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Base64
              </button>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Section */}
          <div className="flex flex-col h-[500px] bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Input SVG</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setInput(SAMPLE_SVG)}
                  className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
                  title="Load Sample"
                >
                  <Zap className="w-4 h-4" />
                </button>
                <button 
                  onClick={clearAll}
                  className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors text-slate-400 hover:text-red-400"
                  title="Clear"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your SVG code here..."
              className="flex-1 w-full bg-transparent p-4 text-sm font-mono focus:outline-none resize-none text-indigo-300 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
              spellCheck={false}
            />
          </div>

          {/* Output Section */}
          <div className="flex flex-col h-[500px] gap-6">
            <div className="flex-1 flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Data URI Output</span>
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    copied 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy URI'}
                </button>
              </div>
              <div className="relative flex-1 group/output">
                <textarea
                  readOnly
                  value={output}
                  className="w-full h-full bg-transparent p-4 text-sm font-mono focus:outline-none resize-none text-emerald-300/90 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                />
                {!output && !error && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600 pointer-events-none italic">
                    Waiting for input...
                  </div>
                )}
                {error && (
                  <div className="absolute inset-x-0 top-0 p-4 bg-red-500/10 text-red-400 text-xs font-medium">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Card */}
            <div className="h-32 flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/80">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Preview</span>
              </div>
              <div className="flex-1 flex items-center justify-center bg-white/5 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
                {output && !error ? (
                  <img src={output} alt="Preview" className="max-h-20 max-w-full object-contain drop-shadow-2xl" />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-700" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer/Usage Tips */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-900">
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              CSS Usage
            </h3>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed overflow-x-auto whitespace-pre">
              {`.icon {\n  background-image: url("${output.substring(0, 30)}...");\n}`}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              HTML Usage
            </h3>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed overflow-x-auto whitespace-pre">
              {`<img src="${output.substring(0, 30)}..." />`}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              Base64 vs URI
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              URI encoding is typically 5-10% smaller and better for simple SVGs. 
              Base64 is safer for older browsers and complex assets with non-ASCII characters.
            </p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default SvgToDataUri;