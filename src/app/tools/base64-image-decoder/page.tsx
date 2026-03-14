'use client';

import React, { useState, useCallback, useRef } from 'react';

interface DecodedData {
  src: string;
  type: string;
  size: string;
}

const Base64ImageDecoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateSize = (base64String: string): string => {
    const stringLength = base64String.length - (base64String.indexOf(',') + 1);
    const sizeInBytes = Math.ceil(stringLength * 0.75);
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1048576) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
  };

  const decodeBase64 = useCallback(() => {
    setError(null);
    if (!input.trim()) {
      setError('Please enter a Base64 string');
      return;
    }

    try {
      let cleanInput = input.trim();
      
      // Basic validation: Check if it's a data URI or raw base64
      const isDataUri = cleanInput.startsWith('data:image/');
      
      if (!isDataUri) {
        // Attempt to treat as raw base64 and default to PNG
        cleanInput = `data:image/png;base64,${cleanInput}`;
      }

      // Detect MIME type
      const mimeMatch = cleanInput.match(/data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'unknown';

      const img = new Image();
      img.onload = () => {
        setDecodedData({
          src: cleanInput,
          type: mimeType,
          size: calculateSize(cleanInput),
        });
      };
      img.onerror = () => {
        setError('Invalid Base64 image data. Please check the source string.');
        setDecodedData(null);
      };
      img.src = cleanInput;
    } catch (err) {
      setError('An error occurred while decoding the string.');
      setDecodedData(null);
    }
  }, [input]);

  const handleDownload = () => {
    if (!decodedData) return;
    const link = document.createElement('a');
    const extension = decodedData.type.split('/')[1] || 'png';
    link.href = decodedData.src;
    link.download = `decoded-image-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!decodedData) return;
    try {
      await navigator.clipboard.writeText(decodedData.src);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const clearAll = () => {
    setInput('');
    setDecodedData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Base64 Image Decoder
          </h1>
          <p className="text-slate-400 text-lg">
            Transform Base64 strings back into visual assets with high precision.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <label className="block text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                Base64 Source String
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your base64 string here (e.g., data:image/png;base64,...)"
                className="w-full h-80 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              />
              
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={decodeBase64}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-2 2-1.5-1.5L16 10l-2-2"/><path d="M3 10c0-2 2-3 3-3s3 1 3 3v10H3V10Z"/><path d="M3 14h6"/><path d="M14 17h8"/><path d="M14 13h8"/></svg>
                  Decode Image
                </button>
                <button
                  onClick={clearAll}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Clear
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Live Preview & Details
                </label>
                {decodedData && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 flex items-center gap-2 text-xs"
                      title="Copy Data URI"
                    >
                      {isCopying ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          Copy URI
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-2 text-xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 relative min-h-[400px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group">
                {decodedData ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                    <img
                      src={decodedData.src}
                      alt="Decoded result"
                      className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
                      <div className="bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-400 shadow-xl">
                        <span className="text-indigo-400 font-bold">Type:</span> {decodedData.type}
                      </div>
                      <div className="bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-400 shadow-xl">
                        <span className="text-indigo-400 font-bold">Size:</span> {decodedData.size}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div>
                      <h3 className="text-slate-400 font-medium">No Image Decoded</h3>
                      <p className="text-slate-600 text-sm mt-1">Provide a Base64 string to see the result</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} ImageTools Pro — Secure, Client-Side Decoding</p>
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #020617;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default Base64ImageDecoder;