'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ShieldCheck, ShieldAlert, Terminal, Cpu, Lock, Database } from 'lucide-react';

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
  signature: string | null;
  isValid: boolean;
  error: string | null;
}

const JWTDebugger: React.FC = () => {
  const [encodedToken, setEncodedToken] = useState<string>('');
  const [decoded, setDecoded] = useState<JWTState>({
    header: null,
    payload: null,
    signature: null,
    isValid: false,
    error: null,
  });
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decodeToken = useCallback((token: string) => {
    if (!token) {
      setDecoded({ header: null, payload: null, signature: null, isValid: false, error: null });
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      setDecoded((prev) => ({ ...prev, isValid: false, error: 'Invalid JWT format: Must have 3 parts' }));
      return;
    }

    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];

      setDecoded({
        header,
        payload,
        signature,
        isValid: true,
        error: null,
      });
    } catch (err) {
      setDecoded((prev) => ({ ...prev, isValid: false, error: 'Failed to decode: Invalid Base64 or JSON' }));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => decodeToken(encodedToken), 300);
    return () => clearTimeout(timer);
  }, [encodedToken, decodeToken]);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatTimestamp = (ts: number | undefined) => {
    if (!ts) return 'N/A';
    return new Date(ts * 1000).toLocaleString();
  };

  const isExpired = (exp?: number) => {
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 tracking-tight">
              JWT Debugger Pro
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Secure, client-side JSON Web Token inspector</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${decoded.isValid ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
              {decoded.isValid ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              {decoded.isValid ? 'VALID STRUCTURE' : 'INVALID STRUCTURE'}
            </div>
            <button 
              onClick={() => setEncodedToken('')}
              className="text-xs font-bold px-3 py-1 rounded-full border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              CLEAR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <div className="relative bg-[#111114] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Encoded Token</span>
                  </div>
                </div>
                <textarea
                  value={encodedToken}
                  onChange={(e) => setEncodedToken(e.target.value)}
                  placeholder="Paste your JWT here..."
                  className="w-full h-[500px] bg-transparent p-6 text-sm font-mono leading-relaxed focus:outline-none resize-none text-indigo-300 placeholder:text-slate-700"
                />
              </div>
            </div>
            
            {decoded.error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                <ShieldAlert size={18} className="shrink-0" />
                <span>{decoded.error}</span>
              </div>
            )}
          </div>

          {/* Decoded Section */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Block */}
            <div className="relative bg-[#111114] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-pink-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Header</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'header')}
                  className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-slate-500"
                >
                  {copiedSection === 'header' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="p-6">
                <pre className="text-sm font-mono text-pink-300">
                  {decoded.header ? JSON.stringify(decoded.header, null, 2) : '// No header data'}
                </pre>
              </div>
            </div>

            {/* Payload Block */}
            <div className="relative bg-[#111114] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payload</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'payload')}
                  className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-slate-500"
                >
                  {copiedSection === 'payload' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="p-6">
                <pre className="text-sm font-mono text-cyan-300">
                  {decoded.payload ? JSON.stringify(decoded.payload, null, 2) : '// No payload data'}
                </pre>
                
                {decoded.payload && (
                  <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Issued At</p>
                      <p className="text-xs text-slate-300">{formatTimestamp(decoded.payload.iat)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Expiration</p>
                      <p className={`text-xs ${isExpired(decoded.payload.exp) ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatTimestamp(decoded.payload.exp)}
                        {isExpired(decoded.payload.exp) && ' (Expired)'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Block */}
            <div className="relative bg-[#111114] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Signature</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-mono break-all text-slate-500 leading-relaxed">
                  {decoded.signature ? (
                    <>
                      HMACSHA256(<br />
                      &nbsp;&nbsp;base64UrlEncode(header) + "." +<br />
                      &nbsp;&nbsp;base64UrlEncode(payload),<br />
                      &nbsp;&nbsp;<span className="text-emerald-400/80">your-256-bit-secret</span><br />
                      )
                    </>
                  ) : '// No signature detected'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 text-xs uppercase tracking-[0.2em] font-medium">
            Tokens are never stored or sent to any server
          </p>
        </div>
      </div>

      <style jsx global>{`
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: #1e1e24;
          border-radius: 10px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background: #2d2d35;
        }
      `}</style>
    </div>
  );
};

export default JWTDebugger;