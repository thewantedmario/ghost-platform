'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ShieldCheck, AlertCircle, Terminal, Key, Database, Lock } from 'lucide-react';

interface JWTHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

interface JWTPayload {
  sub?: string;
  name?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  [key: string]: any;
}

interface DecodedJWT {
  header: JWTHeader | null;
  payload: JWTPayload | null;
  signature: string | null;
  isValid: boolean;
  error: string | null;
}

const JWTDebugger: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedJWT>({
    header: null,
    payload: null,
    signature: null,
    isValid: false,
    error: null,
  });
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decodeBase64 = (str: string): string => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return jsonPayload;
    } catch (e) {
      throw new Error('Invalid base64 encoding');
    }
  };

  const parseJWT = useCallback((token: string) => {
    if (!token) {
      setDecoded({ header: null, payload: null, signature: null, isValid: false, error: null });
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      setDecoded((prev) => ({ ...prev, isValid: false, error: 'Invalid JWT structure: Must have 3 parts separated by dots.' }));
      return;
    }

    try {
      const header = JSON.parse(decodeBase64(parts[0]));
      const payload = JSON.parse(decodeBase64(parts[1]));
      const signature = parts[2];

      setDecoded({
        header,
        payload,
        signature,
        isValid: true,
        error: null,
      });
    } catch (err) {
      setDecoded((prev) => ({ ...prev, isValid: false, error: 'Failed to decode: Invalid base64 or JSON content.' }));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      parseJWT(input.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [input, parseJWT]);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formatJson = (obj: any) => JSON.stringify(obj, null, 2);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                JWT <span className="text-indigo-500">Debugger</span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm md:text-base">
              Securely decode, inspect, and debug JSON Web Tokens locally.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${decoded.isValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {decoded.isValid ? '● Valid Format' : '○ Waiting for input'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative group h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/20 to-purple-500/0 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative h-full bg-[#111114] border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Encoded Token</span>
                  </div>
                </div>
                <textarea
                  className="flex-1 w-full bg-transparent p-6 text-slate-300 font-mono text-sm leading-relaxed outline-none resize-none placeholder:text-slate-600"
                  placeholder="Paste your JWT here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>
            
            {decoded.error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{decoded.error}</p>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Block */}
            <div className="bg-[#111114] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#f43f5e10]">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">Header</span>
                  <span className="text-[10px] text-slate-500 ml-2 font-mono uppercase">Algorithm & Token Type</span>
                </div>
                {decoded.header && (
                  <button 
                    onClick={() => copyToClipboard(formatJson(decoded.header), 'header')}
                    className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400"
                  >
                    {copiedSection === 'header' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <div className="p-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  {decoded.header ? (
                    <code>
                      {Object.entries(decoded.header).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-rose-400">"{key}"</span>: <span className="text-amber-200">"{val}"</span>,
                        </div>
                      ))}
                    </code>
                  ) : (
                    <span className="text-slate-600 italic">No data decoded...</span>
                  )}
                </pre>
              </div>
            </div>

            {/* Payload Block */}
            <div className="bg-[#111114] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#a855f710]">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-500">Payload</span>
                  <span className="text-[10px] text-slate-500 ml-2 font-mono uppercase">Claims & Data</span>
                </div>
                {decoded.payload && (
                  <button 
                    onClick={() => copyToClipboard(formatJson(decoded.payload), 'payload')}
                    className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400"
                  >
                    {copiedSection === 'payload' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <div className="p-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  {decoded.payload ? (
                    <code>
                      {Object.entries(decoded.payload).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-purple-400">"{key}"</span>: <span className={typeof val === 'number' ? 'text-sky-300' : 'text-amber-200'}>
                            {typeof val === 'string' ? `"${val}"` : val}
                          </span>,
                          {key === 'exp' || key === 'iat' ? (
                            <span className="text-slate-600 text-[10px] ml-2 font-sans italic">
                              // {new Date(val * 1000).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </code>
                  ) : (
                    <span className="text-slate-600 italic">No data decoded...</span>
                  )}
                </pre>
              </div>
            </div>

            {/* Signature Block */}
            <div className="bg-[#111114] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#06b6d410]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-500">Signature</span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-sm font-mono break-all text-slate-500 leading-relaxed">
                  {decoded.signature ? (
                    <>
                      <span className="text-rose-500/60">HMACSHA256</span>(
                      <br />
                      &nbsp;&nbsp;base64UrlEncode(<span className="text-rose-500/60">header</span>) + "." +
                      <br />
                      &nbsp;&nbsp;base64UrlEncode(<span className="text-purple-500/60">payload</span>),
                      <br />
                      &nbsp;&nbsp;<span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400">your-256-bit-secret</span>
                      <br />
                      )
                    </>
                  ) : (
                    <span className="text-slate-600 italic">No signature detected...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-slate-500 text-xs">
          <p>JWT Debugger is a client-side tool. Your token never leaves your browser.</p>
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default JWTDebugger;