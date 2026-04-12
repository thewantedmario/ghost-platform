'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Clock, Calendar, Info, RefreshCw, Hash } from 'lucide-react';

type CronPart = 'minute' | 'hour' | 'day' | 'month' | 'weekday';

interface CronState {
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekday: string;
}

const PRESETS = [
  { label: 'Every Minute', value: '* * * * *' },
  { label: 'Every Hour', value: '0 * * * *' },
  { label: 'Daily at Midnight', value: '0 0 * * *' },
  { label: 'Weekly (Sun)', value: '0 0 * * 0' },
  { label: 'Monthly (1st)', value: '0 0 1 * *' },
  { label: 'Every Weekday', value: '0 9 * * 1-5' },
];

const OPTIONS = {
  minute: Array.from({ length: 60 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i.toString() })),
  hour: Array.from({ length: 24 }, (_, i) => ({ label: `${i.toString().padStart(2, '0')}:00`, value: i.toString() })),
  day: Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() })),
  month: [
    { label: 'Jan', value: '1' }, { label: 'Feb', value: '2' }, { label: 'Mar', value: '3' },
    { label: 'Apr', value: '4' }, { label: 'May', value: '5' }, { label: 'Jun', value: '6' },
    { label: 'Jul', value: '7' }, { label: 'Aug', value: '8' }, { label: 'Sep', value: '9' },
    { label: 'Oct', value: '10' }, { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' },
  ],
  weekday: [
    { label: 'Sun', value: '0' }, { label: 'Mon', value: '1' }, { label: 'Tue', value: '2' },
    { label: 'Wed', value: '3' }, { label: 'Thu', value: '4' }, { label: 'Fri', value: '5' },
    { label: 'Sat', value: '6' },
  ],
};

export default function CrontabGenerator() {
  const [cron, setCron] = useState<CronState>({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    weekday: '*',
  });
  const [copied, setCopied] = useState(false);

  const cronString = useMemo(() => {
    return `${cron.minute} ${cron.hour} ${cron.day} ${cron.month} ${cron.weekday}`;
  }, [cron]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updatePart = (part: CronPart, value: string) => {
    setCron((prev) => ({ ...prev, [part]: value }));
  };

  const applyPreset = (preset: string) => {
    const parts = preset.split(' ');
    setCron({
      minute: parts[0],
      hour: parts[1],
      day: parts[2],
      month: parts[3],
      weekday: parts[4],
    });
  };

  const CronSelect = ({ label, part, options, icon: Icon }: { label: string; part: CronPart; options: { label: string; value: string }[]; icon: any }) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
        <Icon size={14} className="text-indigo-400" />
        {label}
      </label>
      <select
        value={cron[part]}
        onChange={(e) => updatePart(part, e.target.value)}
        className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full p-2.5 transition-all outline-none hover:border-slate-700"
      >
        <option value="*">Every {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
            Crontab Generator
          </h1>
          <p className="text-slate-400 text-lg">Schedule your tasks with precision using our professional cron expression builder.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CronSelect label="Minute" part="minute" options={OPTIONS.minute} icon={Clock} />
                <CronSelect label="Hour" part="hour" options={OPTIONS.hour} icon={Clock} />
                <CronSelect label="Day of Month" part="day" options={OPTIONS.day} icon={Calendar} />
                <CronSelect label="Month" part="month" options={OPTIONS.month} icon={Calendar} />
                <div className="md:col-span-2">
                  <CronSelect label="Day of Week" part="weekday" options={OPTIONS.weekday} icon={Hash} />
                </div>
              </div>
            </div>

            {/* Output Display */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-indigo-400 uppercase tracking-[0.2em]">Generated Expression</span>
                  <code className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white block">
                    {cronString}
                  </code>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied' : 'Copy Command'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <RefreshCw size={16} /> Quick Presets
              </h3>
              <div className="space-y-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset.value)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-sm font-medium border border-transparent hover:border-slate-700 transition-all text-slate-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Info size={18} />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Cron Tip</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                The asterisk <code className="text-indigo-300">*</code> represents "every". For example, a <code className="text-indigo-300">*</code> in the Hour field means "every hour".
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Format: <span className="text-slate-400">minute hour day(month) month day(week)</span>
          </p>
        </div>
      </div>
    </div>
  );
}