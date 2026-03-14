'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

type StrengthLevel = 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

const SecurePasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const generatePassword = useCallback(() => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let charPool = '';
    if (options.includeUppercase) charPool += charset.uppercase;
    if (options.includeLowercase) charPool += charset.lowercase;
    if (options.includeNumbers) charPool += charset.numbers;
    if (options.includeSymbols) charPool += charset.symbols;

    if (charPool === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    const array = new Uint32Array(options.length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < options.length; i++) {
      generatedPassword += charPool.charAt(array[i] % charPool.length);
    }

    setPassword(generatedPassword);
    setCopied(false);
  }, [options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStrength = (): { level: StrengthLevel; color: string; width: string } => {
    const length = options.length;
    let score = 0;
    if (options.includeUppercase) score++;
    if (options.includeLowercase) score++;
    if (options.includeNumbers) score++;
    if (options.includeSymbols) score++;

    if (length < 8 || score < 2) return { level: 'Weak', color: 'bg-red-500', width: '25%' };
    if (length < 12 || score < 3) return { level: 'Medium', color: 'bg-yellow-500', width: '50%' };
    if (length < 16 || score < 4) return { level: 'Strong', color: 'bg-emerald-500', width: '75%' };
    return { level: 'Very Strong', color: 'bg-blue-500', width: '100%' };
  };

  const strength = getStrength();

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-zinc-100 font-sans">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            Secure Vault
          </h1>
          <p className="text-zinc-500 mt-2 text-sm uppercase tracking-widest font-medium">Professional Password Architect</p>
        </div>

        <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

          {/* Display Area */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative flex items-center justify-between bg-[#09090b] border border-zinc-800 rounded-xl p-5 gap-4 overflow-hidden">
              <input
                type="text"
                readOnly
                value={password}
                className="bg-transparent text-xl md:text-2xl font-mono text-indigo-400 outline-none w-full tracking-wider"
                placeholder="Generating..."
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={generatePassword}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                  title="Regenerate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    copied ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span className="text-xs uppercase">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      <span className="text-xs uppercase">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Strength Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Security Strength</span>
              <span className={`text-xs font-bold uppercase ${strength.color.replace('bg-', 'text-')}`}>
                {strength.level}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-sm font-semibold text-zinc-300">Character Length</label>
                <span className="text-indigo-400 font-mono text-lg">{options.length}</span>
              </div>
              <input
                type="range"
                min="6"
                max="64"
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Uppercase', key: 'includeUppercase' },
                { label: 'Lowercase', key: 'includeLowercase' },
                { label: 'Numbers', key: 'includeNumbers' },
                { label: 'Symbols', key: 'includeSymbols' },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors group"
                >
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{opt.label}</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={options[opt.key as keyof Omit<PasswordOptions, 'length'>]}
                      onChange={(e) => setOptions({ ...options, [opt.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-center gap-2 text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">End-to-End Client Side Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurePasswordGenerator;