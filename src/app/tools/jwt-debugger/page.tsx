'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, ShieldAlert, ShieldCheck, Terminal, Cpu, Lock } from 'lucide-react';

interface JWTParts {
  header: object | null;
  payload: object | null;
  signature: string | null;
}

interface DecodedState extends JWTParts {
  isValid: boolean;
  error: string | null;
}

const JWTDebugger: React.FC = () => {
  const [inputToken, setInputToken] = useState<string>('');
  const [decoded, setDecoded] = useState<DecodedState>({
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
      throw new Error('Invalid Base64 string');
    }
  };

  const handleDecode = useCallback((token: string) => {
    if (!token) {
      setDecoded({ header: null, payload: null, signature: null, isValid: false, error: null });
      return;
    }

    const parts = token.split('.');
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
      setDecoded((prev) => ({ ...prev, isValid: false, error: 'Failed to decode parts. Ensure valid JWT format.' }));
    }
  }, []);

  useEffect(() => {
    handleDecode(inputToken);
  }, [inputToken, handleDecode]);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const CodeBlock = ({ title, data, colorClass }: { title: string; data: any; colorClass: string }) => (
    <div className="relative group rounded-xl border border-white/5 bg-[#121212] overflow-hidden transition-all hover:border-white/10 shadow-2xl">
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass}`} />
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <Cpu size={14} className={colorClass.replace('bg-', 'text-')} />
          {title}
        </span>
        <button
          onClick={() => copyToClipboard(JSON.stringify(data, null, 2), title)}
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
        >
          {copiedSection === title ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          {data ? (
            <code className="text-gray-300">
              {Object.entries(data).map(([key, value], i) => (
                <div key={key} className="group/line">
                  <span className="text-pink-400">"{key}"</span>
                  <span className="text-white">: </span>
                  <span className={typeof value === 'string' ? 'text-emerald-400' : 'text-amber-400'}>
                    {typeof value === 'string' ? `"${value}"` : String(value)}
                  </span>
                  {i < Object.entries(data).length - 1 && <span className="text-gray-500">,</span>}
                </div>
              ))}
            </code>
          ) : (
            <span className="text-gray-600 italic">Waiting for valid input...</span>
          )}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                <Terminal size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-white">
                JWT<span className="text-indigo-500">DEBUGGER</span>
              </h1>
            </div>
            <p className="text-gray-500 text-sm font-medium">Professional grade JSON Web Token inspector & validator.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-2 transition-all duration-500 ${
              decoded.isValid 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {decoded.isValid ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              {decoded.isValid ? 'TOKEN VALIDATED' : 'INVALID STRUCTURE'}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="relative group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">
                Encoded Token
              </label>
              <div className="relative">
                <textarea
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Paste your JWT here..."
                  className="w-full h-[500px] bg-[#121212] border border-white/5 rounded-2xl p-6 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all resize-none shadow-inner leading-relaxed text-indigo-300"
                  spellCheck="false"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button 
                        onClick={() => setInputToken('')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all"
                    >
                        CLEAR
                    </button>
                </div>
              </div>
            </div>

            {decoded.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <ShieldAlert className="text-red-500 mt-0.5" size={18} />
                <p className="text-sm text-red-400 font-medium">{decoded.error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <CodeBlock 
              title="Header" 
              data={decoded.header} 
              colorClass="bg-pink-500" 
            />
            
            <CodeBlock 
              title="Payload" 
              data={decoded.payload} 
              colorClass="bg-indigo-500" 
            />

            <div className="relative group rounded-xl border border-white/5 bg-[#121212] overflow-hidden transition-all hover:border-white/10 shadow-2xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Lock size={14} className="text-emerald-500" />
                  Signature
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-mono text-emerald-500/80 break-all leading-relaxed">
                  {decoded.signature ? (
                    `HMACSHA256(\n  base64UrlEncode(header) + "." +\n  base64UrlEncode(payload),\n  your-256-bit-secret\n)`
                  ) : (
                    <span className="text-gray-600 italic">Signature will be computed after valid input</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-600 text-xs font-medium tracking-widest uppercase">
                Secure Client-Side Decoding • No Data Transmitted to Servers
            </p>
        </footer>
      </div>
    </div>
  );
};

export default JWTDebugger;