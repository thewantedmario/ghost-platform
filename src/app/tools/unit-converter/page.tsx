'use client';

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
  Layers 
} from 'lucide-react';

type Category = 'Length' | 'Weight' | 'Temperature' | 'Volume' | 'Area';

interface Unit {
  label: string;
  value: string;
  factor?: number; // Relative to base unit
}

interface UnitData {
  [key: string]: Unit[];
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
  ],
  Temperature: [
    { label: 'Celsius (°C)', value: 'c' },
    { label: 'Fahrenheit (°F)', value: 'f' },
    { label: 'Kelvin (K)', value: 'k' },
  ],
  Volume: [
    { label: 'Liters (L)', value: 'l', factor: 1 },
    { label: 'Milliliters (ml)', value: 'ml', factor: 0.001 },
    { label: 'Gallons (gal)', value: 'gal', factor: 3.78541 },
    { label: 'Quarts (qt)', value: 'qt', factor: 0.946353 },
    { label: 'Pints (pt)', value: 'pt', factor: 0.473176 },
    { label: 'Cups', value: 'cup', factor: 0.24 },
  ],
  Area: [
    { label: 'Sq. Meters (m²)', value: 'm2', factor: 1 },
    { label: 'Sq. Kilometers (km²)', value: 'km2', factor: 1000000 },
    { label: 'Sq. Miles (mi²)', value: 'mi2', factor: 2589988.11 },
    { label: 'Acres (ac)', value: 'ac', factor: 4046.86 },
    { label: 'Hectares (ha)', value: 'ha', factor: 10000 },
  ],
};

const CATEGORIES: { name: Category; icon: React.ReactNode }[] = [
  { name: 'Length', icon: <Ruler className="w-4 h-4" /> },
  { name: 'Weight', icon: <Scale className="w-4 h-4" /> },
  { name: 'Temperature', icon: <Thermometer className="w-4 h-4" /> },
  { name: 'Volume', icon: <Box className="w-4 h-4" /> },
  { name: 'Area', icon: <Layers className="w-4 h-4" /> },
];

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('Length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>(UNIT_DATA['Length'][0].value);
  const [toUnit, setToUnit] = useState<string>(UNIT_DATA['Length'][1].value);
  const [result, setResult] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const convertTemperature = (val: number, from: string, to: string): number => {
    let celsius = val;
    if (from === 'f') celsius = (val - 32) * (5 / 9);
    if (from === 'k') celsius = val - 273.15;

    if (to === 'c') return celsius;
    if (to === 'f') return celsius * (9 / 5) + 32;
    if (to === 'k') return celsius + 273.15;
    return val;
  };

  const handleConversion = useCallback(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setResult(0);
      return;
    }

    if (category === 'Temperature') {
      setResult(convertTemperature(val, fromUnit, toUnit));
      return;
    }

    const units = UNIT_DATA[category];
    const fromFactor = units.find((u) => u.value === fromUnit)?.factor || 1;
    const toFactor = units.find((u) => u.value === toUnit)?.factor || 1;

    const baseValue = val * fromFactor;
    const converted = baseValue / toFactor;
    setResult(converted);
  }, [category, fromUnit, toUnit, inputValue]);

  useEffect(() => {
    handleConversion();
  }, [handleConversion]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setFromUnit(UNIT_DATA[cat][0].value);
    setToUnit(UNIT_DATA[cat][1].value);
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Unit Converter
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Professional grade conversion utility</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryChange(cat.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                category === cat.name
                  ? 'bg-zinc-800 text-white shadow-lg shadow-black/20'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Interaction Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* Input Side */}
          <div className="space-y-4">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">From</label>
            <div className="space-y-3">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all placeholder:text-zinc-700"
                placeholder="0.00"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                {UNIT_DATA[category].map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button (Mobile hidden/desktop absolute or in-between) */}
          <div className="flex justify-center md:absolute md:left-1/2 md:-translate-x-1/2 md:mb-14 z-10">
            <button 
              onClick={swapUnits}
              className="p-3 bg-zinc-800 border border-zinc-700 rounded-full hover:bg-zinc-700 text-indigo-400 transition-transform active:scale-95 shadow-xl"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Output Side */}
          <div className="space-y-4">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">To</label>
            <div className="space-y-3">
              <div className="relative group">
                <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-xl font-semibold text-indigo-100 overflow-hidden text-ellipsis whitespace-nowrap">
                  {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                {UNIT_DATA[category].map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-10 pt-6 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center text-zinc-600 text-xs gap-4">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time calculations
            </span>
            <span>High Precision (6 d.p.)</span>
          </div>
          <div className="flex gap-4">
             <button className="hover:text-zinc-400 transition-colors">Clear All</button>
             <button className="hover:text-zinc-400 transition-colors">Documentation</button>
          </div>
        </div>
      </div>
    </div>
  );
}