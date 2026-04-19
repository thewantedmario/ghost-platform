'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  ImageIcon, 
  Copy, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Maximize2,
  FileImage
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageMetadata {
  width: number;
  height: number;
  size: string;
  mimeType: string;
}

const Base64ImageDecoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const calculateSize = (base64String: string): string => {
    const stringLength = base64String.length - (base64String.indexOf(',') + 1);
    const sizeInBytes = Math.ceil((stringLength * 3) / 4);
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1048576) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
  };

  const decodeBase64 = useCallback((value: string) => {
    setError(null);
    if (!value.trim()) {
      setPreviewUrl(null);
      setMetadata(null);
      return;
    }

    try {
      // Normalize base64 string
      let formattedInput = value.trim();
      if (!formattedInput.startsWith('data:image/')) {
        // Attempt to guess mime type or default to png
        formattedInput = `data:image/png;base64,${formattedInput}`;
      }

      const img = new Image();
      img.onload = () => {
        setPreviewUrl(formattedInput);
        setMetadata({
          width: img.width,
          height: img.height,
          size: calculateSize(formattedInput),
          mimeType: formattedInput.split(';')[0].split(':')[1]
        });
      };
      img.onerror = () => {
        setError('Invalid Base64 image data. Please check the string and try again.');
        setPreviewUrl(null);
        setMetadata(null);
      };
      img.src = formattedInput;
    } catch (e) {
      setError('Failed to process the input. Ensure it is a valid Base64 string.');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    decodeBase64(val);
  };

  const handleCopy = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `decoded-image-${Date.now()}.${metadata?.mimeType.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setInput('');
    setPreviewUrl(null);
    setMetadata(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <FileImage className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
              Base64 Image Decoder
            </h1>
          </div>
          <p className="text-neutral-400 text-lg">
            Instantly transform Base64 strings back into visual assets with real-time preview and metadata analysis.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
                Base64 Source String
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!input}
                  className="p-2 text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
                  title="Copy Input"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={clearAll}
                  disabled={!input}
                  className="p-2 text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-30"
                  title="Clear All"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Paste your base64 string here (e.g., data:image/png;base64,...)"
                className="relative w-full h-[400px] bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-sm font-mono text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Preview Section */}
          <section className="space-y-4">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider block">
              Live Preview & Output
            </label>
            
            <div className="relative h-[400px] w-full rounded-xl border border-neutral-800 bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden flex items-center justify-center group">
              {previewUrl ? (
                <div className="relative group/preview w-full h-full flex items-center justify-center p-8">
                  <motion.img
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={previewUrl}
                    alt="Decoded"
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-neutral-900/80 backdrop-blur border border-neutral-700 rounded-lg text-white hover:bg-neutral-800 transition-all shadow-lg"
                      title="Download Image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-neutral-900/80 backdrop-blur border border-neutral-700 rounded-lg text-white hover:bg-neutral-800 transition-all shadow-lg"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-neutral-600">
                  <ImageIcon className="w-16 h-16 stroke-[1]" />
                  <p className="text-sm font-medium tracking-wide">Waiting for valid input...</p>
                </div>
              )}
            </div>

            {/* Metadata Bar */}
            <AnimatePresence>
              {metadata && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {[
                    { label: 'Format', value: metadata.mimeType.split('/')[1].toUpperCase() },
                    { label: 'Dimensions', value: `${metadata.width} × ${metadata.height}` },
                    { label: 'Size', value: metadata.size },
                    { label: 'Aspect Ratio', value: (metadata.width / metadata.height).toFixed(2) },
                  ].map((stat, i) => (
                    <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-3 rounded-xl">
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-sm font-semibold text-neutral-200">{stat.value}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-500 text-sm">
          <p>© 2024 Base64 Decoder. Secure client-side processing.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              Local Execution
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
              No Data Stored
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Base64ImageDecoder;