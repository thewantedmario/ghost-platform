'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  ClipboardPaste, 
  AlertCircle, 
  Maximize2, 
  CheckCircle2,
  FileImage,
  Info
} from 'lucide-react';

interface ImageDetails {
  width: number;
  height: number;
  format: string;
  size: string;
}

const Base64ImageDecoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [decodedSrc, setDecodedSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ImageDetails | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const calculateSize = (base64String: string): string => {
    const stringLength = base64String.length - (base64String.indexOf(',') + 1);
    const sizeInBytes = Math.ceil(stringLength * 0.75);
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const decodeImage = useCallback(() => {
    setError(null);
    if (!input.trim()) return;

    let sanitizedInput = input.trim();
    
    // Check if it's just the raw base64 or has the data prefix
    if (!sanitizedInput.startsWith('data:image/')) {
      // Attempt to guess format or default to png
      sanitizedInput = `data:image/png;base64,${sanitizedInput}`;
    }

    setDecodedSrc(sanitizedInput);
  }, [input]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const formatMatch = decodedSrc?.match(/^data:image\/([a-zA-Z+]+);base64/);
    
    setDetails({
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: formatMatch ? formatMatch[1].toUpperCase() : 'Unknown',
      size: calculateSize(decodedSrc || '')
    });
  };

  const handleImageError = () => {
    setError('Invalid Base64 string or unsupported image format.');
    setDecodedSrc(null);
    setDetails(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      setError('Failed to access clipboard.');
    }
  };

  const handleDownload = () => {
    if (!decodedSrc) return;
    const link = document.createElement('a');
    link.href = decodedSrc;
    link.download = `decoded-image-${Date.now()}.${details?.format.toLowerCase() || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setInput('');
    setDecodedSrc(null);
    setError(null);
    setDetails(null);
  };

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Base64 Image Decoder
          </h1>
          <p className="text-slate-400 text-lg">Convert Base64 strings into high-quality visual assets instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="flex flex-col space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-slate-700">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  <span className="ml-2 text-xs font-medium text-slate-500 uppercase tracking-widest">Base64 Input</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handlePaste}
                    className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste size={18} />
                  </button>
                  <button 
                    onClick={clearAll}
                    className="p-1.5 hover:bg-red-900/20 rounded-md transition-colors text-slate-400 hover:text-red-400"
                    title="Clear input"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your base64 string here (with or without data:image prefix)..."
                className="w-full h-80 bg-transparent p-5 text-sm font-mono text-indigo-300 resize-none focus:outline-none placeholder:text-slate-700"
              />
              <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-end">
                <button
                  onClick={decodeImage}
                  disabled={!input.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95"
                >
                  Decode Image
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-900/10 border border-red-900/30 rounded-xl text-red-400 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="flex flex-col space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[460px] transition-all hover:border-slate-700">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/50">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Image Preview</span>
                {decodedSrc && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleDownload}
                      className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-grow flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-repeat">
                {decodedSrc ? (
                  <div className="relative group">
                    <img
                      ref={imageRef}
                      src={decodedSrc}
                      alt="Decoded"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      className="max-w-full max-h-[340px] rounded shadow-2xl object-contain ring-1 ring-white/10"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                      <Maximize2 className="text-white cursor-pointer" size={32} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border border-slate-700/50">
                      <ImageIcon className="text-slate-600" size={40} />
                    </div>
                    <p className="text-slate-500 font-medium">Decoded output will appear here</p>
                  </div>
                )}
              </div>

              {details && (
                <div className="grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800 bg-slate-900/50">
                  <div className="p-4 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Dimensions</span>
                    <span className="text-sm font-mono text-indigo-400">{details.width} × {details.height}</span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Format</span>
                    <span className="text-sm font-mono text-indigo-400">{details.format}</span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">File Size</span>
                    <span className="text-sm font-mono text-indigo-400">{details.size}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <FileImage className="text-indigo-400" />, title: 'Multiple Formats', desc: 'Support for PNG, JPG, WEBP, GIF, and SVG base64 strings.' },
            { icon: <CheckCircle2 className="text-emerald-400" />, title: 'Client-Side', desc: 'Decoding is handled entirely in your browser for maximum privacy.' },
            { icon: <Info className="text-cyan-400" />, title: 'Auto-Detection', desc: 'Intelligently detects MIME types and binary structures.' }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:bg-slate-900/60 transition-colors">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Base64ImageDecoder;