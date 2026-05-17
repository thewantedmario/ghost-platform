'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, Image as ImageIcon, Code, Zap, ExternalLink } from 'lucide-react';

interface ConversionOptions {
  useBase64: boolean;
  includeDimensions: boolean;
}

const SVGToDataURI: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    useBase64: false,
    includeDimensions: true,
  });

  const convertToDataUri = useCallback((svgString: string, useBase64: boolean) => {
    try {
      if (!svgString.trim()) {
        setOutput('');
        setError(null);
        return;
      }

      // Basic validation
      if (!svgString.includes('<svg')) {
        setError('Invalid SVG format');
        return;
      }

      setError(null);
      let processedSvg = svgString.trim();

      if (useBase64) {
        const base64 = btoa(unescape(encodeURIComponent(processedSvg)));
        setOutput(`data:image/svg+xml;base64,${base64}`);
      } else {
        // Optimized URL encoding for SVGs
        const encoded = encodeURIComponent(processedSvg)
          .replace(/%20/g, ' ')
          .replace(/%3D/g, '=')
          .replace(/%3A/g, ':')
          .replace(/%2F/g, '/')
          .replace(/%22/g, "'");
        setOutput(`data:image/svg+xml,${encoded}`);
      }
    } catch (err) {
      setError('Failed to process SVG. Check your syntax.');
    }
  }, []);

  useEffect(() => {
    convertToDataUri(input, options.useBase64);
  }, [input, options.useBase64, convertToDataUri]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              SVG <span className="text-indigo-500">to</span> Data URI
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg">
            Convert your SVG vectors into high-performance, browser-ready Data URIs for CSS backgrounds or inline HTML.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Code className="w-4 h-4 text-indigo-400" />
                Raw SVG Code
              </label>
              <button 
                onClick={handleClear}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...'
                className="relative w-full h-[400px] bg-[#0c0c0e] border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                Data URI Result
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={options.useBase64}
                    onChange={(e) => setOptions({...options, useBase64: e.target.checked})}
                  />
                  <div className={`w-8 h-4 rounded-full transition-colors relative ${options.useBase64 ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-transform ${options.useBase64 ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Base64</span>
                </label>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <div className="relative">
                <textarea
                  readOnly
                  value={output}
                  placeholder="The encoded URI will appear here..."
                  className="w-full h-[400px] bg-[#0c0c0e] border border-white/10 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none text-emerald-400/90 placeholder:text-slate-700"
                />
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className={`absolute bottom-4 right-4 flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all active:scale-95 ${
                    copied 
                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:shadow-none'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy URI
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
                    <ImageIcon className="w-3 h-3" />
                    Visual Preview
                </div>
                {output ? (
                    <div className="relative z-10 p-8 bg-white/5 rounded-xl backdrop-blur-sm border border-white/5">
                        <img 
                            src={output} 
                            alt="SVG Preview" 
                            className="max-h-32 max-w-full object-contain"
                        />
                    </div>
                ) : (
                    <div className="text-slate-600 italic text-sm">Waiting for valid SVG input...</div>
                )}
            </div>

            <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
                    <Code className="w-3 h-3" />
                    CSS Usage Example
                </div>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-slate-400 overflow-x-auto border border-white/5">
                    <span className="text-purple-400">.element</span> {'{'} <br />
                    &nbsp;&nbsp;<span className="text-indigo-400">background-image</span>: <span className="text-amber-200">url("{output || '...'}")</span>;<br />
                    &nbsp;&nbsp;<span className="text-indigo-400">background-repeat</span>: no-repeat;<br />
                    {'}'}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tip: Use URL encoding (non-Base64) for smaller file sizes and better gzip compression. Base64 is useful for embedding in environments that don't support special characters.
                </p>
            </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SVGToDataURI;