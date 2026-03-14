'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Calendar, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowRightLeft,
  CalendarDays,
  Hash
} from 'lucide-react';

interface ConversionResult {
  local: string;
  utc: string;
  relative: string;
}

const UnixTimestampConverter: React.FC = () => {
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  const [unixInput, setUnixInput] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 16));
  const [copied, setCopied] = useState<string | null>(null);

  // Update live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatUnix = (ts: string): ConversionResult => {
    const num = parseInt(ts);
    if (isNaN(num)) return { local: 'Invalid Date', utc: 'Invalid Date', relative: '-' };
    
    // Support milliseconds if input is 13 digits
    const date = ts.length > 11 ? new Date(num) : new Date(num * 1000);
    
    if (isNaN(date.getTime())) return { local: 'Invalid Date', utc: 'Invalid Date', relative: '-' };

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = date.getTime() - Date.now();
    const diffInSeconds = Math.round(diff / 1000);
    
    let relative = "";
    if (Math.abs(diffInSeconds) < 60) relative = rtf.format(diffInSeconds, 'second');
    else if (Math.abs(diffInSeconds) < 3600) relative = rtf.format(Math.round(diffInSeconds / 60), 'minute');
    else if (Math.abs(diffInSeconds) < 86400) relative = rtf.format(Math.round(diffInSeconds / 3600), 'hour');
    else relative = rtf.format(Math.round(diffInSeconds / 86400), 'day');

    return {
      local: date.toString(),
      utc: date.toUTCString(),
      relative
    };
  };

  const results = formatUnix(unixInput);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateInput(val);
    const ts = Math.floor(new Date(val).getTime() / 1000);
    if (!isNaN(ts)) setUnixInput(ts.toString());
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Unix Timestamp Converter
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            High-precision epoch time conversion for modern developers.
          </p>
        </header>

        {/* Live Clock Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Current Unix Timestamp</span>
              <div className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-white tabular-nums">
                {now}
              </div>
            </div>
            <button 
              onClick={() => {
                setUnixInput(now.toString());
                copyToClipboard(now.toString(), 'live');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-slate-200 transition-colors rounded-xl font-medium text-sm"
            >
              {copied === 'live' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy Current Time
            </button>
          </div>
        </div>

        {/* Converter Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Input Panel */}
          <div className="space-y-6">
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-300">Unix Timestamp</h2>
              </div>
              <div className="relative">
                <input 
                  type="text"
                  value={unixInput}
                  onChange={(e) => setUnixInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                  placeholder="Enter seconds or milliseconds..."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setUnixInput(now.toString())}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-xs transition-colors"
                >
                  Set to Now
                </button>
              </div>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-slate-300">Date & Time</h2>
              </div>
              <input 
                type="datetime-local"
                value={dateInput}
                onChange={handleDateChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-slate-200 scheme-dark"
              />
            </section>
          </div>

          {/* Results Panel */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Conversion Results
            </h2>
            
            <div className="space-y-4">
              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Local Time</label>
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                  <span className="text-sm font-medium truncate pr-4">{results.local}</span>
                  <button onClick={() => copyToClipboard(results.local, 'local')} className="text-slate-500 hover:text-indigo-400">
                    {copied === 'local' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">UTC Time</label>
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                  <span className="text-sm font-medium truncate pr-4">{results.utc}</span>
                  <button onClick={() => copyToClipboard(results.utc, 'utc')} className="text-slate-500 hover:text-indigo-400">
                    {copied === 'utc' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Relative</label>
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="text-sm font-medium text-indigo-400">{results.relative}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Unit Helper */}
        <footer className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12">
          {[
            { label: 'Minute', value: '60' },
            { label: 'Hour', value: '3,600' },
            { label: 'Day', value: '86,400' },
            { label: 'Year', value: '31,536,000' }
          ].map((unit) => (
            <div key={unit.label} className="bg-slate-900/30 border border-slate-800/50 p-3 rounded-xl text-center">
              <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">{unit.label}</div>
              <div className="text-xs font-mono text-slate-300">{unit.value}s</div>
            </div>
          ))}
        </footer>

      </div>

      <style jsx global>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default UnixTimestampConverter;