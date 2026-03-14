'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Copy, 
  Trash2, 
  Type, 
  FileText, 
  Clock, 
  Hash, 
  AlignLeft, 
  CheckCircle2,
  BarChart3
} from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:bg-slate-900/80 group">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <div className="text-indigo-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
  </div>
);

const CharacterCountTool: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = text.split(/\n+/).filter(Boolean).length;
    const readingTime = Math.ceil(words / 200);

    return {
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTime
    };
  }, [text]);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleClear = useCallback(() => {
    setText('');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
            Professional Editor Tools
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter">
            Character <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Counter</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Analyze your content with precision. Get instant metrics on characters, words, and readability with our high-performance text processor.
          </p>
        </header>

        {/* Main Interface */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Area */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                  <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <AlignLeft size={16} className="text-indigo-400" /> Editor
                  </span>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleClear}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Clear text"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                      disabled={!text}
                    >
                      {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                      {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your content here or start typing..."
                  className="w-full h-[450px] bg-transparent p-8 text-lg text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-400" /> Real-time Analytics
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <StatsCard 
                  label="Characters" 
                  value={stats.chars.toLocaleString()} 
                  icon={<Type size={20} />} 
                />
                <StatsCard 
                  label="Words" 
                  value={stats.words.toLocaleString()} 
                  icon={<FileText size={20} />} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-xs mb-1 uppercase font-bold tracking-wider">Sentences</div>
                    <div className="text-xl font-bold text-white">{stats.sentences}</div>
                  </div>
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-xs mb-1 uppercase font-bold tracking-wider">Paragraphs</div>
                    <div className="text-xl font-bold text-white">{stats.paragraphs}</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-6 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Hash size={14} /> Excl. Spaces
                    </span>
                    <span className="text-indigo-300 font-mono">{stats.charsNoSpaces}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Clock size={14} /> Reading Time
                    </span>
                    <span className="text-cyan-300 font-mono">~{stats.readingTime} min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Tip/Status */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 border border-indigo-500/20 rounded-2xl p-5">
              <p className="text-indigo-200 text-sm leading-relaxed">
                <span className="font-bold text-white block mb-1">Editor Pro Tip:</span>
                For SEO optimization, keep your meta descriptions between 150-160 characters and titles under 60.
              </p>
            </div>
          </div>
        </main>

        {/* Footer info */}
        <footer className="pt-8 border-t border-slate-900 text-center">
          <p className="text-slate-500 text-sm">
            Developed with Next.js and Tailwind CSS • Secure, Browser-based processing.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CharacterCountTool;