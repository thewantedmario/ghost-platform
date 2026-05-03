'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Clock, Calendar, Hash, RefreshCw, Info, LayoutGrid } from 'lucide-react';

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
  { label: 'Every Day at Midnight', value: { minute: '0', hour: '0', dom: '*', month: '*', dow: '*' } },
  { label: 'Every Sunday at 12 AM', value: { minute: '0', hour: '0', dom: '*', month: '*', dow: '0' } },
  { label: 'First Day of Month', value: { minute: '0', hour: '0', dom: '1', month: '*', dow: '*' } },
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

  const getHumanReadable = () => {
    const { minute, hour, dom, month, dow } = cron;
    let desc = "Runs ";

    if (minute === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') return "Runs every minute.";
    
    if (minute.startsWith('*/')) desc += `every ${minute.split('/')[1]} minutes `;
    else if (minute === '*') desc += "every minute ";
    else desc += `at minute ${minute} `;

    if (hour.startsWith('*/')) desc += `of every ${hour.split('/')[1]} hours `;
    else if (hour === '*') desc += "of every hour ";
    else desc += `of hour ${hour} `;

    if (dom !== '*') desc += `on day ${dom} of the month `;
    if (month !== '*') desc += `in month ${month} `;
    if (dow !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      desc += `on ${days[parseInt(dow)] || dow}`;
    }

    return desc.trim() + ".";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Crontab Generator
            </h1>
            <p className="text-slate-400 mt-1">Schedule your cron jobs with precision and ease.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 p-2 rounded-lg">
            <span className="text-slate-500">FORMAT:</span>
            <span className="text-indigo-400">MIN HR DOM MON DOW</span>
          </div>
        </header>

        {/* Main Generator Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Minute */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Clock size={16} className="text-indigo-400" /> Minute
                  </label>
                  <select 
                    value={cron.minute}
                    onChange={(e) => updateField('minute', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="*">Every minute (*)</option>
                    <option value="*/5">Every 5 minutes (*/5)</option>
                    <option value="*/15">Every 15 minutes (*/15)</option>
                    <option value="*/30">Every 30 minutes (*/30)</option>
                    <option value="0">At minute 0</option>
                    {[...Array(60).keys()].slice(1).map(m => (
                      <option key={m} value={m.toString()}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Hour */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Hash size={16} className="text-indigo-400" /> Hour
                  </label>
                  <select 
                    value={cron.hour}
                    onChange={(e) => updateField('hour', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="*">Every hour (*)</option>
                    <option value="*/2">Every 2 hours (*/2)</option>
                    <option value="*/6">Every 6 hours (*/6)</option>
                    <option value="*/12">Every 12 hours (*/12)</option>
                    {[...Array(24).keys()].map(h => (
                      <option key={h} value={h.toString()}>{h}:00</option>
                    ))}
                  </select>
                </div>

                {/* Day of Month */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Calendar size={16} className="text-indigo-400" /> Day of Month
                  </label>
                  <select 
                    value={cron.dom}
                    onChange={(e) => updateField('dom', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="*">Every day (*)</option>
                    {[...Array(31).keys()].map(d => (
                      <option key={d+1} value={(d+1).toString()}>{d+1}</option>
                    ))}
                  </select>
                </div>

                {/* Month */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <RefreshCw size={16} className="text-indigo-400" /> Month
                  </label>
                  <select 
                    value={cron.month}
                    onChange={(e) => updateField('month', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="*">Every month (*)</option>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                      <option key={m} value={(i + 1).toString()}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Day of Week */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                    <LayoutGrid size={16} className="text-indigo-400" /> Day of Week
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    <button 
                      onClick={() => updateField('dow', '*')}
                      className={`px-2 py-2 text-xs font-bold rounded border transition-all ${cron.dow === '*' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      ANY
                    </button>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                      <button 
                        key={d}
                        onClick={() => updateField('dow', i.toString())}
                        className={`px-2 py-2 text-xs font-bold rounded border transition-all ${cron.dow === i.toString() ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setCron(preset.value)}
                  className="text-left px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all text-sm group"
                >
                  <span className="text-slate-400 group-hover:text-indigo-400 transition-colors block text-xs mb-1 uppercase tracking-wider font-semibold">Preset</span>
                  <span className="text-slate-200">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Result Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                Generated Expression
              </h2>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-2xl text-center text-indigo-400 border border-slate-800 break-all">
                  {cronString}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Expression'}
              </button>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-indigo-500/10 rounded">
                    <Info size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300">Interpretation</h3>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed italic">
                      "{getHumanReadable()}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Guide</h4>
                <ul className="text-xs space-y-2 text-slate-400">
                  <li className="flex justify-between"><span>*</span> <span>Any value</span></li>
                  <li className="flex justify-between"><span>,</span> <span>Value list separator</span></li>
                  <li className="flex justify-between"><span>-</span> <span>Range of values</span></li>
                  <li className="flex justify-between"><span>/</span> <span>Step values</span></li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        <footer className="mt-12 text-center text-slate-600 text-sm">
          <p>Standard Crontab implementation (Linux/Unix format)</p>
        </footer>
      </div>
    </div>
  );
};

export default CrontabGenerator;