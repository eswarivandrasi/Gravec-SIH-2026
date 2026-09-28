import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Sparkles, 
  Wind, 
  Compass, 
  Thermometer, 
  Gauge, 
  Activity, 
  Layers, 
  History, 
  AlertTriangle, 
  PhoneCall, 
  Send,
  Eye,
  CheckCircle2,
  TrendingUp,
  Cpu,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api/client';
import { CycloneMap } from '../components/Map/CycloneMap';
import { FingerprintRadar } from '../components/Fingerprint/FingerprintRadar';
import { XAIWaterfall } from '../components/Explainability/XAIWaterfall';
import { KeypadPhoneModal } from '../components/IVR/KeypadPhoneModal';
import { useNotification } from '../context/NotificationContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';

export const CycloneDetail = () => {
  const { id } = useParams();
  const cycloneId = id ? parseInt(id) : 1;
  const { addToast } = useNotification();

  const [cyclone, setCyclone] = useState(null);
  const [observations, setObservations] = useState([]);
  const [satelliteImages, setSatelliteImages] = useState([]);
  const [fingerprint, setFingerprint] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [similarPatterns, setSimilarPatterns] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [shelters, setShelters] = useState([]);

  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ivrModalOpen, setIvrModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('STUDIO'); // STUDIO, FINGERPRINT, SIMILARITY, TREND, MAP

  // Alert form state
  const [alertSeverity, setAlertSeverity] = useState('EMERGENCY');
  const [selectedDistricts, setSelectedDistricts] = useState(['Visakhapatnam', 'Kakinada', 'Srikakulam']);

  useEffect(() => {
    fetchCycloneAll();
  }, [cycloneId]);

  const fetchCycloneAll = async () => {
    try {
      setLoading(true);
      const [cycRes, fpRes, simRes, trRes, shRes] = await Promise.all([
        api.getCycloneById(cycloneId),
        api.getFingerprint(cycloneId),
        api.getSimilarPatterns(cycloneId),
        api.getTrendAnalysis(cycloneId),
        api.getShelters()
      ]);

      setCyclone(cycRes.data);
      setObservations(cycRes.data.observations || []);
      setSatelliteImages(cycRes.data.satellite_images || []);
      setFingerprint(fpRes.data);
      setSimilarPatterns(simRes.data.similar_patterns || []);
      setTrendData(trRes.data);
      setShelters(shRes.data || []);
      
      if (cycRes.data.predictions && cycRes.data.predictions.length > 0) {
        setPrediction(cycRes.data.predictions[cycRes.data.predictions.length - 1]);
      }
    } catch (err) {
      console.error("Error fetching cyclone details", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Full AI Analysis Pipeline (Step 6 of Demo Flow)
  const handleRunAIAnalysis = async () => {
    try {
      setAnalyzing(true);
      addToast("Executing Multi-Source AI Pipeline: Fusing Satellite + Meteorological Telemetry...", "info");
      
      const res = await api.runAIAnalysis(cycloneId);
      setPrediction(res.data);
      
      // Refresh fingerprint & similarity
      const [fpRes, simRes, trRes, cycRes] = await Promise.all([
        api.getFingerprint(cycloneId),
        api.getSimilarPatterns(cycloneId),
        api.getTrendAnalysis(cycloneId),
        api.getCycloneById(cycloneId)
      ]);

      setFingerprint(fpRes.data);
      setSimilarPatterns(simRes.data.similar_patterns || []);
      setTrendData(trRes.data);
      setCyclone(cycRes.data);

      addToast("AI Analysis Complete: Identification, Classification, Trend & XAI Attributions Updated!", "success");
    } catch (err) {
      addToast("Error during AI analysis execution", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  // Broadcast Emergency Alert
  const handleBroadcastAlert = async () => {
    try {
      await api.createAlert({
        cyclone_id: cycloneId,
        title: `EMERGENCY CYCLONE WARNING: ${cyclone?.name} (${cyclone?.classification})`,
        severity: alertSeverity,
        hazard_type: "Gale Winds & Storm Surge",
        affected_districts: selectedDistricts,
        channels: ["SMS", "IVR", "WHATSAPP", "SIREN"],
        is_broadcast: true
      });
      setAlertModalOpen(false);
      addToast(`Emergency alert successfully broadcasted to ${selectedDistricts.join(', ')}!`, "success");
      setIvrModalOpen(true); // Automatically open IVR simulation as requested in demo flow
    } catch (err) {
      addToast("Failed to dispatch alert", "error");
    }
  };

  if (loading || !cyclone) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-400">Loading Satellite Telemetry & Multi-Source Models...</p>
        </div>
      </div>
    );
  }

  const latestObs = observations[observations.length - 1] || {};
  const primarySatImage = satelliteImages[0] || {
    image_url: "/uploads/satellites/insat3dr_vayu_2026_latest.jpg",
    satellite_type: "INSAT-3DR / Multi-spectral",
    channel: "Thermal Infrared (TIR1)"
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Top Banner & AI Action Header */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-950 text-red-300 text-xs font-bold px-2.5 py-0.5 rounded border border-red-500/40">
                ACTIVE SYSTEM
              </span>
              <span className="text-xs font-mono text-cyan-300">
                Basin: {cyclone.basin} | Code: {cyclone.code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 flex items-center gap-3">
              {cyclone.name}
              <span className="text-sm font-sans font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-600/40">
                {cyclone.classification} (Cat {cyclone.category})
              </span>
            </h1>
          </div>

          {/* Core Demo Flow Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunAIAnalysis}
              disabled={analyzing}
              className="bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500 hover:from-teal-400 hover:to-cyan-300 disabled:opacity-50 text-slate-950 font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-cyan-500/30 transition-transform active:scale-95"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Multi-Source Fusion...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Run AI Analysis</span>
                </>
              )}
            </button>

            <button
              onClick={() => setAlertModalOpen(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-red-600/30 transition-transform active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Generate Alert</span>
            </button>

            <button
              onClick={() => setIvrModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Test IVR Voice System</span>
            </button>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-3">
          {[
            { id: 'STUDIO', label: 'AI Studio & Evidence (Demo Flow)', icon: Sparkles },
            { id: 'FINGERPRINT', label: 'Cyclone Fingerprint (8D Vector)', icon: Cpu },
            { id: 'SIMILARITY', label: 'Historical Pattern Similarity', icon: History },
            { id: 'TREND', label: 'Temporal Trend Projection', icon: TrendingUp },
            { id: 'MAP', label: 'Geospatial Radar Track', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AI STUDIO (STEPS 4 to 13 of Demo Flow) */}
      {activeTab === 'STUDIO' && (
        <div className="space-y-6">
          
          {/* Top Row: Satellite Multi-spectral View + Environmental Data Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Step 4: Satellite Image Upload & Visualization */}
            <div className="bg-[#0e172e] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">INSAT-3DR Thermal IR Multi-spectral Imagery</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  Channel: TIR-1 (10.8 µm)
                </span>
              </div>

              {/* Satellite Image Container */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square max-h-[360px] mx-auto flex items-center justify-center">
                <img
                  src={primarySatImage.image_url}
                  alt="Cyclone Satellite Imagery"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual simulation if image loading
                    e.target.src = "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-slate-300">
                  Resolution: 2.0 km Enhanced | Spiral Curvature: 0.92
                </div>
                <div className="absolute top-2 right-2 bg-red-600/90 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  DEMO DATA
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-1">
                <span>Convective Cloud Symmetry: 91%</span>
                <span className="text-emerald-400">Eye Wall Detected (Radius: 18km)</span>
              </div>
            </div>

            {/* Step 5: Environmental Data Table */}
            <div className="bg-[#0e172e] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Sequential Environmental Telemetry</h3>
                  </div>
                  <Link to="/ingestion" className="text-xs text-cyan-400 hover:underline">
                    + Ingest CSV / Image
                  </Link>
                </div>

                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-1.5">Timestamp</th>
                        <th className="py-2 px-1.5">Lat/Lon</th>
                        <th className="py-2 px-1.5">Wind</th>
                        <th className="py-2 px-1.5">Press</th>
                        <th className="py-2 px-1.5">SST</th>
                        <th className="py-2 px-1.5">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                      {observations.slice(-5).map((obs, i) => (
                        <tr key={obs.id || i} className="hover:bg-slate-800/40">
                          <td className="py-2 px-1.5 text-slate-300">
                            {new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2 px-1.5 text-slate-200">
                            {obs.latitude.toFixed(1)}°N, {obs.longitude.toFixed(1)}°E
                          </td>
                          <td className="py-2 px-1.5 text-cyan-300 font-bold">{obs.wind_speed} km/h</td>
                          <td className="py-2 px-1.5 text-amber-300">{obs.pressure} hPa</td>
                          <td className="py-2 px-1.5 text-emerald-400">{obs.sst}°C</td>
                          <td className="py-2 px-1.5">
                            <span className="text-red-400 font-sans">{obs.intensity_trend}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ingestion Footer Details */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Multi-Source Ingestion: Validated</span>
                <span className="text-cyan-400">Total Observations: {observations.length}</span>
              </div>
            </div>

          </div>

          {/* Steps 7 & 8: AI Identification & Classification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Identification */}
            <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Cyclone Identification</span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-700">
                  ResNet Fused
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white">Cyclone Detected</div>
                  <div className="text-xs text-slate-300 font-mono">
                    Probability: <strong className="text-emerald-400">{(prediction?.probability ? prediction.probability * 100 : 96.5).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>IMD Classification</span>
                <span className="bg-amber-950 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-700">
                  Dvorak T-Scale
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  {cyclone.category || 3}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-amber-300">{cyclone.classification}</div>
                  <div className="text-xs text-slate-300 font-mono">
                    Confidence: <strong className="text-amber-400">92.4%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Short-Term Trend */}
            <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Sequential Trend Prediction</span>
                <span className="bg-red-950 text-red-300 text-[10px] px-2 py-0.5 rounded border border-red-700">
                  Thermodynamic
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                  ▲
                </div>
                <div>
                  <div className="text-sm font-extrabold text-red-400">
                    {prediction?.trend || "Intensifying"}
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    24h Projection: <strong className="text-cyan-300">{prediction?.intensity_forecast_24h || 160} km/h</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Step 9 & 12: Fingerprint Matrix + Explainable AI Attribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Step 9: Cyclone Fingerprint */}
            <FingerprintRadar fingerprint={fingerprint || {}} />

            {/* Step 12: Explainable AI Attribution */}
            <XAIWaterfall
              attributions={prediction?.feature_attributions || {}}
              keyFactors={prediction?.key_factors || []}
              summary={prediction?.explanation_summary || ""}
              confidenceBreakdown={prediction?.confidence_breakdown}
            />

          </div>

          {/* Step 10: Historical Pattern Matching Engine */}
          <div className="bg-[#0e172e] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  Historical Cyclone Similarity Search (Top 5 Matches)
                </h3>
                <p className="text-xs text-slate-400">
                  Cosine & Euclidean distance comparison against Indian Ocean historical ground-truth archive
                </p>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded self-start">
                Vector Match Engine
              </span>
            </div>

            {/* REQUIRED DISCLAIMER BANNER */}
            <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>CRITICAL DISCLAIMER:</strong> Historical similarity does not guarantee future behavior. Meteorological systems undergo non-linear atmospheric chaos.
              </span>
            </div>

            {/* Top 5 Matches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {similarPatterns.map((item, idx) => (
                <div key={item.id || idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm font-mono">{item.name}</span>
                    <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {item.similarity_score}% Match
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold">{item.category} ({item.year})</div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{item.context_description}</p>
                  <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                    <span>Landfall: {item.landfall_location}</span>
                    <span className="text-red-400 font-bold">{item.max_wind_speed} km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: FINGERPRINT ONLY */}
      {activeTab === 'FINGERPRINT' && (
        <FingerprintRadar fingerprint={fingerprint || {}} />
      )}

      {/* TAB 3: SIMILARITY ONLY */}
      {activeTab === 'SIMILARITY' && (
        <div className="bg-[#0e172e] rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white">Historical Cyclone Pattern Matching</h2>
          <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Historical similarity does not guarantee future behavior. Always adhere to official IMD/NDRF emergency directives.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarPatterns.map((item, idx) => (
              <div key={item.id || idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white font-mono">{item.name}</h3>
                  <span className="text-cyan-300 font-mono font-bold bg-cyan-950 px-2 py-0.5 rounded">{item.similarity_score}% Match</span>
                </div>
                <div className="text-xs text-amber-300">{item.category} ({item.year})</div>
                <p className="text-xs text-slate-300">{item.context_description}</p>
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-900">
                  <div><strong>Landfall:</strong> {item.landfall_location}</div>
                  <div><strong>Impact:</strong> {item.casualties_impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TREND PROJECTION */}
      {activeTab === 'TREND' && trendData && (
        <div className="bg-[#0e172e] rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Short-Term Sequential Intensity Projections (Wind & Pressure)
            </h2>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded">
              Trend: {trendData.current_trend} ({trendData.trend_confidence * 100}%)
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                ...trendData.temporal_series.map(s => ({ name: s.timestamp, wind: s.wind_speed, pressure: s.pressure })),
                ...trendData.projected_forecast_series.map(p => ({ name: p.timeline, wind: p.wind_speed, forecast: true }))
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[40, 200]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="wind" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} name="Wind Speed (km/h)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
            {trendData.explanation}
          </p>
        </div>
      )}

      {/* TAB 5: MAP ONLY */}
      {activeTab === 'MAP' && (
        <CycloneMap
          cyclone={cyclone}
          observations={observations}
          shelters={shelters}
          height="620px"
        />
      )}

      {/* Broadcast Alert Modal (Step 14 & 15 of Demo Flow) */}
      {alertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e172e] border border-red-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white text-base">Generate Multi-Channel Emergency Alert</h3>
              </div>
              <button onClick={() => setAlertModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-mono uppercase block mb-1">Target Cyclone</label>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white font-mono">
                  {cyclone.name} ({cyclone.classification})
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-mono uppercase block mb-1">Alert Severity Level</label>
                <select
                  value={alertSeverity}
                  onChange={(e) => setAlertSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono"
                >
                  <option value="CRITICAL">CRITICAL (Red Stage)</option>
                  <option value="EMERGENCY">EMERGENCY (Immediate Evacuation)</option>
                  <option value="WARNING">WARNING (Orange Stage)</option>
                  <option value="WATCH">WATCH (Yellow Stage)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-mono uppercase block mb-1">Target Coastal Districts</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Visakhapatnam', 'Kakinada', 'Srikakulam', 'Vizianagaram', 'Puri', 'Ganjam'].map(district => (
                    <label key={district} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDistricts.includes(district)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDistricts([...selectedDistricts, district]);
                          else setSelectedDistricts(selectedDistricts.filter(d => d !== district));
                        }}
                        className="rounded accent-red-500"
                      />
                      <span className="text-slate-200">{district}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-200">
                ⚠️ Mass broadcast dispatches automated Telugu, Hindi, and English IVR voice calls to non-smartphone keypad users, SMS cell broadcasts, and activates coastal sirens.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setAlertModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcastAlert}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Broadcast Mass Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Keypad Phone Modal (Steps 15 to 20 of Demo Flow) */}
      <KeypadPhoneModal
        isOpen={ivrModalOpen}
        onClose={() => setIvrModalOpen(false)}
        cycloneId={cycloneId}
        defaultLang="telugu"
      />

    </div>
  );
};

export default CycloneDetail;
