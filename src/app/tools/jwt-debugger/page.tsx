'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ShieldCheck, AlertCircle, Cpu, Database, Lock } from 'lucide-react';

interface DecodedJWT {
  header: object | null;
  payload: object | null;
  signature: string | null;
  isValid: boolean;
  error?: string;
}

const DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JWTDebugger() {
  const [token, setToken] = useState<string>(DEFAULT_TOKEN);
  const [decoded, setDecoded] = useState<DecodedJWT>({
    header: null,
    payload: null,
    signature: null,
    isValid: false,
  });
  const [copied, setCopied] = useState(false);

  const base64UrlDecode = (str: string) => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const decodeJWT = useCallback((inputToken: string) => {
    const parts = inputToken.split('.');
    if (parts.length !== 3) {
      setDecoded({
        header: null,
        payload: null,
        signature: null,
        isValid: false,
        error: "Invalid JWT format. A token must consist of three parts separated by dots.",
      });
      return;
    }

    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);
    const signature = parts[2];

    if (!header || !payload) {
      setDecoded({
        header,
        payload,
        signature,
        isValid: false,
        error: "Failed to decode base64 structure.",
      });
      return;
    }

    setDecoded({
      header,
      payload,
      signature,
      isValid: true,
    });
  }, []);

  useEffect(() => {
    decodeJWT(token);
  }, [token, decodeJWT]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CodeBlock = ({ label, data, colorClass, icon: Icon }: { label: string, data: any, colorClass: string, icon: any }) => (
    <div className="flex flex-col w-full mb-6 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colorClass.replace('text-', 'bg-').replace('500', '500/10')}`}>
            <Icon size={16} className={colorClass} />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-400">{label}</span>
        </div>
        <button 
          onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
          className="p-1.5 rounded-md hover:bg-white/5 transition-colors text-slate-500 hover:text-white"
        >
          <Copy size={14} />
        </button>
      </div>
      <div className={`relative p-5 rounded-xl border border-white/5 bg-[#0F1117] font-mono text-sm overflow-hidden`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass.replace('text-', 'bg-')}`} />
        <pre className="text-slate-300 whitespace-pre-wrap break-all">
          {data ? JSON.stringify(data, null, 2) : "// Invalid Data"}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#06080A] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">JWT Debugger</h1>
            </div>
            <p className="text-slate-400 max-w-md">Decode, verify, and analyze JSON Web Tokens with military-grade precision.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</span>
                <span className={`text-sm font-medium ${decoded.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {decoded.isValid ? '✓ Valid Structure' : '✕ Invalid Format'}
                </span>
             </div>
          </div>
        </header>

        <main className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500">Encoded Token</h2>
                <button 
                    onClick={() => copyToClipboard(token)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium transition-all border border-white/10"
                >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy Token'}
                </button>
            </div>
            
            <div className="relative group flex-grow">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-10 group-focus-within:opacity-30 transition duration-500 blur"></div>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                spellCheck={false}
                className="relative w-full h-full min-h-[500px] bg-[#0F1117] border border-white/10 rounded-2xl p-6 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-indigo-100 placeholder-slate-600 resize-none"
                placeholder="Paste your JWT here..."
              />
              
              {!decoded.isValid && token && (
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-md flex items-start gap-3">
                    <AlertCircle className="text-rose-500 mt-0.5" size={18} />
                    <div>
                        <h4 className="text-rose-400 text-sm font-bold">Parsing Error</h4>
                        <p className="text-rose-300/70 text-xs mt-1 leading-relaxed">{decoded.error}</p>
                    </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Decoded */}
          <section className="flex flex-col">
            <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-4">Decoded Output</h2>
            
            <div className="space-y-2">
                <CodeBlock 
                    label="Header" 
                    data={decoded.header} 
                    colorClass="text-rose-500" 
                    icon={Cpu}
                />
                <CodeBlock 
                    label="Payload" 
                    data={decoded.payload} 
                    colorClass="text-purple-500" 
                    icon={Database}
                />
                
                <div className="flex flex-col w-full group">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10">
                            <Lock size={16} className="text-sky-500" />
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Signature</span>
                    </div>
                    <div className="relative p-5 rounded-xl border border-white/5 bg-[#0F1117] font-mono text-xs overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                        <p className="text-sky-400/80 break-all leading-relaxed">
                            {decoded.signature ? (
                                <>
                                    HMACSHA256(<br />
                                    <span className="text-rose-500">base64UrlEncode(header)</span> + "." + <br />
                                    <span className="text-purple-500">base64UrlEncode(payload)</span>, <br />
                                    <span className="text-slate-500">your-256-bit-secret</span><br />
                                    )
                                </>
                            ) : "// No signature found"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                <h3 className="text-sm font-bold text-indigo-300 mb-2">Security Note</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                    This debugger is client-side only. Your token never leaves your browser and is not sent to any server. 
                    Always ensure you are using a secure connection when debugging sensitive data.
                </p>
            </div>
          </section>
        </main>
        
        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-slate-600 font-medium tracking-widest uppercase">
                Enterprise Grade JWT Analysis Tool &bull; v2.0.4
            </p>
        </footer>
      </div>
    </div>
  );
}