'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Copy, RefreshCw, Calendar, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

interface ConversionResult {
  gmt: string;
  local: string;
  relative: string;
}

const UnixTimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [isMilliseconds, setIsMilliseconds] = useState<boolean>(false);
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 16));
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update current time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    const absDiff = Math.abs(diffInSeconds);

    if (absDiff < 60) return diffInSeconds >= 0 ? 'in a few seconds' : 'just now';
    
    const minutes = Math.floor(absDiff / 60);
    if (minutes < 60) return diffInSeconds >= 0 ? `in ${minutes}m` : `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return diffInSeconds >= 0 ? `in ${hours}h` : `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return diffInSeconds >= 0 ? `in ${days}d` : `${days}d ago`;
  };

  const convertTimestamp = (ts: string): ConversionResult => {
    try {
      const numericTs = parseInt(ts);
      if (isNaN(numericTs)) throw new Error('Invalid');
      
      const date = new Date(isMilliseconds ? numericTs : numericTs * 1000);
      if (isNaN(date.getTime())) throw new Error('Invalid Date');

      return {
        gmt: date.toUTCString(),
        local: date.toLocaleString(),
        relative: getRelativeTime(date)
      };
    } catch {
      return { gmt: 'Invalid Date', local: 'Invalid Date', relative: '-' };
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const results = convertTimestamp(timestamp);

  const setToNow = () => {
    const now = Date.now();
    setTimestamp(isMilliseconds ? now.toString() : Math.floor(now / 1000).toString());
  };

  const handleDateToTimestamp = (val: string) => {
    setDateInput(val);
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      const newTs = isMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000);
      setTimestamp(newTs.toString());
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Unix Timestamp Converter
            </h1>
            <p className="text-slate-500 font-medium">Professional grade epoch conversion utility</p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Current Unix Epoch</div>
              <div className="text-xl font-mono font-semibold text-slate-200">
                {Math.floor(currentTime.getTime() / 1000)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-6 text-slate-400">
                <ArrowRightLeft size={18} className="text-indigo-400" />
                <span className="text-sm font-semibold uppercase tracking-wider">Input Parameters</span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Timestamp</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all hover:border-slate-700"
                    />
                    <button 
                      onClick={() => handleCopy(timestamp, 'ts')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {copyFeedback === 'ts' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => { setIsMilliseconds(false); setTimestamp(prev => isMilliseconds ? Math.floor(parseInt(prev)/1000).toString() : prev); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isMilliseconds ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    SECONDS
                  </button>
                  <button
                    onClick={() => { setIsMilliseconds(true); setTimestamp(prev => !isMilliseconds ? (parseInt(prev)*1000).toString() : prev); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isMilliseconds ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    MILLISECONDS
                  </button>
                </div>

                <button 
                  onClick={setToNow}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                >
                  <RefreshCw size={18} />
                  Reset to Current
                </button>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-6 text-slate-400">
                <Calendar size={18} className="text-indigo-400" />
                <span className="text-sm font-semibold uppercase tracking-wider">Date Selector</span>
              </div>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => handleDateToTimestamp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all color-scheme-dark"
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl h-full shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800/50 bg-slate-800/20">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Conversion Results</h3>
              </div>
              
              <div className="divide-y divide-slate-800/50">
                {/* Result Item 1 */}
                <div className="p-6 hover:bg-slate-800/20 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">GMT / UTC Time</span>
                    <button 
                      onClick={() => handleCopy(results.gmt, 'gmt')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"
                    >
                      {copyFeedback === 'gmt' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="text-2xl font-mono text-slate-100 break-words">{results.gmt}</div>
                </div>

                {/* Result Item 2 */}
                <div className="p-6 hover:bg-slate-800/20 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">Your Local Time</span>
                    <button 
                      onClick={() => handleCopy(results.local, 'local')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-800 rounded-lg text-slate-400"
                    >
                      {copyFeedback === 'local' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="text-2xl font-mono text-slate-100 break-words">{results.local}</div>
                </div>

                {/* Result Item 3 */}
                <div className="p-6 hover:bg-slate-800/20 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">Relative</span>
                  </div>
                  <div className="text-2xl font-semibold text-slate-100 flex items-center gap-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    {results.relative}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-6 mt-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Sync Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <footer className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row gap-6 text-slate-500 text-sm">
          <div className="flex-1">
            <h4 className="text-slate-300 font-bold mb-2">What is Unix Time?</h4>
            <p className="leading-relaxed">
              Unix time (also known as Epoch time) is a system for describing a point in time. It is the number of seconds that have elapsed since the Unix epoch, minus leap seconds; the Unix epoch is 00:00:00 UTC on 1 January 1970.
            </p>
          </div>
          <div className="flex-1">
            <h4 className="text-slate-300 font-bold mb-2">Technical Note</h4>
            <p className="leading-relaxed">
              JavaScript handles time in milliseconds. If your timestamp is 13 digits, it is likely in milliseconds. If it is 10 digits, it is in seconds. This tool supports both formats.
            </p>
          </div>
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