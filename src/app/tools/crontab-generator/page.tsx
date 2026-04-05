'use client';

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Clock, Calendar, Hash, Info, RefreshCw } from 'lucide-react';

interface CronValue {
  value: string;
  label: string;
}

interface CronState {
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
}

const PRESETS = [
  { label: 'Every Minute', value: '* * * * *' },
  { label: 'Every Hour', value: '0 * * * *' },
  { label: 'Every Day at Midnight', value: '0 0 * * *' },
  { label: 'Every Sunday at Midnight', value: '0 0 * * 0' },
  { label: 'First Day of Month at Midnight', value: '0 0 1 * *' },
  { label: 'Every Weekday at 9 AM', value: '0 9 * * 1-5' },
];

export default function CrontabGenerator() {
  const [cron, setCron] = useState<CronState>({
    minute: '*',
    hour: '*',
    dom: '*',
    month: '*',
    dow: '*',
  });
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState('');

  const fullCronString = useMemo(() => {
    return `${cron.minute} ${cron.hour} ${cron.dom} ${cron.month} ${cron.dow}`;
  }, [cron]);

  useEffect(() => {
    generateExplanation(fullCronString);
  }, [fullCronString]);

  const generateExplanation = (str: string) => {
    // Simplified human-readable logic for the preview
    const parts = str.split(' ');
    let desc = "Runs ";
    
    if (parts.every(p => p === '*')) {
      desc += "every minute.";
    } else {
      desc += `at minute ${parts[0] === '*' ? 'any' : parts[0]}, `;
      desc += `hour ${parts[1] === '*' ? 'any' : parts[1]}, `;
      desc += `day ${parts[2] === '*' ? 'any' : parts[2]}, `;
      desc += `month ${parts[3] === '*' ? 'any' : parts[3]}, `;
      desc += `and weekday ${parts[4] === '*' ? 'any' : parts[4]}.`;
    }
    setExplanation(desc);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullCronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (presetValue: string) => {
    const [m, h, dom, mon, dow] = presetValue.split(' ');
    setCron({ minute: m, hour: h, dom, month: mon, dow });
  };

  const updateField = (field: keyof CronState, value: string) => {
    setCron(prev => ({ ...prev, [field]: value }));
  };

  const InputGroup = ({ label, icon: Icon, value, field, placeholder }: { 
    label: string, 
    icon: any, 
    value: string, 
    field: keyof CronState,
    placeholder: string
  }) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
        <Icon size={14} className="text-indigo-400" />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-xl px-4 py-3 text-slate-200 transition-all font-mono"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase">
            <RefreshCw size={12} className="animate-spin-slow" />
            Developer Utilities
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
            Crontab Generator
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            A high-performance visual editor for cron schedules. Build complex expressions with ease and precision.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Minute" 
                  icon={Clock} 
                  value={cron.minute} 
                  field="minute" 
                  placeholder="0-59 or *"
                />
                <InputGroup 
                  label="Hour" 
                  icon={Clock} 
                  value={cron.hour} 
                  field="hour" 
                  placeholder="0-23 or *"
                />
                <InputGroup 
                  label="Day of Month" 
                  icon={Calendar} 
                  value={cron.dom} 
                  field="dom" 
                  placeholder="1-31 or *"
                />
                <InputGroup 
                  label="Month" 
                  icon={Hash} 
                  value={cron.month} 
                  field="month" 
                  placeholder="1-12 or *"
                />
                <div className="md:col-span-2">
                  <InputGroup 
                    label="Day of Week" 
                    icon={Calendar} 
                    value={cron.dow} 
                    field="dow" 
                    placeholder="0-6 (Sun-Sat) or *"
                  />
                </div>
              </div>

              {/* Expression Result */}
              <div className="mt-10 pt-8 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Resulting Cron Expression</span>
                </div>
                <div className="group relative flex items-center justify-between bg-black/40 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-colors">
                  <code className="text-2xl md:text-3xl font-mono font-bold text-indigo-400 tracking-wider">
                    {fullCronString}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Human Readable Explanation */}
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 flex items-start gap-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Info size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-1">Human Readable</h4>
                <p className="text-slate-300 leading-relaxed italic">"{explanation}"</p>
              </div>
            </div>
          </div>

          {/* Sidebar / Presets */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Hash size={16} className="text-indigo-500" />
                Quick Presets
              </h3>
              <div className="space-y-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset.value)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                  >
                    <div className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {preset.label}
                    </div>
                    <code className="text-[10px] text-slate-500 font-mono mt-1 block">
                      {preset.value}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-3xl p-6">
              <h3 className="text-sm font-semibold text-indigo-300 mb-2">Pro Tip</h3>
              <p className="text-xs text-indigo-200/70 leading-relaxed">
                Use <span className="text-indigo-300 font-mono">*/5</span> for every 5 units, or <span className="text-indigo-300 font-mono">1-5</span> for ranges. Separate multiple values with commas like <span className="text-indigo-300 font-mono">1,3,5</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center border-t border-slate-900 pt-8 pb-12">
          <p className="text-slate-600 text-sm">
            Standard Unix/Linux Crontab Format (5-column). Built for modern infrastructure.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}