'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Clock, Calendar, RefreshCw, Terminal, Info, ChevronDown } from 'lucide-react';

type CronPart = {
  value: string;
  label: string;
  options: { label: string; value: string }[];
};

interface Preset {
  name: string;
  expression: string;
}

const PRESETS: Preset[] = [
  { name: 'Every Minute', expression: '* * * * *' },
  { name: 'Every Hour', expression: '0 * * * *' },
  { name: 'Every Day (Midnight)', expression: '0 0 * * *' },
  { name: 'Every Week (Sunday)', expression: '0 0 * * 0' },
  { name: 'Every Month (1st)', expression: '0 0 1 * *' },
  { name: 'Every Year (Jan 1st)', expression: '0 0 1 1 *' },
];

const GENERATED_OPTIONS = {
  minutes: Array.from({ length: 60 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i.toString() })),
  hours: Array.from({ length: 24 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i.toString() })),
  days: Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() })),
  months: [
    { label: 'January', value: '1' }, { label: 'February', value: '2' }, { label: 'March', value: '3' },
    { label: 'April', value: '4' }, { label: 'May', value: '5' }, { label: 'June', value: '6' },
    { label: 'July', value: '7' }, { label: 'August', value: '8' }, { label: 'September', value: '9' },
    { label: 'October', value: '10' }, { label: 'November', value: '11' }, { label: 'December', value: '12' },
  ],
  weekdays: [
    { label: 'Sunday', value: '0' }, { label: 'Monday', value: '1' }, { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' }, { label: 'Thursday', value: '4' }, { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
  ]
};

const CrontabGenerator: React.FC = () => {
  const [minute, setMinute] = useState<string>('*');
  const [hour, setHour] = useState<string>('*');
  const [dayOfMonth, setDayOfMonth] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dayOfWeek, setDayOfWeek] = useState<string>('*');
  const [copied, setCopied] = useState(false);

  const cronExpression = useMemo(() => {
    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (exp: string) => {
    const [m, h, dom, mon, dow] = exp.split(' ');
    setMinute(m);
    setHour(h);
    setDayOfMonth(dom);
    setMonth(mon);
    setDayOfWeek(dow);
  };

  const explainCron = () => {
    if (cronExpression === '* * * * *') return 'Runs every minute of every day.';
    
    let description = 'Runs ';
    const timeStr = (hour !== '*' && minute !== '*') ? `at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : '';
    
    if (minute === '*' && hour === '*') description += 'every minute ';
    else if (hour === '*') description += `at minute ${minute} of every hour `;
    else if (minute === '*') description += `every minute of hour ${hour} `;
    else description += `at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} `;

    if (dayOfMonth !== '*' && month !== '*') {
      const monthLabel = GENERATED_OPTIONS.months.find(m => m.value === month)?.label;
      description += `on day ${dayOfMonth} of ${monthLabel} `;
    } else if (dayOfMonth !== '*') {
      description += `on day ${dayOfMonth} of every month `;
    } else if (month !== '*') {
      const monthLabel = GENERATED_OPTIONS.months.find(m => m.value === month)?.label;
      description += `every day in ${monthLabel} `;
    }

    if (dayOfWeek !== '*') {
      const dayLabel = GENERATED_OPTIONS.weekdays.find(d => d.value === dayOfWeek)?.label;
      description += `${dayOfMonth === '*' ? 'on ' : 'and on '}${dayLabel}s`;
    } else if (dayOfMonth === '*' && month === '*') {
      description += 'every day';
    }

    return description.trim() + '.';
  };

  const SelectGroup = ({ 
    label, 
    value, 
    onChange, 
    options, 
    icon: Icon 
  }: { 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    options: { label: string; value: string }[];
    icon: any;
  }) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <Icon size={14} className="text-indigo-400" />
        {label}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all hover:bg-slate-800"
        >
          <option value="*">Every {label.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <RefreshCw size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Crontab Generator
            </h1>
          </div>
          <p className="text-slate-400 text-lg">Create precise cron job schedules with a modern interface.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SelectGroup label="Minute" value={minute} onChange={setMinute} options={GENERATED_OPTIONS.minutes} icon={Clock} />
                <SelectGroup label="Hour" value={hour} onChange={setHour} options={GENERATED_OPTIONS.hours} icon={Clock} />
                <SelectGroup label="Day" value={dayOfMonth} onChange={setDayOfMonth} options={GENERATED_OPTIONS.days} icon={Calendar} />
                <SelectGroup label="Month" value={month} onChange={setMonth} options={GENERATED_OPTIONS.months} icon={Calendar} />
                <div className="sm:col-span-2">
                  <SelectGroup label="Weekday" value={dayOfWeek} onChange={setDayOfWeek} options={GENERATED_OPTIONS.weekdays} icon={Calendar} />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.expression)}
                  className="px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/60 transition-all text-left"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Result Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-b from-indigo-600/10 to-transparent border border-indigo-500/20 rounded-2xl p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6 text-indigo-400">
                <Terminal size={20} />
                <span className="font-bold text-sm uppercase tracking-widest">Output</span>
              </div>
              
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 relative group overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <code className="text-2xl font-mono text-indigo-400 block break-all">
                  {cronExpression}
                </code>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                >
                  {copied ? (
                    <>
                      <Check size={18} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} /> Copy Expression
                    </>
                  )}
                </button>

                <div className="flex gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "{explainCron()}"
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
              <h3 className="text-slate-300 font-semibold mb-3 flex items-center gap-2 text-sm">
                Next scheduled runs:
              </h3>
              <ul className="space-y-2">
                {[1, 2, 3].map((_, i) => (
                  <li key={i} className="text-xs text-slate-500 font-mono flex justify-between items-center">
                    <span>2024-05-{10 + i} 00:00:00</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded uppercase">UTC</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            Standard Crontab format (5 fields: min, hour, dom, month, dow)
          </p>
          <div className="flex gap-6 text-sm text-slate-400 font-medium">
            <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Examples</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">GitHub</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CrontabGenerator;