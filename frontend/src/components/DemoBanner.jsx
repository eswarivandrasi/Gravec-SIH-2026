import React from 'react';
import { AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

export const DemoBanner = () => {
  return (
    <div className="bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-700/90 text-amber-50 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md border-b border-amber-400/30">
      <div className="flex items-center gap-2">
        <span className="bg-black/30 text-amber-200 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase border border-amber-300/40">
          SIH 2026 Prototype (SIH26070)
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          <span>DEMO DATA & SIMULATION MODE: Designed for offline evaluation without live satellite APIs.</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-3 text-[11px] text-amber-100/90">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Fused INSAT-3DR / NOAA Satellite Model
        </span>
        <span className="border-l border-amber-400/40 pl-3 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> IMD Standard Category Scales
        </span>
      </div>
    </div>
  );
};

export default DemoBanner;
