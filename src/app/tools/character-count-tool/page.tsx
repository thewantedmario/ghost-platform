'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Clipboard, Trash2, Type, Hash, AlignLeft, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatsCardProps> = ({ label, value, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 transition-all hover:border-indigo-500/50 hover:bg-slate-900 group">
    <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
    </div>
  </div>
);

const CharacterCountTool: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    const words = trimmedText ? trimmedText.split(/\s+/) : [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      chars: text.length,
      charsNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTime: Math.ceil(words.length / 200)
    };
  }, [text]);

  const copyToClipboard = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [text]);

  const clearText = () => setText('');

  const transformCase = (type: 'upper' | 'lower') => {
    setText(type === 'upper' ? text.toUpperCase() : text.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-2">
            Professional Editor
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Character <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Count</span> Tool
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Analyze your content with precision. Track characters, words, and reading metrics in real-time with our high-performance editor.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Characters" value={stats.chars} icon={<Hash size={20} />} />
          <StatCard label="No Spaces" value={stats.charsNoSpaces} icon={<Type size={20} />} />
          <StatCard label="Words" value={stats.words} icon={<AlignLeft size={20} />} />
          <StatCard label="Sentences" value={stats.sentences} icon={<FileText size={20} />} />
          <StatCard label="Paragraphs" value={stats.paragraphs} icon={<FileText size={20} />} />
          <StatCard label="Read Time" value={`${stats.readingTime}m`} icon={<Clock size={20} />} />
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => transformCase('upper')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                >
                  UPPERCASE
                </button>
                <button
                  onClick={() => transformCase('lower')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                >
                  lowercase
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={clearText}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                  Clear
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!text}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                    isCopied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {isCopied ? <CheckCircle2 size={16} /> : <Clipboard size={16} />}
                  {isCopied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>
            
            <textarea
              className="w-full h-80 bg-transparent p-6 text-lg text-slate-300 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
              placeholder="Start typing or paste your content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck="false"
            />

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">
              <span>Real-time analysis active</span>
              <span className="flex items-center gap-2 italic">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Processing
              </span>
            </div>
          </div>
        </div>

        <footer className="text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Premium Content Intelligence. Secure, local, and private processing.</p>
        </footer>
      </div>
    </div>
  );
};

export default CharacterCountTool;