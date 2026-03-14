'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Clock, Calendar, Hash, Info, RefreshCw } from 'lucide-react';

interface CronPart {
  type: 'all' | 'range' | 'step' | 'specific';
  value: string;
  start: number;
  end: number;
  step: number;
  specifics: number[];
}

interface CronState {
  minute: CronPart;
  hour: CronPart;
  dayOfMonth: CronPart;
  month: CronPart;
  dayOfWeek: CronPart;
}

type PartKey = keyof CronState;

const INITIAL_PART = (max: number, min: number = 0): CronPart => ({
  type: 'all',
  value: '*',
  start: min,
  end: max,
  step: 1,
  specifics: [],
});

const FIELD_CONFIG = [
  { key: 'minute' as PartKey, label: 'Minutes', min: 0, max: 59, icon: Clock },
  { key: 'hour' as PartKey, label: 'Hours', min: 0, max: 23, icon: Clock },
  { key: 'dayOfMonth' as PartKey, label: 'Day of Month', min: 1, max: 31, icon: Hash },
  { key: 'month' as PartKey, label: 'Month', min: 1, max: 12, icon: Calendar },
  { key: 'dayOfWeek' as PartKey, label: 'Day of Week', min: 0, max: 6, icon: Calendar, names: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
];

export default function CrontabGenerator() {
  const [state, setState] = useState<CronState>({
    minute: INITIAL_PART(59),
    hour: INITIAL_PART(23),
    dayOfMonth: INITIAL_PART(31, 1),
    month: INITIAL_PART(12, 1),
    dayOfWeek: INITIAL_PART(6),
  });

  const [copied, setCopied] = useState(false);

  const generatePartString = (part: CronPart): string => {
    switch (part.type) {
      case 'all': return '*';
      case 'range': return `${part.start}-${part.end}`;
      case 'step': return `*/${part.step}`;
      case 'specific': 
        return part.specifics.length > 0 
          ? [...part.specifics].sort((a, b) => a - b).join(',') 
          : '*';
      default: return '*';
    }
  };

  const cronString = useMemo(() => {
    return `${generatePartString(state.minute)} ${generatePartString(state.hour)} ${generatePartString(state.dayOfMonth)} ${generatePartString(state.month)} ${generatePartString(state.dayOfWeek)}`;
  }, [state]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updatePart = (key: PartKey, updates: Partial<CronPart>) => {
    setState(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const toggleSpecific = (key: PartKey, val: number) => {
    const part = state[key];
    const specifics = part.specifics.includes(val)
      ? part.specifics.filter(v => v !== val)
      : [...part.specifics, val];
    updatePart(key, { specifics, type: 'specific' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-400 font-medium tracking-wider uppercase text-xs">
              <RefreshCw size={14} className="animate-spin-slow" />
              Developer Tools
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Crontab Generator
            </h1>
            <p className="text-zinc-500 mt-2 max-w-lg">
              Generate precise cron schedules with a high-end visual interface. Valid for Linux crontab and scheduled tasks.
            </p>
          </div>
        </header>

        {/* Output Box */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Generated Expression</span>
              <code className="text-3xl md:text-5xl font-mono font-bold text-indigo-400 break-all">
                {cronString}
              </code>
            </div>
            <button 
              onClick={handleCopy}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied' : 'Copy Expression'}
            </button>
          </div>
        </section>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 gap-6">
          {FIELD_CONFIG.map((field) => (
            <div key={field.key} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <field.icon size={18} className="text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-lg">{field.label}</h3>
                </div>
                <div className="flex bg-zinc-800 p-1 rounded-lg">
                  {(['all', 'range', 'step', 'specific'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updatePart(field.key, { type: t })}
                      className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                        state[field.key].type === t 
                        ? 'bg-zinc-700 text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {state[field.key].type === 'all' && (
                  <div className="flex items-center gap-3 text-zinc-500 bg-zinc-900/30 p-4 rounded-lg border border-dashed border-zinc-800">
                    <Info size={18} />
                    <span>This task will run every single {field.label.toLowerCase().replace(/s$/, '')}.</span>
                  </div>
                )}

                {state[field.key].type === 'range' && (
                  <div className="flex items-center gap-8">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-zinc-500 uppercase">Start</label>
                      <input 
                        type="range" min={field.min} max={field.max} 
                        value={state[field.key].start}
                        onChange={(e) => updatePart(field.key, { start: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                      <div className="text-xl font-mono">{state[field.key].start}</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-zinc-500 uppercase">End</label>
                      <input 
                        type="range" min={field.min} max={field.max} 
                        value={state[field.key].end}
                        onChange={(e) => updatePart(field.key, { end: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500"
                      />
                      <div className="text-xl font-mono">{state[field.key].end}</div>
                    </div>
                  </div>
                )}

                {state[field.key].type === 'step' && (
                  <div className="space-y-4">
                    <label className="text-xs text-zinc-500 uppercase">Run every X {field.label.toLowerCase()}</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" min="1" max={field.max}
                        value={state[field.key].step}
                        onChange={(e) => updatePart(field.key, { step: parseInt(e.target.value) || 1 })}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <span className="text-zinc-400">Step interval (e.g. */5)</span>
                    </div>
                  </div>
                )}

                {state[field.key].type === 'specific' && (
                  <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
                    {Array.from({ length: field.max - field.min + 1 }, (_, i) => i + field.min).map((val) => (
                      <button
                        key={val}
                        onClick={() => toggleSpecific(field.key, val)}
                        className={`py-2 text-xs font-mono rounded border transition-all ${
                          state[field.key].specifics.includes(val)
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        {field.names ? field.names[val] : val}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Explanation Footer */}
        <footer className="pt-10 border-t border-zinc-800">
          <div className="bg-indigo-500/5 rounded-2xl p-6 border border-indigo-500/10">
            <h4 className="text-indigo-400 font-bold mb-4 flex items-center gap-2">
              <Info size={18} />
              Understanding Cron Syntax
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-zinc-400">
              <div><span className="text-zinc-100 font-mono">*</span> Minutes (0-59)</div>
              <div><span className="text-zinc-100 font-mono">*</span> Hours (0-23)</div>
              <div><span className="text-zinc-100 font-mono">*</span> Day of Month (1-31)</div>
              <div><span className="text-zinc-100 font-mono">*</span> Month (1-12)</div>
              <div><span className="text-zinc-100 font-mono">*</span> Day of Week (0-6)</div>
            </div>
          </div>
          <p className="mt-8 text-center text-zinc-600 text-xs tracking-widest uppercase">
            Designed for professional deployment workflows &copy; {new Date().getFullYear()}
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
        input[type='range'] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type='range']::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: #27272a;
          border-radius: 2px;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          margin-top: -7px;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  );
}