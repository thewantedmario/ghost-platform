'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const SecurePasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState<{ score: number; label: string; color: string; icon?: React.ReactNode }>({ score: 0, label: '', color: '', icon: undefined });

  const generatePassword = useCallback(() => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let characters = '';
    if (options.uppercase) characters += charset.uppercase;
    if (options.lowercase) characters += charset.lowercase;
    if (options.numbers) characters += charset.numbers;
    if (options.symbols) characters += charset.symbols;

    if (characters === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      generatedPassword += characters.charAt(array[i] % characters.length);
    }

    setPassword(generatedPassword);
  }, [length, options]);

  const calculateStrength = useCallback(() => {
    let score = 0;
    if (length > 12) score += 1;
    if (length > 18) score += 1;
    if (options.uppercase && options.lowercase) score += 1;
    if (options.numbers) score += 1;
    if (options.symbols) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', icon: <ShieldAlert className="w-4 h-4" /> };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500', icon: <Shield className="w-4 h-4" /> };
    if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500', icon: <ShieldCheck className="w-4 h-4" /> };
    return { score, label: 'Very Strong', color: 'bg-indigo-500', icon: <ShieldCheck className="w-4 h-4" /> };
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    setStrength(calculateStrength());
  }, [password, calculateStrength]);

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans antialiased text-slate-200">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-2">
            Secure Gen
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Enterprise Grade Encryption Tools</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Display Section */}
          <div className="relative mb-8">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center justify-between group-hover:border-slate-700 transition-colors">
              <span className="text-xl md:text-2xl font-mono truncate mr-4 text-indigo-100 tracking-wider">
                {password || 'Select options...'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={generatePassword}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all active:scale-95"
                  title="Regenerate"
                >
                  <RefreshCw size={20} />
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 ${
                    copied 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            {/* Strength Indicator */}
            <div className="mt-4 flex items-center gap-4 px-1">
              <div className="flex-1 h-1.5 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-500 ${
                      step <= strength.score ? strength.color : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider min-w-[100px] justify-end">
                {strength.icon && <span style={{ color: strength.color.replace('bg-', 'text-') }}>{strength.icon}</span>}
                <span className="text-slate-400">{strength.label}</span>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-8">
            {/* Length Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Password Length</label>
                <span className="text-3xl font-mono font-bold text-indigo-400">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="50"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => toggleOption(key as keyof typeof options)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                    value 
                    ? 'bg-indigo-500/5 border-indigo-500/40 text-indigo-100' 
                    : 'bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-medium capitalize">{key}</span>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    value ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent border-slate-700'
                  }`}>
                    {value && <Check size={14} className="text-white stroke-[3px]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-slate-600 text-xs">
          Securely generated in-browser using Cryptographically Strong Pseudo-Random Number Generator (CSPRNG).
        </p>
      </div>

      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #6366f1;
          border: 4px solid #1e293b;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
          transition: all 0.2s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: #818cf8;
        }
      `}</style>
    </div>
  );
};

export default SecurePasswordGenerator;