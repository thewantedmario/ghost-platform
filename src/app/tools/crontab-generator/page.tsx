'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Clock, Calendar, RefreshCw, Info, ChevronDown, Terminal } from 'lucide-react';

type CronType = 'every' | 'specific' | 'range' | 'interval';

interface CronPart {
  type: CronType;
  value: string;
  rangeStart: string;
  rangeEnd: string;
  interval: string;
}

interface CronState {
  minute: CronPart;
  hour: CronPart;
  day: CronPart;
  month: CronPart;
  weekday: CronPart;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const INITIAL_PART: CronPart = {
  type: 'every',
  value: '0',
  rangeStart: '0',
  rangeEnd: '1',
  interval: '1',
};

const CrontabGenerator: React.FC = () => {
  const [cron, setCron] = useState<CronState>({
    minute: { ...INITIAL_PART, type: 'every' },
    hour: { ...INITIAL_PART, type: 'every' },
    day: { ...INITIAL_PART, type: 'every' },
    month: { ...INITIAL_PART, type: 'every' },
    weekday: { ...INITIAL_PART, type: 'every' },
  });

  const [copied, setCopied] = useState(false);

  const generateCronString = (part: CronPart, max: number, min: number = 0): string => {
    switch (part.type) {
      case 'every': return '*';
      case 'specific': return part.value;
      case 'range': return `${part.rangeStart}-${part.rangeEnd}`;
      case 'interval': return `*/${part.interval}`;
      default: return '*';
    }
  };

  const cronString = useMemo(() => {
    return `${generateCronString(cron.minute, 59)} ${generateCronString(cron.hour, 23)} ${generateCronString(cron.day, 31, 1)} ${generateCronString(cron.month, 12, 1)} ${generateCronString(cron.weekday, 6)}`;
  }, [cron]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updatePart = (key: keyof CronState, updates: Partial<CronPart>) => {
    setCron(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const InputGroup = ({ label, partKey, max, min = 0, options }: { 
    label: string, 
    partKey: keyof CronState, 
    max: number, 
    min?: number,
    options?: string[]
  }) => {
    const part = cron[partKey];
    
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            {partKey === 'minute' || partKey === 'hour' ? <Clock size={16} className="text-indigo-400" /> : <Calendar size={16} className="text-indigo-400" />}
          </div>
          <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{label}</span>
        </div>

        <div className="space-y-4">
          <select 
            value={part.type}
            onChange={(e) => updatePart(partKey, { type: e.target.value as CronType })}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
          >
            <option value="every">Every {label.toLowerCase()}</option>
            <option value="specific">Specific {label.toLowerCase()}</option>
            <option value="range">Range</option>
            <option value="interval">Interval</option>
          </select>

          {part.type === 'specific' && (
            <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    const currentValues = part.value.split(',').filter(v => v !== '');
                    const valStr = val.toString();
                    const newValues = currentValues.includes(valStr) 
                      ? currentValues.filter(v => v !== valStr)
                      : [...currentValues, valStr].sort((a, b) => parseInt(a) - parseInt(b));
                    updatePart(partKey, { value: newValues.length ? newValues.join(',') : '*' });
                  }}
                  className={`text-xs p-1.5 rounded transition-colors ${
                    part.value.split(',').includes(val.toString())
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {options ? options[val] : val}
                </button>
              ))}
            </div>
          )}

          {part.type === 'range' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={min}
                max={max}
                value={part.rangeStart}
                onChange={(e) => updatePart(partKey, { rangeStart: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-2 outline-none focus:border-indigo-500"
              />
              <span className="text-slate-500">to</span>
              <input
                type="number"
                min={min}
                max={max}
                value={part.rangeEnd}
                onChange={(e) => updatePart(partKey, { rangeEnd: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-2 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {part.type === 'interval' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Every</span>
              <input
                type="number"
                min="1"
                max={max}
                value={part.interval}
                onChange={(e) => updatePart(partKey, { interval: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded p-2 outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400 text-sm">{label.toLowerCase()}(s)</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <RefreshCw className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Crontab Generator
              </h1>
            </div>
            <p className="text-slate-400 text-sm md:text-base">
              Design and debug your cron schedules with a high-end interface.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Every Minute', val: '* * * * *' },
              { label: 'Every Hour', val: '0 * * * *' },
              { label: 'Daily at Mid', val: '0 0 * * *' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                   // Simplified preset application logic
                   const [m, h, d, mon, w] = preset.val.split(' ');
                   setCron({
                     minute: { ...INITIAL_PART, type: m === '*' ? 'every' : 'specific', value: m === '*' ? '0' : m },
                     hour: { ...INITIAL_PART, type: h === '*' ? 'every' : 'specific', value: h === '*' ? '0' : h },
                     day: { ...INITIAL_PART, type: d === '*' ? 'every' : 'specific', value: d === '*' ? '1' : d },
                     month: { ...INITIAL_PART, type: mon === '*' ? 'every' : 'specific', value: mon === '*' ? '1' : mon },
                     weekday: { ...INITIAL_PART, type: w === '*' ? 'every' : 'specific', value: w === '*' ? '0' : w },
                   });
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-full text-xs font-medium text-slate-300 transition-all hover:bg-slate-800"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output Section */}
        <div className="relative group mb-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <Terminal size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Generated Expression</span>
              </div>
              <div className="text-4xl md:text-6xl font-mono font-bold tracking-tighter text-white break-all">
                {cronString}
              </div>
            </div>
            
            <button 
              onClick={handleCopy}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all transform active:scale-95 ${
                copied 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-white text-slate-950 hover:bg-slate-200'
              }`}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied' : 'Copy Cron'}
            </button>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <InputGroup label="Minutes" partKey="minute" max={59} />
          <InputGroup label="Hours" partKey="hour" max={23} />
          <InputGroup label="Day of Month" partKey="day" max={31} min={1} />
          <InputGroup label="Month" partKey="month" max={12} min={1} options={['','Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']} />
          <InputGroup label="Day of Week" partKey="weekday" max={6} options={DAYS} />
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
            <Info className="text-indigo-400" size={20} />
          </div>
          <div>
            <h4 className="text-slate-200 font-semibold mb-1">How it works</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cron expressions consist of five fields separated by white space. Each field represents a period of time: minute, hour, day of the month, month, and day of the week. 
              Asterisks (*) represent "every" possible value for that field. Hyphens (-) define ranges, and slashes (/) specify increments.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CrontabGenerator;