'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface JWTParts {
  header: object | null;
  payload: object | null;
  signature: string;
  isInvalid: boolean;
}

const JWTDebugger: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [decoded, setDecoded] = useState<JWTParts>({
    header: null,
    payload: null,
    signature: '',
    isInvalid: false,
  });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const base64UrlDecode = (str: string): string => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return jsonPayload;
    } catch (e) {
      throw new Error('Invalid Base64 string');
    }
  };

  const decodeToken = useCallback((input: string) => {
    if (!input) {
      setDecoded({ header: null, payload: null, signature: '', isInvalid: false });
      return;
    }

    const parts = input.split('.');
    if (parts.length !== 3) {
      setDecoded((prev) => ({ ...prev, isInvalid: true }));
      return;
    }

    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      const signature = parts[2];

      setDecoded({
        header,
        payload,
        signature,
        isInvalid: false,
      });
    } catch (err) {
      setDecoded((prev) => ({ ...prev, isInvalid: true }));
    }
  }, []);

  useEffect(() => {
    decodeToken(token);
  }, [token, decodeToken]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const JsonDisplay = ({ data, color }: { data: object | null; color: string }) => {
    if (!data) return <span className="text-slate-500 italic">No data available</span>;
    return (
      <pre className={`font-mono text-sm overflow-x-auto p-4 rounded-lg bg-slate-900/50 border border-slate-800 ${color}`}>
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent tracking-tight">
              JWT Debugger
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Decode and analyze JSON Web Tokens in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Secure Local Decoding
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Encoded Token</label>
              {token && (
                <button
                  onClick={() => setToken('')}
                  className="text-xs text-slate-500 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative group">
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your JWT here..."
                className="w-full h-[600px] bg-slate-900 border border-slate-800 rounded-xl p-6 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none shadow-2xl placeholder:text-slate-700"
              />
              {decoded.isInvalid && token && (
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md">
                  Invalid Token Format
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Decoded Data</label>
              <button
                onClick={() => handleCopy(JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2))}
                disabled={!decoded.payload}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copyStatus === 'copied' ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-6">
              {/* Header */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-pink-500 uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Header
                  <span className="text-slate-600 font-normal lowercase tracking-normal italic">(Algorithm & Token Type)</span>
                </h3>
                <JsonDisplay data={decoded.header} color="text-pink-400" />
              </section>

              {/* Payload */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-purple-500 uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Payload
                  <span className="text-slate-600 font-normal lowercase tracking-normal italic">(Data)</span>
                </h3>
                <JsonDisplay data={decoded.payload} color="text-purple-400" />
              </section>

              {/* Signature */}
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-sky-500 uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  Signature
                </h3>
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 break-all font-mono text-xs text-sky-400/80 leading-relaxed">
                  {decoded.signature ? (
                    `HMACSHA256(\n  base64UrlEncode(header) + "." +\n  base64UrlEncode(payload),\n  your-256-bit-secret\n) \n\n// Hash: ${decoded.signature}`
                  ) : (
                    <span className="text-slate-500 italic">Signature will appear here</span>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-500">
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
            <h4 className="text-slate-300 font-medium mb-1">Privacy First</h4>
            <p>Decoding happens entirely in your browser. Tokens are never sent to a server.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
            <h4 className="text-slate-300 font-medium mb-1">Standard Compliant</h4>
            <p>Full support for RFC 7519 JSON Web Tokens including standard claims.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
            <h4 className="text-slate-300 font-medium mb-1">Color Coded</h4>
            <p>Visual mapping helps identify Header, Payload, and Signature components instantly.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default JWTDebugger;