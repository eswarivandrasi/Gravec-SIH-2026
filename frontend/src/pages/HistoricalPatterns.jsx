import React, { useState, useEffect } from 'react';
import { History, AlertTriangle, ShieldCheck, Search, Compass, Wind, ChevronRight } from 'lucide-react';
import { api } from '../api/client';

export const HistoricalPatterns = () => {
  const [cyclones, setCyclones] = useState([]);
  const [selectedCycloneId, setSelectedCycloneId] = useState(1);
  const [similarityData, setSimilarityData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInit();
  }, []);

  const fetchInit = async () => {
    try {
      const res = await api.getCyclones();
      setCyclones(res.data);
      if (res.data.length > 0) {
        fetchSimilarity(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSimilarity = async (id) => {
    try {
      setLoading(true);
      setSelectedCycloneId(id);
      const res = await api.getSimilarPatterns(id);
      setSimilarityData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            Vector Cosine Pattern Engine
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Historical Cyclone Pattern Similarity Search
        </h1>
        <p className="text-xs text-slate-300 max-w-3xl">
          Fuses normalized 8-dimensional cyclone fingerprints (pressure, sustained wind, trajectory angle, sea surface heat flux, and spiral rainband curvature) to discover the top 5 historical analogues.
        </p>

        {/* Mandatory Hackathon Disclaimer */}
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-3.5 text-xs text-amber-200 flex items-center gap-2.5 font-mono">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>IMPORTANT SCIENTIFIC NOTICE:</strong> "Historical similarity does not guarantee future behavior." Real-time emergency evacuation orders must be issued exclusively in accordance with official IMD and NDRF directives.
          </span>
        </div>
      </div>

      {/* Target Cyclone Selector */}
      <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700 shadow-lg flex flex-wrap items-center gap-3">
        <span className="text-xs font-mono text-slate-300">Select Target System:</span>
        {cyclones.map((c) => (
          <button
            key={c.id}
            onClick={() => fetchSimilarity(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedCycloneId === c.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {c.name} ({c.classification})
          </button>
        ))}
      </div>

      {/* Top 5 Historical Analogues Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          Top 5 Similar Historical Storm Analogues
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {similarityData?.similar_patterns?.map((item, idx) => (
            <div 
              key={item.id || idx} 
              className="bg-[#0e172e] p-5 rounded-2xl border border-slate-700 shadow-xl space-y-3 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                    <h3 className="text-base font-extrabold text-white font-mono">{item.name}</h3>
                    <span className="text-xs text-amber-300 font-semibold font-mono">({item.year})</span>
                  </div>
                  <div className="text-xs text-amber-400">{item.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-cyan-300 font-mono">
                    {item.similarity_score}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Vector Similarity</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.context_description}</p>

              {/* Decomposed Factor Similarity Matrix */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Multi-Dimensional Match Matrix</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(item.similarity_factors || {}).map(([fact, sc], i) => (
                    <div key={i} className="flex justify-between text-slate-300">
                      <span className="text-slate-400 truncate">{fact}:</span>
                      <span className="text-cyan-400 font-bold ml-1">{sc}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono pt-1">
                <div>Landfall: <strong className="text-slate-200">{item.landfall_location}</strong></div>
                <div>Peak Wind: <strong className="text-red-400">{item.max_wind_speed} km/h</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HistoricalPatterns;
