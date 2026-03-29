'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, FileCode, Zap, ShieldCheck, Download } from 'lucide-react';

interface ConversionResult {
  uri: string;
  base64: string;
  css: string;
}

const SVGToDataURI: React.FC = () => {
  const [svgInput, setSvgInput] = useState<string>('');
  const [results, setResults] = useState<ConversionResult>({ uri: '', base64: '', css: '' });
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);

  const convertSvg = useCallback((input: string) => {
    if (!input.trim()) {
      setResults({ uri: '', base64: '', css: '' });
      setIsValid(true);
      return;
    }

    try {
      // Basic validation
      if (!input.includes('<svg')) {
        setIsValid(false);
        return;
      }
      setIsValid(true);

      const trimmedSvg = input.trim();
      
      // Data URI (Encoded UTF-8)
      const encoded = encodeURIComponent(trimmedSvg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
      const uri = `data:image/svg+xml,${encoded}`;

      // Base64
      const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(trimmedSvg)))}`;

      // CSS Background string
      const css = `background-image: url("${uri}");`;

      setResults({ uri, base64, css });
    } catch (error) {
      setIsValid(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      convertSvg(svgInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [svgInput, convertSvg]);

  const handleCopy = async (text: string, type: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const clearInput = () => {
    setSvgInput('');
    setResults({ uri: '', base64: '', css: '' });
  };

  const downloadFile = (content: string, fileName: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">Developer Utility</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            SVG to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Data URI</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            Convert your SVG code into optimized Data URIs for CSS and HTML. Fast, secure, and entirely client-side.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Input SVG Code
              </label>
              <button
                onClick={clearInput}
                className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl opacity-20 group-focus-within:opacity-40 transition duration-500 blur"></div>
              <textarea
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                placeholder="<svg ...> ... </svg>"
                className={`relative w-full h-[450px] bg-[#121216] border ${
                  isValid ? 'border-slate-800' : 'border-rose-500/50'
                } rounded-xl p-6 text-sm font-mono text-indigo-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none`}
              />
            </div>
            {!isValid && (
              <p className="text-rose-400 text-xs mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Invalid SVG format detected
              </p>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">Data URI (UTF-8)</h3>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-bold">Recommended</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                  <button
                    onClick={() => handleCopy(results.uri, 'uri')}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    title="Copy to clipboard"
                  >
                    {copiedType === 'uri' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  readOnly
                  value={results.uri}
                  placeholder="Output will appear here..."
                  className="w-full bg-[#121216] border border-slate-800 rounded-xl py-4 pl-4 pr-12 text-sm font-mono text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-300">Base64</h3>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    onClick={() => handleCopy(results.base64, 'base64')}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    {copiedType === 'base64' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  readOnly
                  value={results.base64}
                  placeholder="Output will appear here..."
                  className="w-full bg-[#121216] border border-slate-800 rounded-xl py-4 pl-4 pr-12 text-sm font-mono text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-300">CSS Background</h3>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    onClick={() => handleCopy(results.css, 'css')}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    {copiedType === 'css' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={results.css}
                  placeholder="Output will appear here..."
                  className="w-full h-32 bg-[#121216] border border-slate-800 rounded-xl p-4 pr-12 text-sm font-mono text-slate-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
               <button
                disabled={!results.uri}
                onClick={() => downloadFile(results.uri, 'image-uri.txt')}
                className="flex-1 bg-white hover:bg-slate-200 text-black font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download Text
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-20 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            Built for performance. No data leaves your browser.
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Optimized</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Privacy Focused</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SVGToDataURI;