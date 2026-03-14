'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Scale, 
  Ruler, 
  Thermometer, 
  ChevronDown,
  RefreshCw
} from 'lucide-react';

type UnitCategory = 'length' | 'weight' | 'temperature';

interface UnitOption {
  label: string;
  value: string;
  factor?: number; // Relative to base unit (m, kg)
}

interface UnitData {
  [key: string]: {
    base: string;
    units: UnitOption[];
  };
}

const UNIT_DATA: UnitData = {
  length: {
    base: 'm',
    units: [
      { label: 'Meters (m)', value: 'm', factor: 1 },
      { label: 'Kilometers (km)', value: 'km', factor: 1000 },
      { label: 'Centimeters (cm)', value: 'cm', factor: 0.01 },
      { label: 'Millimeters (mm)', value: 'mm', factor: 0.001 },
      { label: 'Inches (in)', value: 'in', factor: 0.0254 },
      { label: 'Feet (ft)', value: 'ft', factor: 0.3048 },
      { label: 'Yards (yd)', value: 'yd', factor: 0.9144 },
      { label: 'Miles (mi)', value: 'mi', factor: 1609.34 },
    ],
  },
  weight: {
    base: 'kg',
    units: [
      { label: 'Kilograms (kg)', value: 'kg', factor: 1 },
      { label: 'Grams (g)', value: 'g', factor: 0.001 },
      { label: 'Milligrams (mg)', value: 'mg', factor: 0.000001 },
      { label: 'Pounds (lb)', value: 'lb', factor: 0.453592 },
      { label: 'Ounces (oz)', value: 'oz', factor: 0.0283495 },
      { label: 'Metric Tons (t)', value: 't', factor: 1000 },
    ],
  },
  temperature: {
    base: 'celsius',
    units: [
      { label: 'Celsius (°C)', value: 'celsius' },
      { label: 'Fahrenheit (°F)', value: 'fahrenheit' },
      { label: 'Kelvin (K)', value: 'kelvin' },
    ],
  },
};

const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>(UNIT_DATA.length.units[0].value);
  const [toUnit, setToUnit] = useState<string>(UNIT_DATA.length.units[1].value);
  const [result, setResult] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory);
    setFromUnit(UNIT_DATA[newCategory].units[0].value);
    setToUnit(UNIT_DATA[newCategory].units[1].value);
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius = value;
    if (from === 'fahrenheit') celsius = (value - 32) * (5 / 9);
    if (from === 'kelvin') celsius = value - 273.15;

    if (to === 'fahrenheit') return (celsius * 9) / 5 + 32;
    if (to === 'kelvin') return celsius + 273.15;
    return celsius;
  };

  const performConversion = useCallback(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setResult(null);
      return;
    }

    if (category === 'temperature') {
      setResult(convertTemperature(val, fromUnit, toUnit));
    } else {
      const fromFactor = UNIT_DATA[category].units.find((u) => u.value === fromUnit)?.factor || 1;
      const toFactor = UNIT_DATA[category].units.find((u) => u.value === toUnit)?.factor || 1;
      const baseValue = val * fromFactor;
      setResult(baseValue / toFactor);
    }
  }, [category, fromUnit, inputValue, toUnit]);

  useEffect(() => {
    performConversion();
  }, [performConversion]);

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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent mb-2">
            Unit Converter
          </h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest font-medium">
            Precision measurement tool
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#121214] border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/50 backdrop-blur-sm">
          
          {/* Category Selector */}
          <div className="flex bg-zinc-900/50 p-1 rounded-xl mb-8 border border-zinc-800/50">
            {(['length', 'weight', 'temperature'] as UnitCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  category === cat 
                    ? 'bg-zinc-800 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {cat === 'length' && <Ruler size={16} />}
                {cat === 'weight' && <Scale size={16} />}
                {cat === 'temperature' && <Thermometer size={16} />}
                <span className="capitalize">{cat}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">From</label>
                <div className="relative">
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  >
                    {UNIT_DATA[category].units.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-center justify-center pb-2 md:pb-6">
                <button 
                  onClick={swapUnits}
                  className="p-3 rounded-full bg-zinc-800 hover:bg-indigo-600 text-zinc-400 hover:text-white transition-all duration-300 group"
                >
                  <ArrowRightLeft size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">To</label>
                <div className="relative">
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  >
                    {UNIT_DATA[category].units.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
                <div className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-4 text-xl font-medium text-indigo-400 overflow-hidden text-ellipsis">
                  {result !== null ? result.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
                <RefreshCw size={12} className="animate-spin-slow" />
                Live calculation active
              </div>
              <button
                onClick={copyToClipboard}
                disabled={result === null}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Result</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-[#121214]/50 border border-zinc-800/50 rounded-2xl p-4 text-center">
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Status</div>
            <div className="text-emerald-500 text-xs font-medium flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </div>
          </div>
          <div className="bg-[#121214]/50 border border-zinc-800/50 rounded-2xl p-4 text-center">
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Precision</div>
            <div className="text-zinc-300 text-xs font-medium">6 Decimal Places</div>
          </div>
          <div className="bg-[#121214]/50 border border-zinc-800/50 rounded-2xl p-4 text-center">
            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Version</div>
            <div className="text-zinc-300 text-xs font-medium">v2.4.0-pro</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default UnitConverter;