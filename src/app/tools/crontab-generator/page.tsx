'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface CronState {
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
}

interface Preset {
  label: string;
  value: CronState;
}

const PRESETS: Preset[] = [
  { label: 'Every Minute', value: { minute: '*', hour: '*', dom: '*', month: '*', dow: '*' } },
  { label: 'Every Hour', value: { minute: '0', hour: '*', dom: '*', month: '*', dow: '*' } },
  { label: 'Every Day (Midnight)', value: { minute: '0', hour: '0', dom: '*', month: '*', dow: '*' } },
  { label: 'Every Sunday', value: { minute: '0', hour: '0', dom: '*', month: '*', dow: '0' } },
  { label: 'Every Month (1st)', value: { minute: '0', hour: '0', dom: '1', month: '*', dow: '*' } },
];

const CrontabGenerator: React.FC = () => {
  const [cron, setCron] = useState<CronState>({
    minute: '*',
    hour: '*',
    dom: '*',
    month: '*',
    dow: '*',
  });
  const [copied, setCopied] = useState(false);

  const cronString = useMemo(() => {
    return `${cron.minute} ${cron.hour} ${cron.dom} ${cron.month} ${cron.dow}`;
  }, [cron]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateField = (field: keyof CronState, value: string) => {
    setCron((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            Crontab Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Create precise schedule expressions for your automation tasks.
          </p>
        </header>

        {/* Presets */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setCron(preset.value)}
              className="px-4 py-2 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all text-sm font-medium text-slate-300"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Main Generator UI */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <CronInput
            label="Minute"
            value={cron.minute}
            onChange={(v) => updateField('minute', v)}
            placeholder="0-59, *"
            description="0-59"
          />
          <CronInput
            label="Hour"
            value={cron.hour}
            onChange={(v) => updateField('hour', v)}
            placeholder="0-23, *"
            description="0-23"
          />
          <CronInput
            label="Day (Month)"
            value={cron.dom}
            onChange={(v) => updateField('dom', v)}
            placeholder="1-31, *"
            description="1-31"
          />
          <CronInput
            label="Month"
            value={cron.month}
            onChange={(v) => updateField('month', v)}
            placeholder="1-12, *"
            description="1-12 or JAN-DEC"
          />
          <CronInput
            label="Day (Week)"
            value={cron.dow}
            onChange={(v) => updateField('dow', v)}
            placeholder="0-6, *"
            description="0-6 (Sun-Sat)"
          />
        </div>

        {/* Output Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 block">
                Generated Cron Expression
              </span>
              <code className="text-3xl md:text-5xl font-mono font-bold text-white tracking-tighter">
                {cronString}
              </code>
            </div>
            
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all transform active:scale-95 ${
                copied 
                ? 'bg-emerald-500 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Expression
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tip Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <h3 className="text-indigo-400 font-bold mb-2">Wildcards</h3>
            <p className="text-slate-400">Use <span className="text-slate-200">*</span> to represent every possible value for that field.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <h3 className="text-cyan-400 font-bold mb-2">Ranges</h3>
            <p className="text-slate-400">Use <span className="text-slate-200">-</span> to define ranges, e.g., <span className="text-slate-200">1-5</span> for Mon-Fri.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <h3 className="text-emerald-400 font-bold mb-2">Steps</h3>
            <p className="text-slate-400">Use <span className="text-slate-200">/</span> to specify increments, e.g., <span className="text-slate-200">*/15</span> for every 15 mins.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CronInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  description: string;
}

const CronInput: React.FC<CronInputProps> = ({ label, value, onChange, placeholder, description }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
      />
      <span className="text-[10px] text-slate-600 ml-1 italic">{description}</span>
    </div>
  );
};

export default CrontabGenerator;