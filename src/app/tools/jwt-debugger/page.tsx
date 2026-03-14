'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Copy, Check, AlertCircle, Cpu, Lock, Unlock, Clock, Key } from 'lucide-react';

interface JWTHeader {
  alg: string;
  typ?: string;
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
  const [input, setInput] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedJWT>({
    header: null,
    payload: null,
    signature: null,
    isValid: false,
    error: null,
  });
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decodeBase64 = (str: string): any => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleDecode = useCallback((token: string) => {
    if (!token) {
      setDecoded({ header: null, payload: null, signature: null, isValid: false, error: null });
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      setDecoded({
        header: null,
        payload: null,
        signature: null,
        isValid: false,
        error: 'Invalid JWT structure. A JWT must consist of three parts separated by dots.',
      });
      return;
    }

    const header = decodeBase64(parts[0]);
    const payload = decodeBase64(parts[1]);
    const signature = parts[2];

    if (!header || !payload) {
      setDecoded({
        header,
        payload,
        signature,
        isValid: false,
        error: 'Failed to decode Base64Url content.',
      });
      return;
    }

    setDecoded({
      header,
      payload,
      signature,
      isValid: true,
      error: null,
    });
  }, []);

  useEffect(() => {
    handleDecode(input);
  }, [input, handleDecode]);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const SyntaxHighlighter = ({ data, title, section }: { data: any, title: string, section: string }) => (
    <div className="group relative rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 overflow-hidden transition-all hover:border-zinc-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          {title}
        </h3>
        <button
          onClick={() => copyToClipboard(JSON.stringify(data, null, 2), section)}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          {copiedSection === section ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="font-mono text-sm leading-relaxed overflow-x-auto custom-scrollbar">
        {Object.entries(data || {}).map(([key, value], i) => (
          <div key={i} className="flex gap-2">
            <span className="text-purple-400">"{key}"</span>
            <span className="text-zinc-500">:</span>
            <span className={typeof value === 'string' ? 'text-emerald-400' : 'text-orange-400'}>
              {typeof value === 'string' ? `"${value}"` : JSON.stringify(value)}
            </span>
            {i < Object.entries(data).length - 1 && <span className="text-zinc-500">,</span>}
          </div>
        ))}
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                JWT Debugger
              </h1>
            </div>
            <p className="text-zinc-500 font-medium">Professional grade JSON Web Token inspector & validator.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-2xl">
            <div className="px-4 py-2 rounded-xl bg-zinc-800/50 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${decoded.isValid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`} />
              <span className="text-sm font-semibold">{decoded.isValid ? 'VALID FORMAT' : 'READY'}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-zinc-700 to-zinc-900 rounded-2xl opacity-50 transition-opacity group-focus-within:opacity-100" />
              <div className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/30">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5" /> Encoded Token
                  </span>
                  <button 
                    onClick={() => setInput('')}
                    className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
                  >
                    CLEAR
                  </button>
                </div>
                <textarea
                  className="w-full h-[500px] bg-transparent p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700 text-blue-400"
                  placeholder="Paste your JWT here..."
                  spellCheck="false"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            </div>

            {decoded.error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{decoded.error}</p>
              </div>
            )}
          </div>

          {/* Decoded Section */}
          <div className="lg:col-span-7 space-y-6">
            {!decoded.isValid && !decoded.error ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 space-y-4">
                <div className="p-4 rounded-full bg-zinc-900">
                  <Unlock className="w-8 h-8" />
                </div>
                <p className="font-medium">Waiting for valid token input...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header Section */}
                {decoded.header && (
                  <SyntaxHighlighter 
                    data={decoded.header} 
                    title="Header" 
                    section="header" 
                  />
                )}

                {/* Payload Section */}
                {decoded.payload && (
                  <div className="space-y-4">
                    <SyntaxHighlighter 
                      data={decoded.payload} 
                      title="Payload" 
                      section="payload" 
                    />
                    
                    {/* Token Insights Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-zinc-800">
                          <Clock className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Expiration (exp)</p>
                          <p className="text-sm font-mono text-zinc-300">{formatTimestamp(decoded.payload.exp)}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-zinc-800">
                          <Clock className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Issued At (iat)</p>
                          <p className="text-sm font-mono text-zinc-300">{formatTimestamp(decoded.payload.iat)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signature Verification Mockup */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> Signature
                    </span>
                    <span className="text-xs font-mono text-zinc-600">HMACSHA256</span>
                  </div>
                  <div className="p-6">
                    <div className="bg-zinc-950 rounded-lg p-4 font-mono text-sm break-all text-zinc-500 border border-zinc-800/50">
                      {decoded.signature || 'No signature detected'}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 italic">
                      <Key className="w-3.5 h-3.5" />
                      <span>Signature is encoded. Secret verification requires server-side validation.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default JWTDebugger;