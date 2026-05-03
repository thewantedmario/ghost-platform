'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, Image as ImageIcon, Code, ExternalLink, Zap, Download } from 'lucide-react';

interface ConversionResult {
  base64: string;
  encoded: string;
  css: string;
  markdown: string;
}

const SVGToDataURI: React.FC = () => {
  const [svgInput, setSvgInput] = useState<string>('');
  const [results, setResults] = useState<ConversionResult>({
    base64: '',
    encoded: '',
    css: '',
    markdown: '',
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);

  const convertSvg = useCallback((input: string) => {
    if (!input.trim()) {
      setResults({ base64: '', encoded: '', css: '', markdown: '' });
      setIsValid(true);
      return;
    }

    try {
      // Basic validation: must contain <svg
      if (!input.toLowerCase().includes('<svg')) {
        setIsValid(false);
        return;
      }

      setIsValid(true);
      const cleanSvg = input.trim();
      
      // Base64 logic
      const base64Str = btoa(unescape(encodeURIComponent(cleanSvg)));
      const base64Uri = `data:image/svg+xml;base64,${base64Str}`;

      // URL Encoded logic (Optimized for CSS)
      const encodedSvg = encodeURIComponent(cleanSvg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
      const encodedUri = `data:image/svg+xml,${encodedSvg}`;

      setResults({
        base64: base64Uri,
        encoded: encodedUri,
        css: `background-image: url("${encodedUri}");`,
        markdown: `![SVG](${encodedUri})`,
      });
    } catch (error) {
      setIsValid(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      convertSvg(svgInput);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [svgInput, convertSvg]);

  const copyToClipboard = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const clearInput = () => {
    setSvgInput('');
    setResults({ base64: '', encoded: '', css: '', markdown: '' });
  };

  const downloadUri = () => {
    if (!results.base64) return;
    const link = document.createElement('a');
    link.href = results.base64;
    link.download = 'icon.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const OutputField = ({ label, value, id }: { label: string; value: string; id: string }) => (
    <div className="group relative flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</label>
        <button
          onClick={() => copyToClipboard(value, id)}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          {copiedKey === id ? (
            <>
              <Check size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <textarea
          readOnly
          value={value}
          className="h-20 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 font-mono text-sm text-zinc-300 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
          placeholder="Output will appear here..."
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-200 selection:bg-indigo-500/30 sm:p-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-tighter text-indigo-500">Utility Engine</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              SVG to <span className="text-indigo-500 font-extrabold italic">Data URI</span>
            </h1>
            <p className="mt-3 max-w-md text-zinc-400">
              Transform raw SVG vectors into production-ready Data URIs and CSS background codes instantly.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={clearInput}
              className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-medium transition-all hover:bg-zinc-800 hover:text-red-400"
            >
              <Trash2 size={16} /> Clear
            </button>
            <button
              disabled={!results.base64}
              onClick={downloadUri}
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 disabled:opacity-50"
            >
              <Download size={16} /> Download
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Input & Preview */}
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Code size={14} /> Paste SVG Source
                </label>
                {!isValid && (
                  <span className="text-xs font-bold text-red-500 animate-pulse">Invalid SVG Format</span>
                )}
              </div>
              <textarea
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                placeholder='<svg width="100" height="100">...</svg>'
                className={`h-80 w-full resize-none rounded-2xl border bg-zinc-900/30 p-5 font-mono text-sm transition-all focus:outline-none focus:ring-2 ${
                  !isValid ? 'border-red-500/50 focus:ring-red-500/20' : 'border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20'
                }`}
              />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6">
              <label className="mb-4 block text-xs font-medium uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <ImageIcon size={14} /> Live Preview
              </label>
              <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 transition-all group overflow-hidden">
                {svgInput && isValid ? (
                  <div 
                    className="max-h-full max-w-full p-4 transition-transform group-hover:scale-110"
                    dangerouslySetInnerHTML={{ __html: svgInput }} 
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon size={32} className="mx-auto mb-2 text-zinc-700" />
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">Awaiting valid input</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Outputs */}
          <div className="flex flex-col space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/10 p-2 sm:p-6 backdrop-blur-sm">
             <div className="flex items-center gap-2 px-2 pb-2">
               <ExternalLink size={18} className="text-indigo-500" />
               <h2 className="text-lg font-semibold text-white">Generated Formats</h2>
             </div>
             
             <div className="space-y-5">
                <OutputField label="Data URI (Base64)" value={results.base64} id="base64" />
                <OutputField label="Data URI (URL Encoded)" value={results.encoded} id="encoded" />
                <OutputField label="CSS Background Image" value={results.css} id="css" />
                <OutputField label="Markdown" value={results.markdown} id="markdown" />
             </div>

             <div className="mt-4 rounded-xl bg-indigo-500/5 p-4 border border-indigo-500/10">
               <p className="text-xs leading-relaxed text-zinc-500">
                 <strong className="text-zinc-300">Pro Tip:</strong> URL Encoded URIs are generally more performant and smaller than Base64 for SVGs when used in CSS files as they compress better.
               </p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-900 pt-8 text-center">
          <p className="text-xs text-zinc-600">
            Secure, client-side only processing. No data is sent to any server.
          </p>
        </footer>
      </div>
      
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #09090b;
        }
        ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default SVGToDataURI;