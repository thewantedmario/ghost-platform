"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Scale, 
  Ruler, 
  Thermometer, 
  Box, 
  Maximize,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type UnitCategory = 'Length' | 'Weight' | 'Temperature' | 'Volume' | 'Area';

interface UnitOption {
  label: string;
  value: string;
  factor?: number; // Relative to a base unit (m, kg, L, sqm)
}

interface UnitData {
  [key: string]: UnitOption[];
}

const UNIT_DATA: UnitData = {
  Length: [
    { label: 'Meters (m)', value: 'm', factor: 1 },
    { label: 'Kilometers (km)', value: 'km', factor: 1000 },
    { label: 'Centimeters (cm)', value: 'cm', factor: 0.01 },
    { label: 'Millimeters (mm)', value: 'mm', factor: 0.001 },
    { label: 'Miles (mi)', value: 'mi', factor: 1609.34 },
    { label: 'Yards (yd)', value: 'yd', factor: 0.9144 },
    { label: 'Feet (ft)', value: 'ft', factor: 0.3048 },
    { label: 'Inches (in)', value: 'in', factor: 0.0254 },
  ],
  Weight: [
    { label: 'Kilograms (kg)', value: 'kg', factor: 1 },
    { label: 'Grams (g)', value: 'g', factor: 0.001 },
    { label: 'Milligrams (mg)', value: 'mg', factor: 0.000001 },
    { label: 'Pounds (lb)', value: 'lb', factor: 0.453592 },
    { label: 'Ounces (oz)', value: 'oz', factor: 0.0283495 },
    { label: 'Metric Tons (t)', value: 't', factor: 1000 },
  ],
  Temperature: [
    { label: 'Celsius (°C)', value: 'C' },
    { label: 'Fahrenheit (°F)', value: 'F' },
    { label: 'Kelvin (K)', value: 'K' },
  ],
  Volume: [
    { label: 'Liters (L)', value: 'L', factor: 1 },
    { label: 'Milliliters (mL)', value: 'ml', factor: 0.001 },
    { label: 'Gallons (gal)', value: 'gal', factor: 3.78541 },
    { label: 'Cups', value: 'cup', factor: 0.236588 },
    { label: 'Cubic Meters (m³)', value: 'm3', factor: 1000 },
  ],
  Area: [
    { label: 'Square Meters (m²)', value: 'sqm', factor: 1 },
    { label: 'Square Kilometers (km²)', value: 'sqkm', factor: 1000000 },
    { label: 'Square Feet (ft²)', value: 'sqft', factor: 0.092903 },
    { label: 'Acres', value: 'ac', factor: 4046.86 },
    { label: 'Hectares', value: 'ha', factor: 10000 },
  ],
};

const CATEGORIES: { name: UnitCategory; icon: React.ReactNode }[] = [
  { name: 'Length', icon: <Ruler className="w-4 h-4" /> },
  { name: 'Weight', icon: <Scale className="w-4 h-4" /> },
  { name: 'Temperature', icon: <Thermometer className="w-4 h-4" /> },
  { name: 'Volume', icon: <Box className="w-4 h-4" /> },
  { name: 'Area', icon: <Maximize className="w-4 h-4" /> },
];

export default function UnitConverter() {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('Length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>(UNIT_DATA['Length'][0].value);
  const [toUnit, setToUnit] = useState<string>(UNIT_DATA['Length'][1].value);
  const [result, setResult] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius = value;
    if (from === 'F') celsius = (value - 32) * (5 / 9);
    if (from === 'K') celsius = value - 273.15;

    if (to === 'C') return celsius;
    if (to === 'F') return celsius * (9 / 5) + 32;
    if (to === 'K') return celsius + 273.15;
    return value;
  };

  const handleConvert = useCallback(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setResult(null);
      return;
    }

    if (activeCategory === 'Temperature') {
      setResult(convertTemperature(val, fromUnit, toUnit));
      return;
    }

    const units = UNIT_DATA[activeCategory];
    const fromObj = units.find((u) => u.value === fromUnit);
    const toObj = units.find((u) => u.value === toUnit);

    if (fromObj?.factor && toObj?.factor) {
      const baseValue = val * fromObj.factor;
      const converted = baseValue / toObj.factor;
      setResult(converted);
    }
  }, [activeCategory, inputValue, fromUnit, toUnit]);

  useEffect(() => {
    handleConvert();
  }, [handleConvert]);

  const handleCategoryChange = (category: UnitCategory) => {
    setActiveCategory(category);
    setFromUnit(UNIT_DATA[category][0].value);
    setToUnit(UNIT_DATA[category][1].value);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const copyToClipboard = () => {
    if (result !== null) {
      navigator.clipboard.writeText(result.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Unit Converter
          </h1>
          <p className="text-zinc-500 mt-2 text-sm uppercase tracking-widest">Precision Utility Engine</p>
        </div>

        {/* Main Interface */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-black/40 rounded-2xl border border-zinc-800/50">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.name
                    ? 'bg-zinc-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
            {/* Input Side */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">From</label>
              <div className="relative">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 px-5 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="relative group">
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full appearance-none bg-zinc-800/30 border border-zinc-800/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
                >
                  {UNIT_DATA[activeCategory].map((u) => (
                    <option key={u.value} value={u.value} className="bg-zinc-900">
                      {u.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pb-2 md:pb-12">
              <button
                onClick={swapUnits}
                className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-all transform active:scale-95"
              >
                <ArrowRightLeft className="w-5 h-5 text-zinc-300" />
              </button>
            </div>

            {/* Output Side */}
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">To</label>
              <div className="relative">
                <div className="w-full bg-white/[0.03] border border-zinc-800 rounded-2xl py-4 px-5 text-2xl font-semibold text-zinc-100 min-h-[68px] flex items-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={result}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="truncate"
                    >
                      {result !== null ? result.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              <div className="relative group">
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full appearance-none bg-zinc-800/30 border border-zinc-800/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
                >
                  {UNIT_DATA[activeCategory].map((u) => (
                    <option key={u.value} value={u.value} className="bg-zinc-900">
                      {u.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span className="text-[11px] font-medium uppercase tracking-tight">Real-time Conversion</span>
            </div>
            <button
              onClick={copyToClipboard}
              disabled={result === null}
              className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold transition-all duration-300 ${
                copied 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-zinc-100 text-black hover:bg-white active:scale-95 disabled:opacity-50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  COPIED
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  COPY RESULT
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Tags */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 opacity-40">
           {['No-Latency', 'Browser-Safe', '64-bit Precision'].map((tag) => (
             <span key={tag} className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full">
               {tag}
             </span>
           ))}
        </div>
      </div>

      <style jsx global>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}