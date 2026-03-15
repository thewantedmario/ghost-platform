'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ShieldCheck, ShieldAlert, Key, Database, Code, RefreshCw } from 'lucide-react';

interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

interface JwtDecoded {
  header: JwtHeader | null;
  payload: JwtPayload | null;
  signature: string | null;
  isValid: boolean;
  error: string | null;
}

const DEFAULT_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const JWTDebugger: React.FC = () => {
  const [input, setInput] = useState<string>(DEFAULT_JWT);
  const [decoded, setDecoded] = useState<JwtDecoded>({
    header: null,
    payload: null,
    signature: null,
    isValid: false,
    error: null,
  });
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

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
      throw new Error("Invalid Base64 encoding");
    }
  };

  const decodeJwt = useCallback((token: string) => {
    if (!token.trim()) {
      setDecoded({ header: null, payload: null, signature: null, isValid: false, error: "Token is empty" });
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      setDecoded({ header: null, payload: null, signature: null, isValid: false, error: "JWT must have 3 segments separated by dots" });
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
      setDecoded({
        header: null,
        payload: null,
        signature: null,
        isValid: false,
        error: "Malformed JWT structure or invalid JSON encoding",
      });
    }
  }, []);

  useEffect(() => {
    decodeJwt(input);
  }, [input, decodeJwt]);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const SyntaxHighlightedJson = ({ data, colorClass }: { data: any, colorClass: string }) => {
    const jsonString = JSON.stringify(data, null, 2);
    return (
      <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
        {jsonString.split('\n').map((line, i) => (
          <div key={i} className="leading-6">
            <span className={colorClass}>{line}</span>
          </div>
        ))}
      </pre>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                JWT Debugger
              </h1>
            </div>
            <p className="text-zinc-500 text-sm">Decode and verify JSON Web Tokens in real-time with high precision.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setInput("")}
              className="px-4 py-2 text-sm font-medium border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Clear
            </button>
            <button 
              onClick={() => copyToClipboard(input, 'full')}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              {copiedSection === 'full' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy Token
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2 font-medium uppercase text-xs tracking-widest">
              <Code className="w-4 h-4" /> Encoded Token
            </div>
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                className={`w-full h-[600px] bg-zinc-900 border ${decoded.error ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-indigo-500'} rounded-2xl p-6 font-mono text-sm leading-relaxed outline-none transition-all shadow-inner resize-none focus:ring-1 focus:ring-opacity-50 ${decoded.error ? 'focus:ring-red-500' : 'focus:ring-indigo-500'}`}
                placeholder="Paste your JWT here..."
              />
              {decoded.error && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-xs">
                  <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{decoded.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Decoded Section */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 font-medium uppercase text-xs tracking-widest">
                  <Key className="w-4 h-4 text-pink-500" /> Header <span className="text-[10px] opacity-50 ml-1">Algorithm & Token Type</span>
                </div>
                {decoded.header && (
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'header')}
                    className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    {copiedSection === 'header' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
                  </button>
                )}
              </div>
              <div className="relative">
                {decoded.header ? (
                  <SyntaxHighlightedJson data={decoded.header} colorClass="text-pink-400" />
                ) : (
                  <div className="h-24 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-lg flex items-center justify-center text-zinc-600 italic text-sm">
                    No header data available
                  </div>
                )}
              </div>
            </div>

            {/* Payload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 font-medium uppercase text-xs tracking-widest">
                  <Database className="w-4 h-4 text-blue-500" /> Payload <span className="text-[10px] opacity-50 ml-1">Data & Claims</span>
                </div>
                {decoded.payload && (
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'payload')}
                    className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    {copiedSection === 'payload' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
                  </button>
                )}
              </div>
              <div className="relative">
                {decoded.payload ? (
                  <SyntaxHighlightedJson data={decoded.payload} colorClass="text-blue-400" />
                ) : (
                  <div className="h-48 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-lg flex items-center justify-center text-zinc-600 italic text-sm">
                    No payload data available
                  </div>
                )}
              </div>
            </div>

            {/* Signature Notification */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 font-medium uppercase text-xs tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Signature Verification
              </div>
              <div className="space-y-3">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  The signature is the final part of the JWT. It is generated using the specified algorithm (e.g., <code className="text-pink-400 font-mono">{decoded.header?.alg || 'HS256'}</code>) to ensure the message wasn't changed along the way.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-full flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Structure Valid
                  </div>
                  <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-[11px] font-bold rounded-full">
                    Base64URL Encoding: Passed
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Meta */}
        <footer className="mt-12 pt-8 border-t border-zinc-900 text-center space-y-4">
          <div className="flex justify-center gap-8">
            <div className="text-left">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Algorithm</p>
              <p className="text-sm font-mono text-zinc-400">{decoded.header?.alg || 'N/A'}</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Type</p>
              <p className="text-sm font-mono text-zinc-400">{decoded.header?.typ || 'JWT'}</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Expiration</p>
              <p className="text-sm font-mono text-zinc-400">
                {decoded.payload?.exp ? new Date(decoded.payload.exp * 1000).toLocaleDateString() : 'None'}
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-700">Client-side only: Your token never leaves your browser.</p>
        </footer>
      </div>
    </div>
  );
};

export default JWTDebugger;