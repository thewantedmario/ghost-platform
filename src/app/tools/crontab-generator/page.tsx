'use client';

"use client";

import React, { useState, useEffect, useMemo } from 'react';

type CronPart = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

interface CronState {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

interface Preset {
  label: string;
  value: CronState;
}

const PRESETS: Preset[] = [
  { label: 'Every Minute', value: { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' } },
  { label: 'Every Hour', value: { minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' } },
  { label: 'Every Night at Midnight', value: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' } },
  { label: 'Every Sunday at Noon', value: { minute: '0', hour: '12', dayOfMonth: '*', month: '*', dayOfWeek: '0' } },
  { label: 'First Day of Month', value: { minute: '0', hour: '0', dayOfMonth: '1', month: '*', dayOfWeek: '*' } },
];

const CronField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  description 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
  description: string;
}) => (
  <div className="flex flex-col space-y-2">
    <label className="text-sm font-medium text-zinc-400">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder:text-zinc-600"
    />
    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{description}</span>
  </div>
);

export default function CrontabGenerator() {
  const [cron, setCron] = useState<CronState>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });

  const [copied, setCopied] = useState(false);

  const fullCronString = useMemo(() => {
    return `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`;
  }, [cron]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullCronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateField = (field: CronPart, value: string) => {
    setCron((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset: CronState) => {
    setCron(preset);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500 tracking-tight">
            Crontab Generator
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">
            Create precise schedule expressions for your cron jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8 bg-zinc-950/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CronField 
                label="Minute" 
                value={cron.minute} 
                onChange={(v) => updateField('minute', v)} 
                placeholder="*" 
                description="0-59, *, /, -"
              />
              <CronField 
                label="Hour" 
                value={cron.hour} 
                onChange={(v) => updateField('hour', v)} 
                placeholder="*" 
                description="0-23, *, /, -"
              />
              <CronField 
                label="Day of Month" 
                value={cron.dayOfMonth} 
                onChange={(v) => updateField('dayOfMonth', v)} 
                placeholder="*" 
                description="1-31, *, /, -, L, W"
              />
              <CronField 
                label="Month" 
                value={cron.month} 
                onChange={(v) => updateField('month', v)} 
                placeholder="*" 
                description="1-12 or JAN-DEC"
              />
              <CronField 
                label="Day of Week" 
                value={cron.dayOfWeek} 
                onChange={(v) => updateField('dayOfWeek', v)} 
                placeholder="*" 
                description="0-6 or SUN-SAT"
              />
            </div>

            {/* Generated Output */}
            <div className="mt-10 p-6 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="font-mono text-2xl md:text-3xl tracking-widest text-blue-400 break-all">
                  {fullCronString}
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shrink-0 ${
                    copied 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                      : 'bg-zinc-100 text-zinc-900 hover:bg-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Presets */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest px-1">Common Presets</h3>
            <div className="space-y-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.value)}
                  className="w-full text-left p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
                >
                  <div className="text-zinc-200 font-medium group-hover:text-white">{preset.label}</div>
                  <div className="text-xs font-mono text-zinc-500 mt-1">
                    {preset.value.minute} {preset.value.hour} {preset.value.dayOfMonth} {preset.value.month} {preset.value.dayOfWeek}
                  </div>
                </button>
              ))}
            </div>

            {/* Hint Card */}
            <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span className="text-xs font-bold uppercase tracking-wider">Format Tip</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Use <code className="text-zinc-200 bg-zinc-800 px-1 rounded">*</code> for every, <code className="text-zinc-200 bg-zinc-800 px-1 rounded">*/5</code> for every five, or <code className="text-zinc-200 bg-zinc-800 px-1 rounded">1-5</code> for ranges.
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <footer className="mt-16 pt-8 border-t border-zinc-900">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Minute', range: '0-59' },
              { label: 'Hour', range: '0-23' },
              { label: 'Day (M)', range: '1-31' },
              { label: 'Month', range: '1-12' },
              { label: 'Day (W)', range: '0-6' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{item.label}</div>
                <div className="text-sm text-zinc-400">{item.range}</div>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}