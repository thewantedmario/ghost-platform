'use client';

"use client";

import React, { useState, useCallback, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  Maximize2
} from 'lucide-react';

interface DecoderState {
  base64String: string;
  imageSrc: string | null;
  error: string | null;
  fileInfo: {
    type: string;
    size: string;
    dimensions: string;
  } | null;
}

const Base64ImageDecoder: React.FC = () => {
  const [state, setState] = useState<DecoderState>({
    base64String: '',
    imageSrc: null,
    error: null,
    fileInfo: null,
  });
  
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const decodeBase64 = useCallback((input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setState({ base64String: '', imageSrc: null, error: null, fileInfo: null });
      return;
    }

    try {
      // Validate if it has a prefix, if not, try to guess or just use as is
      let finalSrc = trimmedInput;
      if (!trimmedInput.startsWith('data:image/')) {
        // Attempt to detect common formats if prefix is missing
        if (trimmedInput.startsWith('/9j/')) finalSrc = `data:image/jpeg;base64,${trimmedInput}`;
        else if (trimmedInput.startsWith('iVBORw0KGgo')) finalSrc = `data:image/png;base64,${trimmedInput}`;
        else if (trimmedInput.startsWith('R0lGODlh')) finalSrc = `data:image/gif;base64,${trimmedInput}`;
        else if (trimmedInput.startsWith('UklGR')) finalSrc = `data:image/webp;base64,${trimmedInput}`;
        else finalSrc = `data:image/png;base64,${trimmedInput}`;
      }

      const img = new Image();
      img.onload = () => {
        // Calculate size from base64 string
        const stringLength = trimmedInput.length - (trimmedInput.indexOf(',') + 1);
        const sizeInBytes = Math.ceil((stringLength * 3) / 4);

        setState({
          base64String: trimmedInput,
          imageSrc: finalSrc,
          error: null,
          fileInfo: {
            type: finalSrc.split(';')[0].split(':')[1] || 'unknown',
            size: formatBytes(sizeInBytes),
            dimensions: `${img.width} × ${img.height} px`,
          },
        });
      };

      img.onerror = () => {
        setState(prev => ({ ...prev, base64String: trimmedInput, error: 'Invalid Base64 image data', imageSrc: null, fileInfo: null }));
      };

      img.src = finalSrc;
    } catch (err) {
      setState(prev => ({ ...prev, base64String: trimmedInput, error: 'Failed to process Base64 string', imageSrc: null, fileInfo: null }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    decodeBase64(e.target.value);
  };

  const handleClear = () => {
    setState({ base64String: '', imageSrc: null, error: null, fileInfo: null });
  };

  const handleDownload = () => {
    if (!state.imageSrc) return;
    const link = document.createElement('a');
    link.href = state.imageSrc;
    link.download = `decoded-image-${Date.now()}.${state.fileInfo?.type.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(state.base64String);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <ImageIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                Base64 Image Decoder
              </h1>
            </div>
            <p className="text-zinc-400 text-sm md:text-base">
              Transform Base64 strings back into visual assets with instant preview and metadata.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Input Base64 String</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
                    title="Copy string"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
                <textarea
                  value={state.base64String}
                  onChange={handleInputChange}
                  placeholder="Paste your base64 string here (e.g., data:image/png;base64,...)"
                  className="w-full h-[400px] bg-transparent p-4 text-sm font-mono text-zinc-300 resize-none focus:outline-none scrollbar-thin scrollbar-thumb-zinc-700"
                />
              </div>
            </div>

            {state.error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {state.error}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="relative h-full flex flex-col">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl blur opacity-10 transition duration-500"></div>
              <div className="relative flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Image Preview</span>
                  {state.imageSrc && (
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-md transition-all shadow-lg shadow-indigo-500/20"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  {state.imageSrc ? (
                    <div className="relative group max-w-full max-h-full">
                      <img 
                        src={state.imageSrc} 
                        alt="Decoded output" 
                        className="max-w-full max-h-[300px] object-contain rounded shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-zinc-600">
                      <div className="w-16 h-16 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                        <Maximize2 className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm font-medium">Waiting for valid input...</p>
                    </div>
                  )}
                </div>

                {state.fileInfo && (
                  <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Format</p>
                      <p className="text-sm text-zinc-200 font-mono">{state.fileInfo.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Size</p>
                      <p className="text-sm text-zinc-200 font-mono">{state.fileInfo.size}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Dimensions</p>
                      <p className="text-sm text-zinc-200 font-mono">{state.fileInfo.dimensions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Features */}
        <footer className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Secure Decoding', desc: 'Processing happens entirely in your browser. No data ever leaves your device.' },
            { title: 'Auto-Detection', desc: 'Automatically identifies PNG, JPEG, WEBP, and GIF formats from raw strings.' },
            { title: 'High Fidelity', desc: 'Maintains original quality and metadata during the decoding process.' }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30">
              <h3 className="text-zinc-200 text-sm font-semibold mb-1">{item.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </footer>
      </div>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default Base64ImageDecoder;