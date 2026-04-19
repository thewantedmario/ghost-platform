'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, Image as ImageIcon, Code, Zap, Download, RefreshCcw } from 'lucide-react';

type EncodingFormat = 'base64' | 'utf8';

interface ConversionResult {
  uri: string;
  size: number;
}

const SvgToDataUri: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<ConversionResult>({ uri: '', size: 0 });
  const [format, setFormat] = useState<EncodingFormat>('base64');
  const [copied, setCopied] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);

  const convertToDataUri = useCallback((svgString: string, encoding: EncodingFormat): string => {
    if (!svgString.trim()) return '';
    
    // Basic cleanup
    const cleanedSvg = svgString
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (encoding === 'base64') {
      try {
        const base64 = btoa(unescape(encodeURIComponent(cleanedSvg)));
        return `data:image/svg+xml;base64,${base64}`;
      } catch (e) {
        return '';
      }
    } else {
      // URL Encoding (often smaller for SVGs)
      const encoded = encodeURIComponent(cleanedSvg)
        .replace(/%20/g, ' ')
        .replace(/%3D/g, '=')
        .replace(/%3A/g, ':')
        .replace(/%2F/g, '/')
        .replace(/%22/g, "'");
      return `data:image/svg+xml;utf8,${encoded}`;
    }
  }, []);

  useEffect(() => {
    const result = convertToDataUri(input, format);
    setOutput({
      uri: result,
      size: new Blob([result]).size
    });

    if (input && !input.trim().startsWith('<svg')) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [input, format, convertToDataUri]);

  const handleCopy = async () => {
    if (!output.uri) return;
    try {
      await navigator.clipboard.writeText(output.uri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const downloadFile = () => {
    if (!output.uri) return;
    const link = document.createElement('a');
    link.href = output.uri;
    link.download = 'icon.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              SVG to <span className="text-indigo-400">Data URI</span>
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Convert your SVG code into optimized Data URIs for CSS background-images or HTML img tags. 
            Clean, fast, and secure.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Code className="w-4 h-4" />
                SVG Source Code
              </label>
              <button 
                onClick={() => setInput('')}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...'
                className="relative w-full h-[400px] bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-sm text-indigo-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
            {!isValid && input && (
              <p className="text-rose-400 text-xs flex items-center gap-1">
                ⚠️ Input might not be a valid SVG string
              </p>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setFormat('base64')}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                    format === 'base64' 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Base64
                </button>
                <button
                  onClick={() => setFormat('utf8')}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                    format === 'utf8' 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  UTF-8 / URL Encoded
                </button>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Size: {formatSize(output.size)}
              </span>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
              <div className="relative flex flex-col h-[400px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex-1 p-4 overflow-auto font-mono text-xs break-all text-slate-400">
                  {output.uri || <span className="text-slate-700 italic">Result will appear here...</span>}
                </div>
                
                {/* Preview Overlay */}
                {output.uri && (
                  <div className="h-32 border-t border-slate-800 bg-slate-950/50 p-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                      <ImageIcon className="w-3 h-3" /> Preview
                    </div>
                    <img 
                      src={output.uri} 
                      alt="Preview" 
                      className="max-h-full max-w-full object-contain drop-shadow-2xl"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={handleCopy}
                    disabled={!output.uri}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
                      copied 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {copied ? (
                      <><Check className="w-4 h-4" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy to Clipboard</>
                    )}
                  </button>
                  <button
                    onClick={downloadFile}
                    disabled={!output.uri}
                    title="Download SVG"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all disabled:opacity-50"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-indigo-400" />
              Real-time Processing
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Conversion happens instantly in your browser. No data is sent to any server, keeping your assets private.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Optimization
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Extra whitespace and newlines are stripped automatically to ensure the smallest possible Data URI payload.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              Format Selection
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose UTF-8 for better readability and potentially smaller sizes, or Base64 for maximum compatibility.
            </p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default SvgToDataUri;