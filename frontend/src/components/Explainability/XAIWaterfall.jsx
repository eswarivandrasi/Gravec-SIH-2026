import React from 'react';
import { Sparkles, HelpCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export const XAIWaterfall = ({ 
  attributions = {}, 
  keyFactors = [], 
  summary = "",
  confidenceBreakdown = null
}) => {
  const defaultAttributions = {
    "Central Atmospheric Pressure Drop Rate": 0.28,
    "Sea Surface Temperature Heat Flux (>28°C)": 0.24,
    "Satellite Spiral Band Curvature Index": 0.20,
    "Convective Cloud Canopy Symmetry": 0.16,
    "Low Vertical Wind Shear Proxy": 0.12
  };

  const featureData = Object.keys(attributions).length > 0 ? attributions : defaultAttributions;

  return (
    <div className="bg-[#0e172e] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Explainable AI (XAI) Feature Attribution</h3>
            <p className="text-xs text-slate-400">Multi-source scientific evidence behind the AI prediction</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-700/40 px-2 py-0.5 rounded">
          SHAP / Rule Hybrid
        </span>
      </div>

      {/* Summary Box */}
      {summary && (
        <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-cyan-300 font-mono text-[11px] uppercase block mb-1">Model Synthesis:</span>
            {summary}
          </div>
        </div>
      )}

      {/* Feature Attribution Bars */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          Feature Contribution Weights
        </div>
        
        {Object.entries(featureData).map(([feature, weight], idx) => {
          const percent = Math.round(weight * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">{feature}</span>
                <span className="font-mono text-cyan-300 font-bold">{percent}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Meteorological Evidence Points */}
      {keyFactors && keyFactors.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Key Observed Meteorological Drivers</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {keyFactors.map((factor, i) => (
              <div 
                key={i} 
                className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2 font-sans"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Breakdown */}
      {confidenceBreakdown && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Satellite Weight</div>
            <div className="text-xs font-bold text-cyan-300">
              {Math.round((confidenceBreakdown.satellite_pattern_weight || 0.36) * 100)}%
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Thermal Flux</div>
            <div className="text-xs font-bold text-amber-300">
              {Math.round((confidenceBreakdown.thermodynamic_weight || 0.38) * 100)}%
            </div>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Kinematic Track</div>
            <div className="text-xs font-bold text-emerald-300">
              {Math.round((confidenceBreakdown.kinematic_track_weight || 0.26) * 100)}%
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default XAIWaterfall;
