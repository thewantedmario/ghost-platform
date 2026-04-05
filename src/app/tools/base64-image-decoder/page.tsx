'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Upload,
  Maximize2
} from 'lucide-react';

interface ImageMetadata {
  width: number;
  height: number;
  type: string;
  size: string;
}

const Base64ImageDecoder: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const decodeBase64 = useCallback((value: string) => {
    setError(null);
    if (!value.trim()) {
      setPreviewUrl(null);
      setMetadata(null);
      return;
    }

    try {
      // Clean the input (remove whitespace/newlines)
      const cleanString = value.trim().replace(/\s/g, '');
      
      // Ensure it has the data prefix, add if missing (defaulting to png)
      let formattedString = cleanString;
      if (!cleanString.startsWith('data:image/')) {
        formattedString = `data:image/png;base64,${cleanString}`;
      }

      const img = new Image();
      img.onload = () => {
        setPreviewUrl(formattedString);
        setMetadata({
          width: img.naturalWidth,
          height: img.naturalHeight,
          type: formattedString.split(';')[0].split(':')[1],
          size: formatBytes(Math.round((cleanString.length * 3) / 4))
        });
      };
      img.onerror = () => {
        setError('Invalid Base64 image data. Please check the format.');
        setPreviewUrl(null);
        setMetadata(null);
      };
      img.src = formattedString;
    } catch (e) {
      setError('Failed to process string. Ensure it is valid Base64.');
      setPreviewUrl(null);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    decodeBase64(value);
  };

  const handleClear = () => {
    setInputValue('');
    setPreviewUrl(null);
    setError(null);
    setMetadata(null);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `decoded-image-${Date.now()}.${metadata?.type.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inputValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col space-y-2">
          <div className="inline-flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Base64 Image Decoder
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Convert Base64 encoded strings back into visual images. High-performance decoding with instant preview and metadata extraction.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Base64 String Input
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!inputValue}
                  className="p-2 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
                  title="Copy Input"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-colors text-slate-400"
                  title="Clear Input"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Paste your Base64 string here (e.g., data:image/png;base64,...)"
                className="relative w-full h-[500px] bg-[#121214] border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                Live Preview
              </label>
              {previewUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download Image
                </button>
              )}
            </div>

            <div className="relative h-[500px] w-full bg-[#121214] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              {error ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <AlertCircle className="w-12 h-12 text-red-500/50" />
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
              ) : previewUrl ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] flex items-center justify-center overflow-auto p-8">
                    <img
                      src={previewUrl}
                      alt="Decoded preview"
                      className="max-w-full max-h-full object-contain shadow-2xl rounded shadow-black/50"
                    />
                  </div>
                  
                  {/* Metadata Footer */}
                  <div className="bg-[#1a1a1e] border-t border-slate-800 p-4 grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Dimensions</p>
                      <p className="text-sm text-slate-200 font-mono">{metadata?.width} × {metadata?.height} px</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Mime Type</p>
                      <p className="text-sm text-slate-200 font-mono">{metadata?.type}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">File Size</p>
                      <p className="text-sm text-slate-200 font-mono">{metadata?.size}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-medium">No image decoded</p>
                    <p className="text-sm text-slate-600">Enter a valid Base64 string to see the preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© 2024 Premium Dev Tools. Secure client-side decoding.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Local Processing
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Private & Secure
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Base64ImageDecoder;