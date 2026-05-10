'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Clock, Calendar, RefreshCw, Info } from 'lucide-react';

type CronValue = string;

interface CronState {
  minute: CronValue;
  hour: CronValue;
  dayOfMonth: CronValue;
  month: CronValue;
  dayOfWeek: CronValue;
}

interface Option {
  label: string;
  value: string;
}

const MINUTES: Option[] = [
  { label: 'Every minute', value: '*' },
  { label: 'Every 5 minutes', value: '*/5' },
  { label: 'Every 15 minutes', value: '*/15' },
  { label: 'Every 30 minutes', value: '*/30' },
  ...Array.from({ length: 60 }, (_, i) => ({ label: `${i.toString().padStart(2, '0')}`, value: i.toString() })),
];

const HOURS: Option[] = [
  { label: 'Every hour', value: '*' },
  { label: 'Every 2 hours', value: '*/2' },
  { label: 'Every 6 hours', value: '*/6' },
  { label: 'Every 12 hours', value: '*/12' },
  ...Array.from({ length: 24 }, (_, i) => ({ label: `${i.toString().padStart(2, '0')}:00`, value: i.toString() })),
];

const DAYS: Option[] = [
  { label: 'Every day', value: '*' },
  ...Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}`, value: (i + 1).toString() })),
];

const MONTHS: Option[] = [
  { label: 'Every month', value: '*' },
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const WEEKDAYS: Option[] = [
  { label: 'Every weekday', value: '*' },
  { label: 'Sunday', value: '0' },
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
];

export default function CrontabGenerator() {
  const [cron, setCron] = useState<CronState>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });
  const [copied, setCopied] = useState(false);

  const cronString = useMemo(() => {
    return `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`;
  }, [cron]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateCron = (field: keyof CronState, value: string) => {
    setCron((prev) => ({ ...prev, [field]: value }));
  };

  const getReadableDescription = () => {
    const { minute, hour, dayOfMonth, month, dayOfWeek } = cron;
    let desc = "Runs ";
    
    if (minute === '*' && hour === '*') desc += "every minute ";
    else if (minute.startsWith('*/')) desc += `every ${minute.split('/')[1]} minutes `;
    else if (hour === '*') desc += `at minute ${minute} of every hour `;
    else desc += `at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} `;

    if (dayOfMonth !== '*') desc += `on day ${dayOfMonth} of the month `;
    if (month !== '*') desc += `in ${MONTHS.find(m => m.value === month)?.label} `;
    if (dayOfWeek !== '*') desc += `on ${WEEKDAYS.find(w => w.value === dayOfWeek)?.label} `;
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') desc += "every day";

    return desc.trim() + ".";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 mb-4">
            Crontab Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Create precise cron expressions for your scheduled tasks with ease.
          </p>
        </div>

        {/* Generator Card */}
        <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl">
          
          {/* Result Section */}
          <div className="mb-10 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                <RefreshCw size={14} /> Generated Expression
              </span>
              <div className="h-px flex-1 bg-slate-800 ml-4"></div>
            </div>
            
            <div className="relative flex items-center gap-4 bg-slate-950/80 border border-slate-700/50 p-6 rounded-2xl group-hover:border-indigo-500/50 transition-all duration-300">
              <code className="text-3xl md:text-5xl font-mono font-bold tracking-wider text-white overflow-x-auto whitespace-nowrap scrollbar-hide flex-1">
                {cronString}
              </code>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 p-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                {copied ? <Check size={24} /> : <Copy size={24} />}
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm italic">
              <Info size={14} className="text-indigo-400" />
              {getReadableDescription()}
            </div>
          </div>

          {/* Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Minutes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock size={14} /> Minute
              </label>
              <select
                value={cron.minute}
                onChange={(e) => updateCron('minute', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-200"
              >
                {MINUTES.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock size={14} /> Hour
              </label>
              <select
                value={cron.hour}
                onChange={(e) => updateCron('hour', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-200"
              >
                {HOURS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Day of Month */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Calendar size={14} /> Day of Month
              </label>
              <select
                value={cron.dayOfMonth}
                onChange={(e) => updateCron('dayOfMonth', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-200"
              >
                {DAYS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Calendar size={14} /> Month
              </label>
              <select
                value={cron.month}
                onChange={(e) => updateCron('month', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-200"
              >
                {MONTHS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Day of Week */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Calendar size={14} /> Day of Week
              </label>
              <select
                value={cron.dayOfWeek}
                onChange={(e) => updateCron('dayOfWeek', e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none text-slate-200"
              >
                {WEEKDAYS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => setCron({ minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' })}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition-all border border-slate-700"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-500">
          <div className="p-4 rounded-2xl bg-slate-900/20 border border-slate-800/50">
            <h4 className="text-slate-300 font-bold mb-2">Standard Format</h4>
            <p>Uses the classic 5-column crontab syntax compatible with Linux, Unix, and macOS systems.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/20 border border-slate-800/50">
            <h4 className="text-slate-300 font-bold mb-2">Zero-Dependency</h4>
            <p>Generated purely in your browser for privacy and speed. No server calls required.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/20 border border-slate-800/50">
            <h4 className="text-slate-300 font-bold mb-2">Quick Presets</h4>
            <p>Common intervals are included in the dropdowns to help you build rules faster.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}