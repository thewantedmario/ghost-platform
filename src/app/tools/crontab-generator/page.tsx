'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface CronState {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

const PRESETS = [
  { label: 'Every Minute', value: { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' } },
  { label: 'Every Hour', value: { minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' } },
  { label: 'Every Day at Midnight', value: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' } },
  { label: 'Every Sunday at Noon', value: { minute: '0', hour: '12', dayOfMonth: '*', month: '*', dayOfWeek: '0' } },
  { label: 'First Day of Month', value: { minute: '0', hour: '0', dayOfMonth: '1', month: '*', dayOfWeek: '*' } },
];

const CrontabGenerator: React.FC = () => {
  const [cron, setCron] = useState<CronState>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState('');

  const cronString = `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`;

  const generateExplanation = useCallback((state: CronState) => {
    const { minute, hour, dayOfMonth, month, dayOfWeek } = state;
    
    let desc = "Runs ";
    
    if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return "Runs every minute of every day.";
    }

    const minPart = minute === '*' ? "every minute" : `at minute ${minute}`;
    const hourPart = hour === '*' ? "every hour" : `at hour ${hour}`;
    const dayPart = dayOfMonth === '*' ? "" : `on day of month ${dayOfMonth}`;
    const monthPart = month === '*' ? "" : `in month ${month}`;
    const weekPart = dayOfWeek === '*' ? "" : `on day of week ${dayOfWeek}`;

    setExplanation(`${desc} ${minPart} ${hourPart} ${dayPart} ${monthPart} ${weekPart}`.replace(/\s+/g, ' ').trim() + ".");
  }, []);

  useEffect(() => {
    generateExplanation(cron);
  }, [cron, generateExplanation]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateField = (field: keyof CronState, value: string) => {
    setCron(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
            Crontab Generator
          </h1>
          <p className="text-slate-400 text-lg">Schedule your tasks with precision and elegance.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { id: 'minute', label: 'Minute', hint: '0-59' },
                  { id: 'hour', label: 'Hour', hint: '0-23' },
                  { id: 'dayOfMonth', label: 'Day', hint: '1-31' },
                  { id: 'month', label: 'Month', hint: '1-12' },
                  { id: 'dayOfWeek', label: 'Weekday', hint: '0-6' },
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400 px-1">{field.label}</label>
                    <input
                      type="text"
                      value={cron[field.id as keyof CronState]}
                      onChange={(e) => updateField(field.id as keyof CronState, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-mono text-center"
                      placeholder="*"
                    />
                    <p className="text-[10px] text-slate-600 text-center">{field.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Human Readable</h2>
              <p className="text-lg text-slate-300 italic">
                "{explanation}"
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Quick Presets</h2>
              <div className="flex flex-col gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setCron(preset.value)}
                    className="text-left px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all text-sm text-slate-400 hover:text-indigo-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-4">Generated Cron</h2>
              <div className="relative group/copy">
                <code className="block bg-slate-950/80 rounded-xl p-4 text-xl md:text-2xl font-mono text-white text-center border border-white/5 break-all">
                  {cronString}
                </code>
                <button
                  onClick={handleCopy}
                  className={`mt-4 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Command
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-900 text-center text-slate-600 text-sm">
          <p>Standard Crontab format: minute, hour, day of month, month, day of week.</p>
          <p className="mt-1">All times are typically based on server system time (UTC).</p>
        </footer>
      </div>
    </div>
  );
};

export default CrontabGenerator;