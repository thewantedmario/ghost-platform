'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ImageStats {
  width: number;
  height: number;
  size: string;
  mime: string;
}

const Base64ImageDecoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processBase64 = useCallback((value: string) => {
    setError(null);
    const cleanValue = value.trim();
    
    if (!cleanValue) {
      setImageSrc(null);
      setStats(null);
      return;
    }

    // Check if it's a valid data URL or just raw base64
    let formattedSrc = cleanValue;
    if (!cleanValue.startsWith('data:image/')) {
      // Default to PNG if prefix is missing, or try to detect
      formattedSrc = `data:image/png;base64,${cleanValue}`;
    }

    const img = new Image();
    img.onload = () => {
      setImageSrc(formattedSrc);
      
      // Calculate approximate size from base64 string
      const stringLength = cleanValue.split(',')[1]?.length || cleanValue.length;
      const sizeInBytes = Math.floor(stringLength * (3 / 4));
      
      setStats({
        width: img.width,
        height: img.height,
        size: formatBytes(sizeInBytes),
        mime: formattedSrc.split(';')[0].split(':')[1] || 'unknown'
      });
    };

    img.onerror = () => {
      setError('Invalid Base64 string or image format.');
      setImageSrc(null);
      setStats(null);
    };

    img.src = formattedSrc;
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      processBase64(input);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [input, processBase64]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setInput(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `decoded-image-${Date.now()}.${stats?.mime.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setInput(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Base64 Image Decoder
            </h1>
            <p className="text-zinc-500 mt-1">Convert Base64 strings to images and extract metadata instantly.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setInput('')}
              className="px-4 py-2 text-sm font-medium border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium bg-zinc-100 text-zinc-950 rounded-lg hover:bg-white transition-colors"
            >
              Upload Image
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div 
                className={`relative bg-zinc-900 border ${isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-zinc-800'} rounded-xl overflow-hidden transition-all`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Base64 String Input</span>
                  <button 
                    onClick={handleCopy}
                    className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    {copyStatus === 'copied' ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Copied
                      </span>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></>
                        Copy String
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your base64 string here (with or without data:image prefix)..."
                  className="w-full h-[450px] bg-transparent p-4 text-sm font-mono text-zinc-300 placeholder:text-zinc-700 focus:outline-none resize-none"
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="flex flex-col gap-4">
            <div className="relative flex-grow flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[400px]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Image Preview</span>
                {imageSrc && (
                  <button 
                    onClick={handleDownload}
                    className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Image
                  </button>
                )}
              </div>
              
              <div className="flex-grow flex items-center justify-center p-8 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:20px_20px]">
                {imageSrc ? (
                  <img 
                    src={imageSrc} 
                    alt="Decoded result" 
                    className="max-w-full max-h-[350px] object-contain shadow-2xl rounded-sm transition-transform duration-500 hover:scale-[1.02]"
                  />
                ) : (
                  <div className="text-center text-zinc-600">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Preview will appear here</p>
                  </div>
                )}
              </div>

              {stats && (
                <div className="grid grid-cols-4 border-t border-zinc-800 divide-x divide-zinc-800 bg-zinc-950/50">
                  <div className="p-3 text-center">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Dimensions</p>
                    <p className="text-xs font-mono">{stats.width} × {stats.height}</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Size</p>
                    <p className="text-xs font-mono">{stats.size}</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Type</p>
                    <p className="text-xs font-mono uppercase">{stats.mime.split('/')[1]}</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Aspect</p>
                    <p className="text-xs font-mono">{(stats.width / stats.height).toFixed(2)}:1</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions / Tips */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3 tracking-widest">Pro Tips</h3>
              <ul className="space-y-2">
                <li className="flex gap-2 text-xs text-zinc-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1"></div>
                  <span>Paste a raw base64 string or a full Data URI.</span>
                </li>
                <li className="flex gap-2 text-xs text-zinc-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1"></div>
                  <span>Drag and drop an image file to generate its base64 code.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-900 text-center text-zinc-600 text-xs">
          Professional Tooling &bull; 100% Client-Side Processing &bull; Secure & Private
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
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

export default Base64ImageDecoder;