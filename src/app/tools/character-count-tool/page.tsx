'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Copy, Trash2, Clock, AlignLeft, Hash, FileText, Layers, CheckCircle } from 'lucide-react';

const CharacterCounter = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: trimmedText ? trimmedText.split(/\s+/).length : 0,
      sentences: trimmedText ? trimmedText.split(/[.!?]+/).filter(Boolean).length : 0,
      paragraphs: trimmedText ? text.split(/\n\s*\n/).filter(Boolean).length : 0,
      readingTime: Math.ceil((trimmedText ? trimmedText.split(/\s+/).length : 0) / 200),
    };
  }, [text]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleClear = useCallback(() => {
    setText('');
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wider uppercase mb-4">
            Professional Tools
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
            Character Count Tool
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            Analyze your content with precision. Get instant metrics on characters, words, and readability for your professional copy.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Input Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your content here or start typing..."
                  className="w-full h-96 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none text-lg leading-relaxed shadow-2xl"
                />
                
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  <button
                    onClick={handleClear}
                    className="p-3 bg-neutral-800 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 rounded-xl transition-all duration-200 border border-neutral-700 hover:border-red-500/30"
                    title="Clear Text"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center space-x-2 px-5 py-3 rounded-xl transition-all duration-200 font-medium ${
                      copied 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={20} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={20} />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar (Optional context like character limit) */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex flex-col flex-1">
                <div className="flex justify-between mb-2 px-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Storage Usage (Simulated)</span>
                  <span className="text-xs text-neutral-400">{((stats.characters / 10000) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((stats.characters / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <StatCard 
                icon={<Hash className="text-indigo-400" size={20} />} 
                label="Characters" 
                value={stats.characters} 
                subValue={`${stats.charactersNoSpaces} (no spaces)`}
              />
              <StatCard 
                icon={<AlignLeft className="text-blue-400" size={20} />} 
                label="Words" 
                value={stats.words} 
              />
              <StatCard 
                icon={<FileText className="text-purple-400" size={20} />} 
                label="Sentences" 
                value={stats.sentences} 
              />
              <StatCard 
                icon={<Layers className="text-emerald-400" size={20} />} 
                label="Paragraphs" 
                value={stats.paragraphs} 
              />
              <StatCard 
                icon={<Clock className="text-amber-400" size={20} />} 
                label="Reading Time" 
                value={`${stats.readingTime} min`} 
                subValue="Avg. 200 wpm"
              />
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">Upgrade to Pro</h3>
                <p className="text-indigo-100 text-sm mb-4">Get SEO keyword density analysis and readability scoring.</p>
                <button className="w-full py-2.5 bg-white text-indigo-600 rounded-lg font-semibold text-sm hover:bg-neutral-100 transition-colors">
                  Learn More
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
                <FileText size={120} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string; // The '?' makes it optional
}

const StatCard = ({ icon, label, value, subValue }: StatCardProps) => (
  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl hover:border-neutral-700 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 bg-neutral-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-neutral-100 tracking-tight">{value}</span>
      {subValue && <span className="text-xs text-neutral-500 mt-1">{subValue}</span>}
    </div>
  </div>
);

export default CharacterCounter;