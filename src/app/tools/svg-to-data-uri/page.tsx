'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, FileCode, Eye, Zap, Info } from 'lucide-react';

type EncodingType = 'utf8' | 'base64';

interface ConversionOptions {
  encoding: EncodingType;
  useUrlFunction: boolean;
}

const SvgToDataUri: React.FC = () => {
  const [svgInput, setSvgInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [options, setOptions] = useState<ConversionOptions>({
    encoding: 'utf8',
    useUrlFunction: true,
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const convertSvgToDataUri = useCallback((input: string, opts: ConversionOptions) => {
    if (!input.trim()) {
      setError(null);
      return '';
    }

    try {
      // Basic validation: must contain <svg
      if (!input.toLowerCase().includes('<svg')) {
        throw new Error('Invalid SVG: Missing <svg> tag');
      }

      // Clean up the SVG (remove extra whitespace/newlines)
      const cleanedSvg = input
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .trim();

      let result = '';
      if (opts.encoding === 'base64') {
        const base64 = btoa(unescape(encodeURIComponent(cleanedSvg)));
        result = `data:image/svg+xml;base64,${base64}`;
      } else {
        // UTF-8 / URL Encoded
        const encoded = encodeURIComponent(cleanedSvg)
          .replace(/'/g, '%27')
          .replace(/"/g, '%22');
        result = `data:image/svg+xml;charset=utf-8,${encoded}`;
      }

      setError(null);
      return opts.useUrlFunction ? `url("${result}")` : result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert SVG');
      return '';
    }
  }, []);

  useEffect(() => {
    setOutput(convertSvgToDataUri(svgInput, options));
  }, [svgInput, options, convertSvgToDataUri]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const clearInput = () => {
    setSvgInput('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                SVG to Data URI
              </h1>
            </div>
            <p className="text-slate-400 text-sm">Convert your vector graphics into CSS-ready data strings instantly.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/50 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => setOptions({ ...options, encoding: 'utf8' })}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                options.encoding === 'utf8' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              UTF-8 (Smaller)
            </button>
            <button
              onClick={() => setOptions({ ...options, encoding: 'base64' })}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                options.encoding === 'base64' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Base64
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <FileCode className="w-4 h-4 text-indigo-400" />
                Paste SVG Code
              </label>
              <button 
                onClick={clearInput}
                className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <textarea
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                placeholder="<svg ...> ... </svg>"
                className="relative w-full h-[400px] bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-sm font-mono text-indigo-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              />
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Eye className="w-4 h-4 text-purple-400" />
                Result & Preview
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={options.useUrlFunction}
                    onChange={(e) => setOptions({ ...options, useUrlFunction: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/50"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Wrap in url()</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col h-[400px] gap-4">
              {/* Output String */}
              <div className="relative group flex-1">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    disabled={!output}
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      copied 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                        : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy String'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={output}
                  placeholder="Output will appear here..."
                  className="w-full h-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 pt-14 text-sm font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Live Preview */}
              <div className="h-32 bg-slate-900/40 border border-slate-800/50 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-2 left-3 text-[10px] uppercase tracking-widest text-slate-600 font-bold">Preview</div>
                {output && !error ? (
                  <div 
                    className="w-20 h-20 bg-contain bg-center bg-no-repeat transition-transform group-hover:scale-110 duration-500"
                    style={{ backgroundImage: options.useUrlFunction ? output : `url("${output}")` }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <Info className="w-5 h-5 opacity-20" />
                    <span className="text-xs font-medium">Visual preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Error Messaging */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
            <p className="text-red-400 text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </p>
          </div>
        )}

        {/* Footer/Info Card */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800/60">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Why use UTF-8?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              UTF-8 encoding is typically 30% smaller than Base64 for SVGs and remains human-readable. Perfect for CSS-in-JS.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Ready for CSS</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the result directly in <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded">background-image</code> or <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded">mask-image</code> properties.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Privacy First</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Processing is done entirely in your browser. Your SVG data never leaves your machine.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SvgToDataUri;