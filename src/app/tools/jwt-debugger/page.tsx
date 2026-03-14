'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ShieldAlert, ShieldCheck, Cpu, Database, Key } from 'lucide-react';

interface JWTHeader {
  alg: string;
  typ: string;
  [key: string]: any;
}

interface JWTPayload {
  [key: string]: any;
}

interface DecodedJWT {
  header: JWTHeader | null;
  payload: JWTPayload | null;
  signature: string | null;
  isValid: boolean;
  error: string | null;
}

const DEFAULT_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JWTDebugger() {
  const [input, setInput] = useState<string>(DEFAULT_JWT);
  const [decoded, setDecoded] = useState<DecodedJWT>({
    header: null,
    payload: null,
    signature: null,
    isValid: false,
    error: null,
  });
  const [copied, setCopied] = useState<string | null>(null);

  const base64UrlDecode = (str: string): string | null => {
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
      return null;
    }
  };

  const decodeJWT = useCallback((token: string) => {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      setDecoded({
        header: null,
        payload: null,
        signature: null,
        isValid: false,
        error: "Invalid JWT structure: A JWT must have 3 parts separated by dots.",
      });
      return;
    }

    try {
      const headerJson = base64UrlDecode(parts[0]);
      const payloadJson = base64UrlDecode(parts[1]);

      if (!headerJson || !payloadJson) throw new Error("Invalid encoding");

      setDecoded({
        header: JSON.parse(headerJson),
        payload: JSON.parse(payloadJson),
        signature: parts[2],
        isValid: true,
        error: null,
      });
    } catch (err) {
      setDecoded({
        header: null,
        payload: null,
        signature: null,
        isValid: false,
        error: "Failed to parse JWT content. Ensure the token is Base64Url encoded.",
      });
    }
  }, []);

  useEffect(() => {
    decodeJWT(input);
  }, [input, decodeJWT]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const SyntaxHighlightedJson = ({ data }: { data: any }) => (
    <pre className="text-sm font-mono leading-relaxed overflow-x-auto p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
      {JSON.stringify(data, null, 2).split('\n').map((line, i) => {
        const isKey = line.includes('":');
        return (
          <div key={i} className="whitespace-pre">
            {isKey ? (
              <>
                <span className="text-indigo-400">{line.split(':')[0]}</span>
                <span className="text-zinc-400">:</span>
                <span className="text-emerald-400">{line.split(':')[1]}</span>
              </>
            ) : (
              <span className="text-zinc-300">{line}</span>
            )}
          </div>
        );
      })}
    </pre>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Cpu size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              JWT <span className="text-indigo-500">Debugger</span>
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            A premium tool for decoding and analyzing JSON Web Tokens. Secure, client-side only processing for your sensitive data.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Encoded Token</span>
                  <button 
                    onClick={() => copyToClipboard(input, 'input')}
                    className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400"
                  >
                    {copied === 'input' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your JWT here..."
                  className="w-full h-[500px] p-6 bg-transparent text-indigo-300 font-mono text-sm leading-relaxed focus:outline-none resize-none scrollbar-thin scrollbar-thumb-zinc-700"
                />
              </div>
            </div>

            {decoded.error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <ShieldAlert className="shrink-0" size={18} />
                <p>{decoded.error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Block */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-pink-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-pink-500">Header</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Algorithm & Token Type</span>
              </div>
              <div className="p-5">
                {decoded.header ? (
                  <SyntaxHighlightedJson data={decoded.header} />
                ) : (
                  <div className="h-20 flex items-center justify-center text-zinc-600 italic text-sm">Waiting for valid token...</div>
                )}
              </div>
            </div>

            {/* Payload Block */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Payload</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Data / Claims</span>
              </div>
              <div className="p-5">
                {decoded.payload ? (
                  <SyntaxHighlightedJson data={decoded.payload} />
                ) : (
                  <div className="h-40 flex items-center justify-center text-zinc-600 italic text-sm">Waiting for valid token...</div>
                )}
              </div>
            </div>

            {/* Signature Block */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Signature</span>
                </div>
                {decoded.isValid ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase">
                    <ShieldCheck size={12} /> Structure Valid
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase">
                    <ShieldAlert size={12} /> Unverified
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50 font-mono text-xs break-all text-emerald-500/70">
                  {decoded.signature || "No signature detected"}
                </div>
                <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed italic">
                  Note: This tool decodes the Base64 content. To verify the cryptographic signature, the server's private key or secret would be required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Client-side Processing
            </span>
            <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> No Data Logging
            </span>
          </div>
          <p>© {new Date().getFullYear()} JWT Debugger Professional. Built for developers.</p>
        </footer>
      </div>

      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}