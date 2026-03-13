'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';

const UnixTimestampConverter = () => {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));
  const [copyFeedback, setCopyFeedback] = useState("");
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimestampChange = (val) => {
    setTimestamp(val);
    const date = new Date(parseInt(val) * 1000);
    if (!isNaN(date.getTime())) {
      setDateInput(new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    }
  };

  const handleDateChange = (val) => {
    setDateInput(val);
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      setTimestamp(Math.floor(date.getTime() / 1000).toString());
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const formatDate = (ts) => {
    const d = new Date(parseInt(ts) * 1000);
    if (isNaN(d.getTime())) return "Invalid Date";
    return {
      local: d.toLocaleString(),
      utc: d.toUTCString(),
      relative: getRelativeTime(d)
    };
  };

  const getRelativeTime = (date) => {
    const diff = (date.getTime() - Date.now()) / 1000;
    const absDiff = Math.abs(diff);
    if (absDiff < 60) return `${Math.floor(absDiff)}s ${diff > 0 ? 'from now' : 'ago'}`;
    if (absDiff < 3600) return `${Math.floor(absDiff / 60)}m ${diff > 0 ? 'from now' : 'ago'}`;
    if (absDiff < 86400) return `${Math.floor(absDiff / 3600)}h ${diff > 0 ? 'from now' : 'ago'}`;
    return `${Math.floor(absDiff / 86400)}d ${diff > 0 ? 'from now' : 'ago'}`;
  };

  const results = formatDate(timestamp);

  const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            Developer Utilities
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500 mb-4">
            Unix Timestamp Converter
          </h1>
          <p className="text-slate-400 text-lg">
            High-precision epoch conversion for modern developers.
          </p>
        </header>

        <div className="grid gap-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Unix Timestamp (Seconds)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={timestamp}
                      onChange={(e) => handleTimestampChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-lg font-mono transition-all"
                    />
                    <button 
                      onClick={() => copyToClipboard(timestamp, 'ts')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      {copyFeedback === 'ts' ? <span className="text-xs text-emerald-400">Copied!</span> : <CopyIcon />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center pt-6 text-slate-600 hidden md:flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 16 4-4-4-4"/><path d="m13 16 4-4-4-4"/></svg>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-400 mb-2">ISO 8601 Date / Local</label>
                  <input 
                    type="datetime-local" 
                    value={dateInput}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-lg font-mono transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Current Epoch</span>
                  <span className="text-xl font-mono text-indigo-400">{currentTime}</span>
                  <button 
                    onClick={() => handleTimestampChange(currentTime.toString())}
                    className="mt-2 text-[10px] text-slate-500 hover:text-indigo-400 underline underline-offset-4 decoration-slate-800 transition-colors"
                  >
                    Sync Now
                  </button>
                </div>
                <div className="md:col-span-2 bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-center">
                   <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Relative</span>
                      <span className="text-sm font-medium text-emerald-400">{results.relative}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Local Time
                </h3>
                <button onClick={() => copyToClipboard(results.local, 'local')} className="text-slate-500 hover:text-white transition-colors">
                  {copyFeedback === 'local' ? <span className="text-xs text-emerald-400 font-normal">Copied!</span> : <CopyIcon />}
                </button>
              </div>
              <p className="text-lg font-mono text-slate-100 break-words">{results.local}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  UTC Time
                </h3>
                <button onClick={() => copyToClipboard(results.utc, 'utc')} className="text-slate-500 hover:text-white transition-colors">
                  {copyFeedback === 'utc' ? <span className="text-xs text-emerald-400 font-normal">Copied!</span> : <CopyIcon />}
                </button>
              </div>
              <p className="text-lg font-mono text-slate-100 break-words">{results.utc}</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-600 uppercase tracking-[0.2em]">
              Timestamps are based on 10-digit Unix Epoch (Seconds)
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.8);
          cursor: pointer;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default UnixTimestampConverter;