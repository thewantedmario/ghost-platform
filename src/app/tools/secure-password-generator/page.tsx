'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, ShieldCheck, ShieldAlert, Shield, Lock, Check } from 'lucide-react';

interface PasswordSettings {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const SecurePasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [strength, setStrength] = useState<{ label: string; color: string; percent: number }>({
    label: 'Weak',
    color: 'bg-red-500',
    percent: 25,
  });

  const [settings, setSettings] = useState<PasswordSettings>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = useCallback(() => {
    const charset: Record<string, string> = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    let availableChars = '';
    if (settings.uppercase) availableChars += charset.uppercase;
    if (settings.lowercase) availableChars += charset.lowercase;
    if (settings.numbers) availableChars += charset.numbers;
    if (settings.symbols) availableChars += charset.symbols;

    if (availableChars === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    const array = new Uint32Array(settings.length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < settings.length; i++) {
      generatedPassword += availableChars.charAt(array[i] % availableChars.length);
    }

    setPassword(generatedPassword);
  }, [settings]);

  const calculateStrength = useCallback(() => {
    let score = 0;
    if (settings.length > 12) score += 1;
    if (settings.length > 18) score += 1;
    if (settings.uppercase) score += 1;
    if (settings.lowercase) score += 1;
    if (settings.numbers) score += 1;
    if (settings.symbols) score += 1;

    if (score <= 2) {
      setStrength({ label: 'Weak', color: 'bg-rose-500', percent: 25 });
    } else if (score <= 4) {
      setStrength({ label: 'Moderate', color: 'bg-amber-500', percent: 50 });
    } else if (score <= 5) {
      setStrength({ label: 'Strong', color: 'bg-emerald-500', percent: 75 });
    } else {
      setStrength({ label: 'Unbreakable', color: 'bg-indigo-500', percent: 100 });
    }
  }, [settings]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    calculateStrength();
  }, [calculateStrength]);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const toggleSetting = (key: keyof Omit<PasswordSettings, 'length'>) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans antialiased text-slate-200">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ShieldGen</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Enterprise Security</p>
          </div>
        </div>

        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between overflow-hidden">
            <div className="text-xl font-mono truncate mr-4 text-indigo-100 tracking-wider">
              {password || 'Select options...'}
            </div>
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

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-4 items-end">
              <span className="text-sm font-semibold text-slate-400">Password Length</span>
              <span className="text-2xl font-bold text-indigo-400">{settings.length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="50"
              value={settings.length}
              onChange={(e) => setSettings({ ...settings, length: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'uppercase', label: 'Uppercase', icon: 'ABC' },
              { key: 'lowercase', label: 'Lowercase', icon: 'abc' },
              { key: 'numbers', label: 'Numbers', icon: '123' },
              { key: 'symbols', label: 'Symbols', icon: '#@&' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => toggleSetting(option.key as keyof Omit<PasswordSettings, 'length'>)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  settings[option.key as keyof PasswordSettings]
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{option.label}</span>
                <span className="text-[10px] font-mono opacity-60">{option.icon}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {strength.percent <= 25 ? (
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                ) : strength.percent >= 75 ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Shield className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Security Strength</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${strength.color} bg-opacity-10 text-opacity-100 ${strength.color.replace('bg-', 'text-')}`}>
                {strength.label}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${strength.color}`}
                style={{ width: `${strength.percent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
            Cryptographically secure generation using Web Crypto API.<br />
            No data ever leaves your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurePasswordGenerator;