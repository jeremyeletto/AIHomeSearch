import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

// --- Inline SVG Icons ---
function IconWand(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
      <path fill="currentColor" d="M3.53 20.47a1.5 1.5 0 0 1 0-2.12l8.6-8.6a1.5 1.5 0 0 1 2.12 0l.94.94a1.5 1.5 0 0 1 0 2.12l-8.6 8.6a1.5 1.5 0 0 1-2.12 0l-.94-.94Z"/>
    </svg>
  );
}

function IconImage(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
      <path fill="currentColor" d="M5 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H5Z"/>
    </svg>
  );
}

// --- Image Assets ---
// Embed the before image directly as default
const YELLOW_HOUSE = "sandbox:/mnt/data/IMG_4498.png";

// --- Constants & Helpers ---
const PRESET_MODERN_FULL = "Imagine Modern white exterior, black trim, and walkway";
const DEFAULT_PROMPTS = [
  PRESET_MODERN_FULL,
  "Add Stone Walkway",
  "Modern Black Windows",
  "Imagine White Vinyl Siding",
  "Wrap-around Porch",
  "Brick Exterior",
];

function validatePrompt(p) {
  return typeof p === "string" && p.trim().length > 0;
}

function styleFromPrompts(features) {
  const map = {
    "Imagine White Vinyl Siding": "grayscale(0.1) brightness(1.1)",
    "Add Stone Walkway": "contrast(1.05) saturate(1.03)",
    "Modern Black Windows": "contrast(1.05) brightness(1.05)",
    "Wrap-around Porch": "sepia(0.1) saturate(1.03)",
    "Brick Exterior": "saturate(1.15) hue-rotate(-5deg)",
  };
  return features.map((f) => map[f] ?? "none").join(" ");
}

function normalizeFeatureName(name) {
  const n = name.trim().toLowerCase();
  if (n === "black modern windows") return "Modern Black Windows";
  return name.trim();
}

function estimateDeltaForFeature(promptName, basePrice) {
  if (promptName === PRESET_MODERN_FULL) return 150000;
  const fixed = {
    "Add Stone Walkway": 8000,
    "Imagine White Vinyl Siding": 4500,
  };
  const pct = {
    "Modern Black Windows": 0.02,
    "Wrap-around Porch": 0.04,
    "Brick Exterior": 0.03,
  };
  if (fixed[promptName] != null) return fixed[promptName];
  if (pct[promptName] != null) return Math.round(basePrice * pct[promptName]);
  return 3000;
}

function computeEstimate(basePrice, features) {
  const uplift = features.reduce((sum, f) => sum + (f.delta || 0), 0);
  return { uplift, estimate: basePrice + uplift };
}

function formatUSD(n) {
  try {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  } catch {
    return `$${Math.round(n)}`;
  }
}

export default function HouseVisualizer() {
  const [imageUrl] = useState(YELLOW_HOUSE);
  const [basePrice] = useState(500000);
  const [appliedFeatures, setAppliedFeatures] = useState([]);
  const [customPrompt, setCustomPrompt] = useState("");

  const prompts = useMemo(() => DEFAULT_PROMPTS, []);
  const filterStyle = useMemo(
    () => ({ filter: styleFromPrompts(appliedFeatures.map((f) => f.name)) }),
    [appliedFeatures]
  );
  const valuation = useMemo(() => computeEstimate(basePrice, appliedFeatures), [basePrice, appliedFeatures]);

  const applyFeature = (rawName) => {
    if (!validatePrompt(rawName)) return;
    const name = normalizeFeatureName(rawName);
    setAppliedFeatures((prev) => {
      if (prev.some((f) => f.name === name)) return prev;
      const delta = estimateDeltaForFeature(name, basePrice);
      return [...prev, { name, delta }];
    });
  };

  const removeFeature = (name) => setAppliedFeatures((prev) => prev.filter((f) => f.name !== name));
  const clearAll = () => setAppliedFeatures([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AI Home Visualizer</h1>
                <p className="text-sm text-slate-600">Transform your dream home</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-slate-600">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                AI Powered
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image and Presets */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="space-y-6"
          >
            {/* Image Card */}
            <Card className="overflow-hidden shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={imageUrl}
                    alt="House preview"
                    className="w-full h-auto transition-all duration-500 group-hover:scale-105"
                    style={filterStyle}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-slate-700 shadow-lg">
                    AI Enhanced
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preset Designs */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <IconWand className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Preset Designs</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prompts.map((prompt) => (
                    <Button 
                      key={prompt} 
                      size="sm" 
                      variant="outline" 
                      onClick={() => applyFeature(prompt)}
                      className="h-auto p-3 text-left justify-start border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
                    >
                      <IconWand className="mr-2 w-4 h-4 text-indigo-600" /> 
                      <span className="text-sm leading-tight">{prompt}</span>
                    </Button>
                  ))}
                </div>

                {/* Applied Features Pills */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-700">Applied Features</h3>
                    {appliedFeatures.length > 0 && (
                      <Button size="sm" variant="ghost" onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-700">
                        Clear all
                      </Button>
                    )}
                  </div>
                  {appliedFeatures.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {appliedFeatures.map((f) => (
                        <span 
                          key={f.name} 
                          className="px-3 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 text-sm flex items-center gap-2 border border-indigo-200 shadow-sm"
                        >
                          <span className="text-xs">✨</span>
                          {f.name}
                          <button 
                            aria-label={`Remove ${f.name}`} 
                            onClick={() => removeFeature(f.name)} 
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No features added yet. Select presets above to get started.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Controls and Estimates */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }} 
            className="space-y-6"
          >
            {/* Welcome Section */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent mb-4">
                Visualize Your Dream Home
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Select design presets below the photo. You can stack multiple features—e.g., walkway + modern black windows.
              </p>
            </div>

            {/* Custom Request */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <IconImage className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Custom Request</h2>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="e.g., Add a two-car garage with dormers"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                  <Button 
                    variant="default" 
                    onClick={() => applyFeature(customPrompt)} 
                    disabled={!validatePrompt(customPrompt)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    <IconImage className="mr-2 w-4 h-4" /> 
                    Submit Custom Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Value */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">$</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Estimated Value</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 px-4 bg-white/60 rounded-lg border border-slate-200">
                    <span className="text-slate-600 font-medium">Base Value</span>
                    <span className="text-lg font-semibold text-slate-900">{formatUSD(basePrice)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 bg-white/60 rounded-lg border border-slate-200">
                    <span className="text-slate-600 font-medium">Feature Uplift</span>
                    <span className="text-lg font-semibold text-indigo-600">+{formatUSD(valuation.uplift)}</span>
                  </div>
                  
                  <div className="border-t border-slate-300 pt-4">
                    <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <span className="text-slate-900 font-bold text-lg">New Estimate</span>
                      <span className="text-2xl font-bold text-green-600">{formatUSD(valuation.estimate)}</span>
                    </div>
                  </div>
                </div>

                {/* Applied Features List */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-700">Applied Features</span>
                    {appliedFeatures.length > 0 && (
                      <button 
                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium" 
                        onClick={clearAll}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  
                  {appliedFeatures.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🏠</span>
                      </div>
                      <p className="text-sm">No features added yet.</p>
                      <p className="text-xs text-slate-400 mt-1">Select presets to see your home transform!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {appliedFeatures.map((f) => (
                        <div key={f.name} className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-lg border border-slate-200 hover:bg-white/80 transition-colors">
                          <span className="text-sm text-slate-700 flex items-center">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            {f.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-green-600">+{formatUSD(f.delta)}</span>
                            <button 
                              className="w-6 h-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors" 
                              onClick={() => removeFeature(f.name)}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function runSmokeTests() {
  try {
    console.assert(styleFromPrompts(["Add Stone Walkway"]).includes("contrast"), "Stone walkway style");
    console.assert(styleFromPrompts(["Modern Black Windows"]).includes("contrast"), "Windows style");
    const base = 500000;
    const walkway = { name: "Add Stone Walkway", delta: estimateDeltaForFeature("Add Stone Walkway", base) };
    const windows = { name: "Modern Black Windows", delta: estimateDeltaForFeature("Modern Black Windows", base) };
    const combo = computeEstimate(base, [walkway, windows]);
    console.assert(combo.estimate === base + walkway.delta + windows.delta, "Stacked features should sum");

    const modernPreset = { name: PRESET_MODERN_FULL, delta: estimateDeltaForFeature(PRESET_MODERN_FULL, base) };
    console.assert(modernPreset.delta === 150000, "Modern white preset should add $150,000");
    const modernEstimate = computeEstimate(base, [modernPreset]);
    console.assert(modernEstimate.estimate === 650000, "Estimate should be $650,000 with modern preset");

    console.assert(typeof YELLOW_HOUSE === "string" && /IMG_4498\.png$/.test(YELLOW_HOUSE), "YELLOW_HOUSE should be IMG_4498.png");
    console.log("✅ Tests passed");
  } catch (err) {
    console.error("❌ Tests failed", err);
  }
}

if (typeof window !== "undefined") setTimeout(runSmokeTests, 50);
