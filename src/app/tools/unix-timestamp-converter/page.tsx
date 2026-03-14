'use client';

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, Copy, Check, RefreshCw, ArrowRightLeft, AlertCircle } from 'lucide-react';

interface TimeData {
  unix: number;
  utc: string;
  local: string;
  relative: string;
  iso: string;
}

const UnixTimestampConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const getRelativeTime = (timestamp: number): string => {
    const ms = timestamp * 1000;
    const now = Date.now();
    const diff = now - ms;
    const seconds = Math.floor(Math.abs(diff) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const suffix = diff > 0 ? 'ago' : 'from now';

    if (seconds < 60) return `${seconds}s ${suffix}`;
    if (minutes < 60) return `${minutes}m ${suffix}`;
    if (hours < 24) return `${hours}h ${suffix}`;
    return `${days}d ${suffix}`;
  };

  const convertValue = useCallback((val: string) => {
    try {
      setError(null);
      let date: Date;

      // Check if numeric (timestamp)
      if (/^\d+$/.test(val)) {
        const num = parseInt(val, 10);
        // Detect if milliseconds (13 digits) or seconds (10 digits)
        date = val.length >= 13 ? new Date(num) : new Date(num * 1000);
      } else {
        // Try parsing as date string
        date = new Date(val);
      }

      if (isNaN(date.getTime())) {
        throw new Error("Invalid format");
      }

      const unix = Math.floor(date.getTime() / 1000);
      setTimeData({
        unix,
        utc: date.toUTCString(),
        local: date.toLocaleString(),
        iso: date.toISOString(),
        relative: getRelativeTime(unix)
      });
    } catch (err) {
      setError("Please enter a valid Unix timestamp or Date string");
      setTimeData(null);
    }
  }, []);

  useEffect(() => {
    convertValue(inputValue);
  }, [inputValue, convertValue]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const setNow = () => {
    const now = Math.floor(Date.now() / 1000).toString();
    setInputValue(now);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Unix Timestamp Converter
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Convert epochs to human-readable dates or vice versa instantly.
          </p>
        </div>

        {/* Input Section */}
        <div className="p-8 space-y-6">
          <div className="relative">
            <label className="block text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">
              Input (Timestamp or Date String)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter timestamp (e.g. 1715424000) or date..."
                  className="w-full bg-[#1a1a1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ArrowRightLeft className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <button
                onClick={setNow}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Now
              </button>
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-400 text-xs italic">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}
          </div>

          {/* Results Grid */}
          {timeData && (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ResultCard
                label="Unix Timestamp"
                value={timeData.unix.toString()}
                icon={<Clock className="w-4 h-4" />}
                onCopy={() => handleCopy(timeData.unix.toString(), 'unix')}
                isCopied={copiedField === 'unix'}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard
                  label="Local Time"
                  value={timeData.local}
                  icon={<Calendar className="w-4 h-4" />}
                  onCopy={() => handleCopy(timeData.local, 'local')}
                  isCopied={copiedField === 'local'}
                />
                <ResultCard
                  label="UTC Time"
                  value={timeData.utc}
                  icon={<Calendar className="w-4 h-4" />}
                  onCopy={() => handleCopy(timeData.utc, 'utc')}
                  isCopied={copiedField === 'utc'}
                />
              </div>
              <ResultCard
                label="ISO 8601"
                value={timeData.iso}
                icon={<Clock className="w-4 h-4" />}
                onCopy={() => handleCopy(timeData.iso, 'iso')}
                isCopied={copiedField === 'iso'}
              />
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <span className="text-xs font-medium uppercase tracking-widest text-indigo-400/70">Relative Time</span>
                <p className="text-lg font-medium text-indigo-200 mt-1">{timeData.relative}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-black/20 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            Precision Temporal Conversion Engine
          </p>
        </div>
      </div>
    </div>
  );
};

interface ResultCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  onCopy: () => void;
  isCopied: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, icon, onCopy, isCopied }) => (
  <div className="group relative p-4 bg-[#1a1a1e] border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all">
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-widest">{label}</span>
      </div>
      <button
        onClick={onCopy}
        className={`p-1.5 rounded-md transition-all ${
          isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-slate-500 hover:text-white'
        }`}
      >
        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
    <div className="text-white font-mono text-sm break-all leading-relaxed">
      {value}
    </div>
  </div>
);

export default UnixTimestampConverter;