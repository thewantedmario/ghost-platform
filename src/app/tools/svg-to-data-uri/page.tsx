'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, FileCode, ExternalLink, Image as ImageIcon, Zap, Trash2 } from 'lucide-react';

interface ConversionResult {
  uri: string;
  css: string;
}

const SVGToDataURI: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<ConversionResult>({ uri: '', css: '' });
  const [copiedType, setCopiedType] = useState<'uri' | 'css' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const encodeSVG = useCallback((svgString: string): ConversionResult => {
    try {
      if (!svgString.trim()) return { uri: '', css: '' };
      
      // Clean up the SVG
      let cleaned = svgString
        .replace(/<style.*?<\/style>/g, '') // Remove internal styles if problematic
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();

      if (!cleaned.includes('xmlns')) {
        cleaned = cleaned.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // We use URL encoding instead of Base64 as it's typically smaller for SVGs
      // and better for CSS performance.
      const encoded = cleaned
        .replace(/"/g, "'")
        .replace(/%/g, '%25')
        .replace(/#/g, '%23')
        .replace(/{/g, '%7B')
        .replace(/}/g, '%7D')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E');

      const uri = `data:image/svg+xml,${encoded}`;
      const css = `background-image: url("${uri}");`;
      
      setError(null);
      return { uri, css };
    } catch (err) {
      setError('Invalid SVG format. Please check your syntax.');
      return { uri: '', css: '' };
    }
  }, []);

  useEffect(() => {
    const result = encodeSVG(input);
    setOutput(result);
  }, [input, encodeSVG]);

  const copyToClipboard = async (text: string, type: 'uri' | 'css') => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const clearInput = () => {
    setInput('');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            <Zap size={14} />
            <span>Developer Utility</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            SVG to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Data URI</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Convert your vector graphics into optimized, browser-ready Data URIs and CSS snippets. Premium, fast, and secure.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
                <FileCode size={18} className="text-indigo-400" />
                <span>Source SVG</span>
              </label>
              <button 
                onClick={clearInput}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='<svg width="100" height="100">...</svg>'
                className="relative w-full h-[400px] bg-slate-900 border border-slate-800 rounded-xl p-6 text-sm font-mono focus:outline-none focus:ring-0 resize-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {/* Preview Box */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
                <ImageIcon size={18} className="text-cyan-400" />
                <span>Live Preview</span>
              </label>
              <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                {output.uri ? (
                  <img src={output.uri} alt="Preview" className="max-h-24 max-w-[80%] object-contain drop-shadow-2xl" />
                ) : (
                  <span className="text-slate-600 text-sm italic">Waiting for input...</span>
                )}
              </div>
            </div>

            {/* URI Result */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Data URI</span>
                <button
                  disabled={!output.uri}
                  onClick={() => copyToClipboard(output.uri, 'uri')}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-white"
                >
                  {copiedType === 'uri' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedType === 'uri' ? 'Copied!' : 'Copy URI'}</span>
                </button>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 font-mono text-xs break-all max-h-24 overflow-y-auto text-slate-400 scrollbar-hide">
                {output.uri || 'Result will appear here...'}
              </div>
            </div>

            {/* CSS Result */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CSS Usage</span>
                <button
                  disabled={!output.css}
                  onClick={() => copyToClipboard(output.css, 'css')}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-white"
                >
                  {copiedType === 'css' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedType === 'css' ? 'Copied!' : 'Copy CSS'}</span>
                </button>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 font-mono text-xs break-all max-h-24 overflow-y-auto text-slate-400 scrollbar-hide">
                {output.css || 'Result will appear here...'}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Local Processing
            </div>
            <span>No data ever leaves your browser.</span>
          </div>
          <div className="flex items-center space-x-4">
             <a href="#" className="text-slate-400 hover:text-white transition-colors">
               <ExternalLink size={18} />
             </a>
          </div>
        </footer>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default SVGToDataURI;