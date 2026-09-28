import React, { useState, useEffect } from 'react';
import { BarChart3, Cpu, Sparkles, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';
import { api } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const ModelEvaluation = () => {
  const [evalData, setEvalData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evalRes, verRes] = await Promise.all([
          api.getModelEvaluation(),
          api.getModelVersions()
        ]);
        setEvalData(evalRes.data);
        setVersions(verRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              AI MODEL REGISTRY & BENCHMARKS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Model Evaluation & Multi-Source Metrics
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Independent validation metrics computed across IMD Best Track Dataset archives and satellite multi-spectral bands.
          </p>
        </div>

        <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold self-start">
          DEMO MODEL METRICS
        </span>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700 shadow-lg space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase">Overall Accuracy</div>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">
            {evalData ? `${(evalData.overall_accuracy * 100).toFixed(1)}%` : '93.4%'}
          </div>
          <div className="text-[10px] text-emerald-400">18,400 Historical Samples</div>
        </div>

        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700 shadow-lg space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase">Macro F1 Score</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {evalData ? `${(evalData.f1_macro * 100).toFixed(1)}%` : '92.6%'}
          </div>
          <div className="text-[10px] text-slate-400">Harmonic Balance</div>
        </div>

        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700 shadow-lg space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase">Precision (Macro)</div>
          <div className="text-3xl font-extrabold text-teal-400 font-mono">
            {evalData ? `${(evalData.precision_macro * 100).toFixed(1)}%` : '93.8%'}
          </div>
          <div className="text-[10px] text-slate-400">Low False Alarm Rate</div>
        </div>

        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700 shadow-lg space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase">Recall (Macro)</div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {evalData ? `${(evalData.recall_macro * 100).toFixed(1)}%` : '91.5%'}
          </div>
          <div className="text-[10px] text-slate-400">High Sensitivity</div>
        </div>

      </div>

      {/* Grid: Confusion Matrix + Feature Importance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Confusion Matrix */}
        <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Layers className="w-4 h-4 text-cyan-400" />
              Confusion Matrix (IMD Categories)
            </h2>
            <span className="text-[10px] font-mono text-slate-400">6x6 Matrix</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="text-[10px] font-mono text-slate-400 border-b border-slate-800">
                  <th className="p-1 text-left">Actual \ Pred</th>
                  <th className="p-1">D</th>
                  <th className="p-1">CS</th>
                  <th className="p-1">SCS</th>
                  <th className="p-1">VSCS</th>
                  <th className="p-1">ESCS</th>
                  <th className="p-1">SuCS</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs divide-y divide-slate-800/60">
                {evalData?.confusion_matrix?.matrix?.map((row, rIdx) => {
                  const label = evalData.confusion_matrix.labels[rIdx];
                  return (
                    <tr key={rIdx}>
                      <td className="p-2 text-left font-bold text-slate-300 text-[11px]">{label}</td>
                      {row.map((val, cIdx) => (
                        <td 
                          key={cIdx} 
                          className={`p-2 font-bold ${
                            rIdx === cIdx 
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-extrabold' 
                              : val > 0 ? 'bg-slate-900/60 text-amber-300' : 'text-slate-600'
                          }`}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Sensor Fusion Feature Importance
            </h2>
            <span className="text-[10px] font-mono text-slate-400">SHAP Attributions</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={evalData?.feature_importance || []}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 0.35]} />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="importance" fill="#5bc0be" radius={[0, 4, 4, 0]} name="SHAP Feature Weight" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Model Versions Registry Table */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider border-b border-slate-800 pb-3">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Active Model Architecture Registry
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">Parameters</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {versions.map((ver) => (
                <tr key={ver.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-white">{ver.name}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{ver.model_type}</td>
                  <td className="py-3 px-3 text-cyan-400">{ver.version}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{(ver.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-teal-300 font-bold">{(ver.f1_score * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-slate-400">{ver.parameters_count}</td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[10px] font-sans">
                      Active (Demo)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ModelEvaluation;
