'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Trash2, Hash, AlignLeft, Type, Clock, FileText } from 'lucide-react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
}

const CharacterCountTool: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const calculateStats = useCallback((input: string) => {
    const trimmedText = input.trim();
    
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, '').length;
    
    const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
    const sentences = trimmedText ? trimmedText.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = trimmedText ? trimmedText.split(/\n+/).filter(Boolean).length : 0;
    
    // Average reading speed: 200 words per minute
    const readingTime = Math.ceil(words / 200);

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
    });
  }, []);

  useEffect(() => {
    calculateStats(text);
  }, [text, calculateStats]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Character Count Pro
          </h1>
          <p className="text-slate-400 text-lg">
            High-precision text analysis for professional editors and writers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <textarea
                  className="w-full h-80 p-6 bg-transparent text-slate-200 focus:outline-none resize-none placeholder:text-slate-600 text-lg leading-relaxed"
                  placeholder="Paste your content here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                
                <div className="flex items-center justify-end gap-3 p-4 bg-slate-900/50 border-t border-slate-800">
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${
                      isCopied 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    <Copy size={16} />
                    {isCopied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <StatCard 
              label="Characters" 
              value={stats.characters} 
              icon={<Hash className="text-indigo-400" size={18} />} 
              subValue={`${stats.charactersNoSpaces} (no spaces)`}
            />
            <StatCard 
              label="Words" 
              value={stats.words} 
              icon={<Type className="text-cyan-400" size={18} />} 
            />
            <StatCard 
              label="Sentences" 
              value={stats.sentences} 
              icon={<AlignLeft className="text-purple-400" size={18} />} 
            />
            <StatCard 
              label="Paragraphs" 
              value={stats.paragraphs} 
              icon={<FileText className="text-blue-400" size={18} />} 
            />
            <StatCard 
              label="Reading Time" 
              value={`${stats.readingTime} min`} 
              icon={<Clock className="text-amber-400" size={18} />} 
              isHighlight
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© 2024 Character Count Pro. All processing happens locally in your browser.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">API Docs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
  isHighlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, subValue, isHighlight }) => (
  <div className={`p-5 rounded-2xl border transition-all duration-300 ${
    isHighlight 
    ? 'bg-indigo-600/10 border-indigo-500/30' 
    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
  }`}>
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
        {icon}
      </div>
      <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-bold text-white tracking-tight">
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-slate-500 font-medium">
          {subValue}
        </div>
      )}
    </div>
  </div>
);

export default CharacterCountTool;