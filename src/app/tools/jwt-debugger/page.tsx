'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Shield, AlertCircle, Cpu, Lock, Unlock } from 'lucide-react';

interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

interface JwtPayload {
  sub?: string;
  name?: string;
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
  parts: string[];
  isValid: boolean;
  error: string | null;
}

const JwtDebugger: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedJwt>({
    header: null,
    payload: null,
    signature: '',
    parts: [],
    isValid: false,
    error: null,
  });
  const [copied, setCopied] = useState<boolean>(false);

  const base64UrlDecode = (str: string): string => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return jsonPayload;
    } catch (e) {
      throw new Error('Invalid base64 encoding');
    }
  };

  const decodeToken = useCallback((input: string) => {
    if (!input.trim()) {
      setDecoded({ header: null, payload: null, signature: '', parts: [], isValid: false, error: null });
      return;
    }

    const parts = input.split('.');
    if (parts.length !== 3) {
      setDecoded((prev) => ({ ...prev, error: 'JWT must have 3 parts separated by dots', isValid: false }));
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
        parts,
        isValid: true,
        error: null,
      });
    } catch (err) {
      setDecoded((prev) => ({ ...prev, error: 'Failed to decode: Invalid JSON or base64 structure', isValid: false }));
    }
  }, []);

  useEffect(() => {
    decodeToken(token);
  }, [token, decodeToken]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatJson = (obj: any) => JSON.stringify(obj, null, 2);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Cpu size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                JWT<span className="text-indigo-500">Debugger</span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm">Decipher and validate JSON Web Tokens with precision.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${decoded.isValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
              {decoded.isValid ? <Shield size={16} /> : <AlertCircle size={16} />}
              <span className="text-xs font-semibold uppercase tracking-wider">
                {decoded.isValid ? 'Format Valid' : 'Format Invalid'}
              </span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-widest">Encoded Token</label>
              <button 
                onClick={() => setToken('')}
                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="relative group flex-grow">
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your JWT here..."
                className="w-full h-[600px] bg-[#111114] border border-slate-800 rounded-2xl p-6 font-mono text-sm leading-relaxed text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all resize-none shadow-2xl group-hover:border-slate-700"
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                 <button 
                  onClick={() => handleCopy(token)}
                  className="p-2 bg-slate-800/80 hover:bg-indigo-600 rounded-lg transition-all text-slate-300 hover:text-white border border-slate-700 shadow-xl backdrop-blur-sm"
                  title="Copy Token"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              
              {/* Highlight Overlay logic could go here, for now keeping it clean */}
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none opacity-20">
                <div className="flex gap-2 text-[10px] font-mono overflow-hidden whitespace-nowrap">
                  <span className="text-pink-500">HEADER</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-indigo-500">PAYLOAD</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-emerald-500">SIGNATURE</span>
                </div>
              </div>
            </div>
            {decoded.error && (
              <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-pulse">
                <AlertCircle size={18} />
                {decoded.error}
              </div>
            )}
          </section>

          {/* Output Section */}
          <section className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pink-500">
                <div className="w-1.5 h-4 bg-pink-500 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Header</h3>
              </div>
              <div className="relative bg-[#111114] border border-slate-800 rounded-2xl p-6 overflow-hidden">
                 <pre className="font-mono text-sm text-pink-400/90 whitespace-pre-wrap break-all">
                  {decoded.header ? formatJson(decoded.header) : '// Header will appear here'}
                </pre>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Lock size={40} className="text-pink-500" />
                </div>
              </div>
            </div>

            {/* Payload Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-500">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Payload</h3>
              </div>
              <div className="relative bg-[#111114] border border-slate-800 rounded-2xl p-6 overflow-hidden">
                <pre className="font-mono text-sm text-indigo-400/90 whitespace-pre-wrap break-all">
                  {decoded.payload ? formatJson(decoded.payload) : '// Payload will appear here'}
                </pre>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Unlock size={40} className="text-indigo-500" />
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-500">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Signature</h3>
              </div>
              <div className="relative bg-[#111114] border border-slate-800 rounded-2xl p-6 overflow-hidden min-h-[120px]">
                <div className="font-mono text-sm text-emerald-400/80 break-all">
                  {decoded.signature ? (
                    <div className="space-y-4">
                      <p className="leading-relaxed">{decoded.signature}</p>
                      <div className="pt-4 border-t border-slate-800/50">
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">HMACSHA256(</p>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          base64UrlEncode(header) + "." + <br/>
                          base64UrlEncode(payload), <br/>
                          <span className="text-emerald-600">your-256-bit-secret</span>
                        </p>
                        <p className="text-[10px] text-slate-500 tracking-tighter mt-1">)</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-600">// Signature will appear here</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            Tokens are decoded locally in your browser. Sensitive data never leaves your device.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-xs font-medium">Docs</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-xs font-medium">Security</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-xs font-medium">Github</a>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0c;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default JwtDebugger;