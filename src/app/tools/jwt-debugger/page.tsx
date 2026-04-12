'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ShieldCheck, AlertCircle, Terminal, Cpu, Database, Key } from 'lucide-react';

interface JWTHeader {
  alg: string;
  typ: string;
  [key: string]: any;
}

interface JWTPayload {
  sub?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  [key: string]: any;
}

interface JWTState {
  header: JWTHeader | null;
  payload: JWTPayload | null;
  signature: string;
  isValid: boolean;
  error: string | null;
}

export default function JWTDebugger() {
  const [encodedToken, setEncodedToken] = useState<string>('');
  const [decoded, setDecoded] = useState<JWTState>({
    header: null,
    payload: null,
    signature: '',
    isValid: false,
    error: null,
  });
  const [copied, setCopied] = useState<boolean>(false);

  const base64UrlDecode = (str: string): string => {
    try {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) str += '=';
      return decodeURIComponent(
        atob(str)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (e) {
      throw new Error('Invalid base64 encoding');
    }
  };

  const decodeJWT = useCallback((token: string) => {
    if (!token) {
      setDecoded({ header: null, payload: null, signature: '', isValid: false, error: null });
      return;
    }

    const parts = token.split('.');
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
        isValid: true,
        error: null,
      });
    } catch (err) {
      setDecoded((prev) => ({ ...prev, error: 'Failed to parse token components', isValid: false }));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => decodeJWT(encodedToken), 300);
    return () => clearTimeout(timer);
  }, [encodedToken, decodeJWT]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SyntaxHighlighter = ({ data, colorClass }: { data: any, colorClass: string }) => (
    <pre className="p-4 font-mono text-sm overflow-x-auto bg-slate-900/50 rounded-lg border border-slate-800">
      {JSON.stringify(data, null, 2).split('\n').map((line, i) => {
        const parts = line.split(':');
        if (parts.length > 1) {
          return (
            <div key={i} className="leading-6">
              <span className="text-slate-500">{parts[0]}:</span>
              <span className={colorClass}>{parts.slice(1).join(':')}</span>
            </div>
          );
        }
        return <div key={i} className="text-slate-400 leading-6">{line}</div>;
      })}
    </pre>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">JWT Debugger</h1>
              <p className="text-slate-400 text-sm">Decode and analyze JSON Web Tokens in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LOCAL DECODING ONLY
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Terminal className="w-4 h-4" />
                    Encoded Token
                  </div>
                  <button 
                    onClick={() => copyToClipboard(encodedToken)}
                    className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <textarea
                  className="w-full h-[500px] p-6 bg-transparent text-indigo-300 font-mono text-sm resize-none focus:outline-none placeholder:text-slate-700"
                  placeholder="Paste your JWT here..."
                  value={encodedToken}
                  onChange={(e) => setEncodedToken(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>

            {decoded.error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {decoded.error}
              </div>
            )}
          </div>

          {/* Decoded Section */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Header</span>
              </div>
              <div className="p-4">
                {decoded.header ? (
                  <SyntaxHighlighter data={decoded.header} colorClass="text-pink-400" />
                ) : (
                  <div className="h-20 flex items-center justify-center text-slate-600 italic text-sm">Waiting for valid token...</div>
                )}
              </div>
            </div>

            {/* Payload */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payload</span>
              </div>
              <div className="p-4">
                {decoded.payload ? (
                  <SyntaxHighlighter data={decoded.payload} colorClass="text-blue-400" />
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-600 italic text-sm">Waiting for valid token...</div>
                )}
              </div>
            </div>

            {/* Signature */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Signature</span>
              </div>
              <div className="p-6">
                <div className="font-mono text-xs break-all text-slate-500 leading-relaxed">
                  {decoded.signature ? (
                    <span className="text-emerald-400/80">HMACSHA256(<br/>
                      &nbsp;&nbsp;base64UrlEncode(header) + "." +<br/>
                      &nbsp;&nbsp;base64UrlEncode(payload),<br/>
                      &nbsp;&nbsp;<span className="text-emerald-300">your-256-bit-secret</span><br/>
                    )</span>
                  ) : (
                    "Signature will appear here"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-900 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} JWT Debugger Professional • Designed for Security Experts</p>
        </footer>
      </div>
    </div>
  );
}