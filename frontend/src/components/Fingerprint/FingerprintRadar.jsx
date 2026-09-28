import React from 'react';
import { Fingerprint, Cpu, Check, Layers } from 'lucide-react';

export const FingerprintRadar = ({ fingerprint = {} }) => {
  const fields = [
    { label: "Latitude", val: `${fingerprint.latitude ?? 15.8}°N`, norm: 0.65 },
    { label: "Longitude", val: `${fingerprint.longitude ?? 84.2}°E`, norm: 0.70 },
    { label: "Wind Speed", val: `${fingerprint.wind_speed ?? 145} km/h`, norm: 0.85, highlight: true },
    { label: "Atm. Pressure", val: `${fingerprint.pressure ?? 968} hPa`, norm: 0.90, highlight: true },
    { label: "Sea Surface Temp", val: `${fingerprint.sst ?? 30.5} °C`, norm: 0.88 },
    { label: "Movement Speed", val: `${fingerprint.movement_speed ?? 16} km/h`, norm: 0.45 },
    { label: "Cloud Organization", val: `${Math.round((fingerprint.cloud_organization ?? 0.88) * 100)}%`, norm: fingerprint.cloud_organization ?? 0.88 },
    { label: "Spiral Structure", val: `${Math.round((fingerprint.spiral_structure ?? 0.92) * 100)}%`, norm: fingerprint.spiral_structure ?? 0.92 }
  ];

  return (
    <div className="bg-[#0e172e] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Cyclone Fingerprint Matrix</h3>
            <p className="text-xs text-slate-400">Standardized Multi-Source 8-D Feature Embedding</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 rounded">
          Vectorized JSON
        </span>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fields.map((f, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-xl border transition-all ${
              f.highlight 
                ? 'bg-cyan-950/30 border-cyan-500/40 shadow-sm' 
                : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">{f.label}</div>
            <div className="text-sm font-bold text-white font-mono">{f.val}</div>
            
            {/* Normalized Visual Mini Bar */}
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, f.norm * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Raw Vector Payload */}
      {fingerprint.vector_json && (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Vector Embedding `f(x)`</span>
            <span className="text-cyan-400 font-bold">8 Dimensions</span>
          </div>
          <div className="font-mono text-[11px] text-cyan-300 break-all bg-slate-900 p-2 rounded border border-slate-800/80">
            [{fingerprint.vector_json.join(', ')}]
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800">
        <span>Movement: {fingerprint.movement_direction || 'NNW'} @ {fingerprint.movement_speed || 16} km/h</span>
        <span className="text-cyan-400 font-semibold">Intensity: {fingerprint.intensity_trend || 'Intensifying'}</span>
      </div>

    </div>
  );
};

export default FingerprintRadar;
