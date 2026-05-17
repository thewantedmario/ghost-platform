'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ImageIcon, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Maximize2, 
  FileImage,
  UploadCloud
} from 'lucide-react';

interface ImageMetadata {
  width: number;
  height: number;
  size: string;
  mimeType: string;
}

const Base64ImageDecoder: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateAndDecode = useCallback((input: string) => {
    setError(null);
    const cleanInput = input.trim();
    
    if (!cleanInput) {
      setImageSrc(null);
      setMetadata(null);
      return;
    }

    let processedString = cleanInput;
    
    // Check if it's a raw base64 or has the data URI prefix
    if (!cleanInput.startsWith('data:image/')) {
      // Attempt to guess MIME type or default to png
      processedString = `data:image/png;base64,${cleanInput}`;
    }

    const img = new Image();
    img.onload = () => {
      setImageSrc(processedString);
      
      // Calculate approximate size from base64
      const stringLength = cleanInput.replace(/^data:image\/\w+;base64,/, '').length;
      const sizeInBytes = Math.floor(stringLength * (3 / 4));
      
      const match = processedString.match(/^data:(image\/\w+);base64/);
      const mimeType = match ? match[1] : 'unknown';

      setMetadata({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: formatBytes(sizeInBytes),
        mimeType: mimeType
      });
    };

    img.onerror = () => {
      // If it failed and we added a prefix, it might just be invalid data
      setError('Invalid Base64 string. Please ensure the data is a valid image encoding.');
      setImageSrc(null);
      setMetadata(null);
    };

    img.src = processedString;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    validateAndDecode(val);
  };

  const handleClear = () => {
    setInputValue('');
    setImageSrc(null);
    setError(null);
    setMetadata(null);
  };

  const copyToClipboard = async () => {
    if (!imageSrc) return;
    try {
      await navigator.clipboard.writeText(inputValue);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const downloadImage = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    const extension = metadata?.mimeType.split('/')[1] || 'png';
    link.href = imageSrc;
    link.download = `decoded-image-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Base64 Image Decoder
            </h1>
            <p className="text-zinc-400">Transform encoded base64 strings back into visual assets instantly.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClear}
              className="px-4 py-2 flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Input Base64 String</span>
                  </div>
                  {inputValue && (
                    <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-500">
                      {inputValue.length.toLocaleString()} characters
                    </span>
                  )}
                </div>
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Paste your data:image/png;base64,... string here"
                  className="w-full h-[500px] bg-transparent p-4 text-sm font-mono text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:ring-0"
                  spellCheck={false}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Image Preview</span>
                </div>
                
                {imageSrc && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
                      title="Copy Base64"
                    >
                      {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button 
                      onClick={downloadImage}
                      className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
                      title="Download Image"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#1e1e2e_1px,transparent_1px)] [background-size:20px_20px] relative overflow-hidden">
                {imageSrc ? (
                  <div className="relative group max-w-full">
                    <img 
                      src={imageSrc} 
                      alt="Decoded result" 
                      className="max-w-full max-h-[400px] object-contain shadow-2xl rounded border border-zinc-700 bg-zinc-800"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded">
                      <button 
                        onClick={() => window.open(imageSrc, '_blank')}
                        className="bg-white text-black p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                      >
                        <Maximize2 size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center flex flex-col items-center gap-4 opacity-30">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center">
                      <FileImage size={40} />
                    </div>
                    <p className="text-sm font-medium max-w-[200px]">
                      Waiting for valid base64 input to render preview...
                    </p>
                  </div>
                )}
              </div>

              {metadata && (
                <div className="grid grid-cols-3 divide-x divide-zinc-800 border-t border-zinc-800 bg-zinc-900/50">
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Dimensions</p>
                    <p className="text-sm font-mono text-zinc-300">{metadata.width} × {metadata.height} px</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">File Size</p>
                    <p className="text-sm font-mono text-zinc-300">{metadata.size}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">MIME Type</p>
                    <p className="text-sm font-mono text-zinc-300">{metadata.mimeType}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Actions Footer */}
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Pro Tip</h4>
                  <p className="text-xs text-zinc-500">You can paste strings with or without the <code className="text-indigo-400 bg-indigo-400/10 px-1 rounded">data:image/...</code> prefix.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default Base64ImageDecoder;