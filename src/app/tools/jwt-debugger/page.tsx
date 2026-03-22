'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ShieldCheck, AlertCircle, Terminal, Key, Database, Cpu } from 'lucide-react';

interface JWTHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
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
  const [token, setToken] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedJWT>({
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
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return jsonPayload;
    } catch (e) {
      throw new Error('Invalid Base64 encoding');
    }
  };

  const handleDecode = useCallback((inputToken: string) => {
    if (!inputToken.trim()) {
      setDecoded({ header: null, payload: null, signature: null, isValid: false, error: null });
      return;
    }

    const parts = inputToken.split('.');
    if (parts.length !== 3) {
      setDecoded((prev) => ({ ...prev, isValid: false, error: 'JWT must have 3 parts separated by dots' }));
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
      setDecoded((prev) => ({ ...prev, isValid: false, error: 'Failed to decode token segments' }));
    }
  }, []);

  useEffect(() => {
    handleDecode(token);
  }, [token, handleDecode]);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const getTokenColor = (part: number) => {
    if (part === 0) return 'text-rose-400';
    if (part === 1) return 'text-violet-400';
    return 'text-sky-400';
  };

  const JsonDisplay = ({ data, title, icon: Icon, colorClass }: { data: any, title: string, icon: any, colorClass: string }) => (
    <div className="group relative flex flex-col w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Icon size={16} className={colorClass} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
        </div>
        <button
          onClick={() => copyToClipboard(JSON.stringify(data, null, 2), title)}
          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-500 hover:text-white"
        >
          {copiedSection === title ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-auto max-h-[300px] font-mono text-sm leading-relaxed">
        <pre className="text-slate-300">
          {data ? JSON.stringify(data, null, 2) : <span className="text-slate-600 italic">// No data available</span>}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
              JWT Debugger
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Inspect, decode and verify JSON Web Tokens with a secure, client-side only interface. 
            All processing happens locally in your browser.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
              <div className="relative flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Encoded Token</span>
                  </div>
                  {decoded.isValid && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Valid Format
                    </span>
                  )}
                </div>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your JWT here (header.payload.signature)"
                  className="w-full h-[500px] p-6 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder:text-slate-700 leading-relaxed break-all"
                  spellCheck={false}
                />
              </div>
            </div>

            {decoded.error && (
              <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle className="text-rose-500 shrink-0" size={18} />
                <p className="text-sm text-rose-200/80">{decoded.error}</p>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <JsonDisplay 
              data={decoded.header} 
              title="Header" 
              icon={Cpu} 
              colorClass="text-rose-400" 
            />
            
            <JsonDisplay 
              data={decoded.payload} 
              title="Payload" 
              icon={Database} 
              colorClass="text-violet-400" 
            />

            <div className="flex flex-col w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Signature</span>
                </div>
              </div>
              <div className="p-5 font-mono text-xs">
                {decoded.signature ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg break-all text-sky-400/80">
                      HMACSHA256(
                        base64UrlEncode(header) + "." +
                        base64UrlEncode(payload),
                        <span className="text-slate-500 italic">your-256-bit-secret</span>
                      )
                    </div>
                    <div className="text-slate-500 text-[10px] leading-relaxed">
                      Signature is used to verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way.
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-600 italic">No signature detected</span>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} JWT Debugger — Professional Grade Security Tool</p>
          <div className="flex gap-6">
            <span className="hover:text-indigo-400 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-indigo-400 cursor-pointer transition-colors">RFC 7519</span>
            <span className="hover:text-indigo-400 cursor-pointer transition-colors">Privacy</span>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
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

export default JWTDebugger;