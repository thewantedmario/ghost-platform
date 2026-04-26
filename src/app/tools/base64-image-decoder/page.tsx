'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Camera, Clipboard, Download, Trash2, Image as ImageIcon, AlertCircle, CheckCircle2, Copy } from 'lucide-react';

interface DecoderState {
  input: string;
  previewUrl: string | null;
  error: string | null;
  isProcessing: boolean;
  fileInfo: {
    format: string;
    size: string;
  } | null;
}

const Base64ImageDecoder: React.FC = () => {
  const [state, setState] = useState<DecoderState>({
    input: '',
    previewUrl: null,
    error: null,
    isProcessing: false,
    fileInfo: null,
  });

  const [copied, setCopied] = useState(false);

  const extractBase64Info = (base64String: string) => {
    try {
      const cleanString = base64String.trim();
      let format = 'unknown';
      let data = cleanString;

      if (cleanString.startsWith('data:image/')) {
        const match = cleanString.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          format = match[1];
          data = match[2];
        }
      }

      const decodedLength = (data.length * 0.75) - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0);
      const sizeInKb = (decodedLength / 1024).toFixed(2);

      return { format, size: `${sizeInKb} KB` };
    } catch {
      return null;
    }
  };

  const handleDecode = useCallback((value: string) => {
    if (!value.trim()) {
      setState(prev => ({ ...prev, input: value, previewUrl: null, error: null, fileInfo: null }));
      return;
    }

    setState(prev => ({ ...prev, input: value, isProcessing: true }));

    try {
      let processString = value.trim();
      
      // Ensure it has the data URI prefix for the <img> tag
      if (!processString.startsWith('data:image/')) {
        // Attempt to detect if it's raw base64 and guess PNG
        processString = `data:image/png;base64,${processString}`;
      }

      const info = extractBase64Info(processString);
      
      // Validation check by creating a dummy image
      const img = new Image();
      img.onload = () => {
        setState(prev => ({
          ...prev,
          previewUrl: processString,
          error: null,
          isProcessing: false,
          fileInfo: info
        }));
      };
      img.onerror = () => {
        setState(prev => ({
          ...prev,
          previewUrl: null,
          error: 'Invalid Base64 image data. Please check your string.',
          isProcessing: false,
          fileInfo: null
        }));
      };
      img.src = processString;
    } catch (e) {
      setState(prev => ({
        ...prev,
        error: 'Failed to process the string.',
        isProcessing: false,
        fileInfo: null
      }));
    }
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleDecode(text);
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  const handleDownload = () => {
    if (!state.previewUrl) return;
    const link = document.createElement('a');
    link.href = state.previewUrl;
    link.download = `decoded-image-${Date.now()}.${state.fileInfo?.format || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!state.input) return;
    navigator.clipboard.writeText(state.input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setState({
      input: '',
      previewUrl: null,
      error: null,
      isProcessing: false,
      fileInfo: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Camera className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Base64 Image Decoder
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Convert Base64 strings back into visual assets with a single click. 
            High-performance, secure, and client-side only processing.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Base64 String Input</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePaste}
                      className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white flex items-center gap-1.5 text-xs"
                      title="Paste from clipboard"
                    >
                      <Clipboard className="w-3.5 h-3.5" /> Paste
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white flex items-center gap-1.5 text-xs"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button 
                      onClick={clearAll}
                      className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors text-slate-400 hover:text-red-400 flex items-center gap-1.5 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>
                </div>
                <textarea
                  className="w-full h-96 bg-transparent border-none focus:ring-0 p-4 font-mono text-sm resize-none text-indigo-300 placeholder:text-slate-700"
                  placeholder="Paste your base64 string here (with or without data:image prefix)..."
                  value={state.input}
                  onChange={(e) => handleDecode(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>

            {state.error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{state.error}</p>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative h-full min-h-[400px]">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl opacity-20"></div>
              <div className="relative h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Image Preview</span>
                  {state.fileInfo && (
                    <div className="flex gap-3">
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 uppercase font-bold">
                        {state.fileInfo.format}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700 font-bold">
                        {state.fileInfo.size}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-grow flex items-center justify-center p-6 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
                  {state.previewUrl ? (
                    <div className="relative group/preview max-w-full">
                      <img
                        src={state.previewUrl}
                        alt="Decoded result"
                        className="max-h-[450px] w-auto rounded-lg shadow-2xl border border-slate-700/50 object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg backdrop-blur-sm">
                        <button
                          onClick={handleDownload}
                          className="px-6 py-3 bg-white text-slate-950 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-50"
                        >
                          <Download className="w-4 h-4" /> Download Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 opacity-30">
                      <div className="p-6 bg-slate-800 rounded-full inline-block">
                        <ImageIcon className="w-12 h-12 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">Ready to decode</p>
                    </div>
                  )}
                </div>

                {state.previewUrl && (
                  <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      <Download className="w-4 h-4" /> Download Decoded File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Base64 Decoder Tool — Professional Grade Processing</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Client-side encryption</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> No server uploads</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Base64ImageDecoder;