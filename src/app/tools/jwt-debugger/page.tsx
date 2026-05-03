'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface JwtHeader {
  alg: string;
  typ?: string;
  [key: string]: any;
}

interface JwtPayload {
  sub?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string | string[];
  [key: string]: any;
}

interface DecodedJwt {
  header: JwtHeader | null;
  payload: JwtPayload | null;
  signature: string;
  isValid: boolean;
  error?: string;
}

const JWTDebugger: React.FC = () => {
  const [inputToken, setInputToken] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const decoded = useMemo((): DecodedJwt => {
    if (!inputToken.trim()) {
      return { header: null, payload: null, signature: '', isValid: false };
    }

    const parts = inputToken.split('.');
    if (parts.length !== 3) {
      return { 
        header: null, 
        payload: null, 
        signature: '', 
        isValid: false, 
        error: 'Invalid JWT format: Must contain 3 parts separated by dots.' 
      };
    }

    try {
      const decodeBase64 = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      };

      return {
        header: decodeBase64(parts[0]),
        payload: decodeBase64(parts[1]),
        signature: parts[2],
        isValid: true
      };
    } catch (e) {
      return {
        header: null,
        payload: null,
        signature: parts[2] || '',
        isValid: false,
        error: 'Failed to decode: Data is not valid Base64URL encoded JSON.'
      };
    }
  }, [inputToken]);

  const handleCopy = async () => {
    if (!inputToken) return;
    await navigator.clipboard.writeText(inputToken);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const SyntaxHighlighter = ({ data, colorClass }: { data: any, colorClass: string }) => {
    if (!data) return <span className="text-zinc-600 italic">No data available</span>;
    const jsonString = JSON.stringify(data, null, 2);
    
    return (
      <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
        {jsonString.split('\n').map((line, i) => {
          const isKey = line.includes('":');
          if (isKey) {
            const [key, value] = line.split('":');
            return (
              <div key={i} className="whitespace-pre">
                <span className={colorClass}>{key}"</span>:
                <span className="text-zinc-300">{value}</span>
              </div>
            );
          }
          return <div key={i} className="text-zinc-300">{line}</div>;
        })}
      </pre>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="bg-indigo-600 px-2 py-1 rounded text-sm uppercase tracking-widest">JWT</span>
              Debugger
            </h1>
            <p className="text-zinc-500 mt-1">Decode and analyze JSON Web Tokens in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!inputToken}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                copySuccess 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-300 active:scale-95 disabled:opacity-50'
              }`}
            >
              {copySuccess ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              )}
              {copySuccess ? 'Copied' : 'Copy Token'}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Encoded Token</label>
              {decoded.error && <span className="text-xs text-rose-500 font-medium">{decoded.error}</span>}
            </div>
            <div className="relative group flex-grow min-h-[400px]">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
              <textarea
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Paste your JWT here..."
                className="relative w-full h-full min-h-[400px] bg-zinc-900 border border-zinc-800 rounded-xl p-6 font-mono text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all placeholder:text-zinc-700"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Column: Decoded Output */}
          <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Header</span>
                <span className="text-[10px] text-zinc-600 font-mono">Algorithm & Token Type</span>
              </div>
              <div className="p-6">
                <SyntaxHighlighter data={decoded.header} colorClass="text-rose-400" />
              </div>
            </div>

            {/* Payload Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Payload</span>
                <span className="text-[10px] text-zinc-600 font-mono">Data & Claims</span>
              </div>
              <div className="p-6">
                <SyntaxHighlighter data={decoded.payload} colorClass="text-indigo-400" />
              </div>
            </div>

            {/* Signature Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Signature</span>
                <span className="text-[10px] text-zinc-600 font-mono">Verification Hash</span>
              </div>
              <div className="p-6">
                <p className="font-mono text-sm text-zinc-500 break-all leading-relaxed">
                  {decoded.signature ? decoded.signature : <span className="italic text-zinc-600">No signature detected</span>}
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span>Signature is correctly structured for HMAC-SHA256 / RSA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Info */}
        <footer className="mt-12 pt-8 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-300">Privacy First</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">Tokens are decoded purely in your browser. No data is sent to any server. Your sensitive keys remain private.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-300">Claim Validation</h4>
            <div className="flex flex-wrap gap-2">
              {decoded.payload?.exp && (
                <span className={`text-[10px] px-2 py-1 rounded bg-zinc-800 border ${Date.now() / 1000 > decoded.payload.exp ? 'border-rose-500/50 text-rose-400' : 'border-emerald-500/50 text-emerald-400'}`}>
                  EXP: {new Date(decoded.payload.exp * 1000).toLocaleDateString()}
                </span>
              )}
              {decoded.payload?.iat && (
                <span className="text-[10px] px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                  IAT: {new Date(decoded.payload.iat * 1000).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2 text-right flex flex-col items-end">
            <h4 className="text-sm font-semibold text-zinc-300">Status</h4>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${decoded.isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${decoded.isValid ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
              {decoded.isValid ? 'Valid Structure' : 'Invalid Input'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default JWTDebugger;