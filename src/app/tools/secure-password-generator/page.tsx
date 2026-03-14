'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Copy, RefreshCw, Check, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';

interface PasswordConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

interface StrengthMetadata {
  label: string;
  color: string;
  width: string;
  score: number;
}

const SecurePasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [config, setConfig] = useState<PasswordConfig>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charSet = '';
    if (config.includeUppercase) charSet += uppercase;
    if (config.includeLowercase) charSet += lowercase;
    if (config.includeNumbers) charSet += numbers;
    if (config.includeSymbols) charSet += symbols;

    if (charSet === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    const array = new Uint32Array(config.length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < config.length; i++) {
      generatedPassword += charSet[array[i] % charSet.length];
    }

    setPassword(generatedPassword);
  }, [config]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateStrength = (): StrengthMetadata => {
    let score = 0;
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) score++;

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%', score };
    if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', width: '66%', score };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%', score };
  };

  const strength = calculateStrength();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans antialiased text-slate-200">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-indigo-500/10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">VaultGen</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Secure Key Provisioning</p>
          </div>
        </div>

        {/* Display Area */}
        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between overflow-hidden">
            <span className="text-xl font-mono text-indigo-100 truncate pr-4">
              {password || 'Select options...'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={generatePassword}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Regenerate"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  copied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Strength Meter */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Level</span>
            <span className={`text-xs font-bold uppercase ${strength.color.replace('bg-', 'text-')}`}>
              {strength.label}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${strength.color}`}
              style={{ width: strength.width }}
            ></div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-4">
              <label className="text-sm font-medium text-slate-300">Length</label>
              <span className="text-sm font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md">
                {config.length}
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={config.length}
              onChange={(e) => setConfig({ ...config, length: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'uppercase', label: 'Uppercase', key: 'includeUppercase' },
              { id: 'lowercase', label: 'Lowercase', key: 'includeLowercase' },
              { id: 'numbers', label: 'Numbers', key: 'includeNumbers' },
              { id: 'symbols', label: 'Symbols', key: 'includeSymbols' },
            ].map((option) => (
              <label
                key={option.id}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
              >
                <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                  {option.label}
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[option.key as keyof PasswordConfig] as boolean}
                    onChange={(e) =>
                      setConfig({ ...config, [option.key]: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3 text-slate-500">
            {strength.score > 4 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
            ) : (
                <ShieldAlert className="w-4 h-4 text-amber-500" />
            )}
            <p className="text-[10px] leading-tight uppercase tracking-tight font-medium">
                {strength.score > 4 
                    ? "End-to-end entropy validated. This password exceeds standard security protocols."
                    : "Low entropy detected. Consider increasing length and including special characters."}
            </p>
        </div>
      </div>
    </div>
  );
};

export default SecurePasswordGenerator;