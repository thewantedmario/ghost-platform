'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ImageIcon, 
  Clipboard, 
  Download, 
  Trash2, 
  AlertCircle, 
  Maximize2, 
  CheckCircle2,
  FileImage,
  Layers
} from 'lucide-react';

interface ImageMetadata {
  width: number;
  height: number;
  type: string;
  size: string;
}

const Base64ImageDecoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const processBase64 = useCallback((value: string) => {
    setError(null);
    if (!value.trim()) {
      setPreviewUrl(null);
      setMetadata(null);
      return;
    }

    try {
      let cleanInput = value.trim();
      
      // Attempt to identify MIME type if missing
      if (!cleanInput.startsWith('data:image/')) {
        // Simple heuristic for common formats
        if (cleanInput.startsWith('/9j/')) cleanInput = 'data:image/jpeg;base64,' + cleanInput;
        else if (cleanInput.startsWith('iVBORw0KGgo=')) cleanInput = 'data:image/png;base64,' + cleanInput;
        else if (cleanInput.startsWith('R0lGOD')) cleanInput = 'data:image/gif;base64,' + cleanInput;
        else if (cleanInput.startsWith('UklGR')) cleanInput = 'data:image/webp;base64,' + cleanInput;
        else cleanInput = 'data:image/png;base64,' + cleanInput; // Default fallback
      }

      const img = new Image();
      img.onload = () => {
        setPreviewUrl(cleanInput);
        
        // Calculate size from base64 string
        const base64Content = cleanInput.split(',')[1];
        const padding = base64Content.endsWith('==') ? 2 : base64Content.endsWith('=') ? 1 : 0;
        const sizeInBytes = (base64Content.length * (3 / 4)) - padding;

        setMetadata({
          width: img.naturalWidth,
          height: img.naturalHeight,
          type: cleanInput.split(';')[0].split(':')[1] || 'Unknown',
          size: formatBytes(sizeInBytes)
        });
      };

      img.onerror = () => {
        setError("Invalid Base64 image data. Please check your string.");
        setPreviewUrl(null);
        setMetadata(null);
      };

      img.src = cleanInput;
    } catch (err) {
      setError("Failed to decode. Ensure the string is a valid Base64 encoded image.");
      setPreviewUrl(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      processBase64(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, processBase64]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    const extension = metadata?.type.split('/')[1] || 'png';
    link.href = previewUrl;
    link.download = `decoded-image-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!previewUrl) return;
    try {
      // Logic to copy the actual image blob to clipboard
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    } catch (err) {
      // Fallback: Copy the base64 string
      await navigator.clipboard.writeText(input);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    }
  };

  const clearAll = () => {
    setInput('');
    setPreviewUrl(null);
    setMetadata(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Layers className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Base64 Image Decoder
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Convert Base64 strings back into high-quality images. Instant preview, metadata analysis, and optimized downloads.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-indigo-400" />
                Base64 String Input
              </label>
              <button 
                onClick={clearAll}
                className="text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                CLEAR
              </button>
            </div>
            
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your base64 string here (e.g., data:image/png;base64,...)"
                className="w-full h-80 bg-[#161b22] border border-slate-800 rounded-xl p-4 text-sm font-mono text-indigo-300 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all resize-none shadow-2xl"
              />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#161b22] to-transparent pointer-events-none rounded-b-xl"></div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </section>

          {/* Preview Section */}
          <section className="space-y-4 h-full">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-emerald-400" />
                Live Preview
              </label>
              {metadata && (
                <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                  {metadata.type.split('/')[1]}
                </span>
              )}
            </div>

            <div className={`relative w-full h-80 rounded-xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden
              ${previewUrl ? 'border-indigo-500/30 bg-[#161b22]' : 'border-slate-800 bg-[#0f1115]'}
            `}>
              {previewUrl ? (
                <div className="relative group w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={previewUrl} 
                    alt="Decoded" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl z-10"
                  />
                  {/* Grid background for transparency detection */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                    <FileImage className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-500 text-sm italic">Waiting for base64 input...</p>
                </div>
              )}
            </div>

            {/* Actions & Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                disabled={!previewUrl}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all
                  ${previewUrl 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                    : 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'}
                `}
              >
                {copyStatus ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                {copyStatus ? 'Copied Image' : 'Copy Image'}
              </button>
              
              <button
                onClick={handleDownload}
                disabled={!previewUrl}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all
                  ${previewUrl 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'}
                `}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            {metadata && (
              <div className="grid grid-cols-3 gap-4 mt-6 p-4 rounded-xl bg-[#161b22] border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Dimensions</p>
                  <p className="text-sm font-mono text-indigo-400">{metadata.width} × {metadata.height}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">File Size</p>
                  <p className="text-sm font-mono text-indigo-400">{metadata.size}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">MIME Type</p>
                  <p className="text-sm font-mono text-indigo-400 truncate">{metadata.type}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Instructions/Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Client-side Processing</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Secure & Private</span>
          </div>
          <div className="text-xs text-slate-600">
            © {new Date().getFullYear()} ImageTools Pro • High-End Image Decoding
          </div>
        </footer>
      </div>
      
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f1115;
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

export default Base64ImageDecoder;