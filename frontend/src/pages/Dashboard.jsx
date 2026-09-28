import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wind, 
  AlertTriangle, 
  Radio, 
  Users, 
  ShieldAlert, 
  PhoneCall, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../api/client';
import { CycloneMap } from '../components/Map/CycloneMap';
import { KeypadPhoneModal } from '../components/IVR/KeypadPhoneModal';
import { useNotification } from '../context/NotificationContext';

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cyclone, setCyclone] = useState(null);
  const [observations, setObservations] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [ivrModalOpen, setIvrModalOpen] = useState(false);
  const { addToast } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, cycRes, shelterRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getCycloneById(1),
          api.getShelters()
        ]);
        setSummary(sumRes.data);
        setCyclone(cycRes.data);
        setObservations(cycRes.data.observations || []);
        setShelters(shelterRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Welcome & Disaster Overview Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1b3e] via-[#122353] to-[#0d1b3e] p-6 rounded-3xl border border-cyan-500/30 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-950 text-red-300 border border-red-500/40 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              EMERGENCY SITUATION: ACTIVE THREAT
            </span>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/40">
              BAY OF BENGAL BASIN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Integrated Cyclone Early Warning & AI Prediction Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Real-time multi-source satellite fusion (INSAT-3DR/NOAA), IMD classification, short-term trajectory modeling, and inclusive multilingual IVR emergency broadcasts.
          </p>
        </div>

        {/* Quick Action Button Group */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/cyclones/1"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Launch AI Cyclone Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setIvrModalOpen(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Test IVR Voice Alert</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Active Systems</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {summary?.active_systems_count || 3}
          </div>
          <div className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> 1 Severe Threat
          </div>
        </div>

        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Intensifying</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {summary?.intensifying_systems_count || 2}
          </div>
          <div className="text-[11px] text-amber-300">Rapid Pressure Drop</div>
        </div>

        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Alerts Dispatched</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-mono">
            {summary?.total_alerts_issued || 18}
          </div>
          <div className="text-[11px] text-slate-400">6 Coastal Districts</div>
        </div>

        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Citizens Protected</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            18,450
          </div>
          <div className="text-[11px] text-emerald-300">Registered in Grid</div>
        </div>

        <div className="bg-[#0e172e] p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>IVR Voice Calls</span>
            <PhoneCall className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
            17,920
          </div>
          <div className="text-[11px] text-cyan-400">Telugu/Hindi/English</div>
        </div>

      </div>

      {/* Main Grid: Interactive Map & Live Storm Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaflet Geospatial Interactive Map (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Geospatial Tracking & Projected Inundation Map
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              INSAT-3DR Doppler Radar Overlay
            </span>
          </div>

          <CycloneMap
            cyclone={cyclone}
            observations={observations}
            shelters={shelters}
            height="520px"
          />
        </div>

        {/* Primary Storm Focus Card (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400" />
              Primary Threat Telemetry
            </h2>
            <span className="text-[10px] font-mono bg-red-950 text-red-300 border border-red-500/40 px-2 py-0.5 rounded">
              CRITICAL WATCH
            </span>
          </div>

          <div className="bg-[#0e172e] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4">
            
            {/* Storm Title & Classification */}
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white font-mono">
                  {cyclone?.name || "Cyclone VAYU-26"}
                </h3>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded">
                  Category 3 (VSCS)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Code: {cyclone?.code || "BOB-01-2026"} | Basin: Bay of Bengal
              </p>
            </div>

            {/* Live Meteorological Readings Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Max Sustained Wind</span>
                <span className="text-base font-extrabold text-cyan-300 font-mono">
                  {cyclone?.max_wind_speed || 145} km/h
                </span>
                <span className="text-[10px] text-red-400 block mt-0.5">▲ +15 km/h in 12h</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Central Pressure</span>
                <span className="text-base font-extrabold text-amber-300 font-mono">
                  {cyclone?.min_pressure || 968} hPa
                </span>
                <span className="text-[10px] text-amber-400 block mt-0.5">▼ Rapid Deepening</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Location Coordinates</span>
                <span className="text-xs font-bold text-white font-mono">
                  {cyclone?.current_latitude || 15.8}°N, {cyclone?.current_longitude || 84.2}°E
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">180km Off AP Coast</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Movement Vector</span>
                <span className="text-xs font-bold text-white font-mono">
                  {cyclone?.movement_direction || "NNW"} @ {cyclone?.movement_speed || 16} km/h
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Steady Forward Track</span>
              </div>
            </div>

            {/* AI Prediction Highlights */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  AI Prediction Summary
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">96.5% Conf.</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Projected to make landfall between Visakhapatnam and Kalingapatnam in <strong>24 hours</strong>. Expected peak intensity: <strong>160 km/h</strong>.
              </p>
            </div>

            {/* Button to Open Deep Studio */}
            <Link
              to="/cyclones/1"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>Inspect Full AI Fingerprint & Evidence</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </Link>

          </div>
        </div>

      </div>

      {/* Active Systems & Recent Alerts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Systems Table */}
        <div className="bg-[#0e172e] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              Active Monitored Cyclonic Systems (DEMO DATA)
            </h3>
            <span className="text-xs font-mono text-slate-400">IMD Standard</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-2">System Name</th>
                  <th className="py-2 px-2">Basin</th>
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2">Max Wind</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {summary?.active_cyclones?.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2 font-bold text-white">{c.name}</td>
                    <td className="py-2.5 px-2 text-slate-400 font-sans">{c.basin}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        c.category >= 3 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {c.classification}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-cyan-300 font-bold">{c.max_wind_speed} km/h</td>
                    <td className="py-2.5 px-2">
                      <span className="text-emerald-400 text-[11px] font-sans">{c.status}</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-sans">
                      <Link
                        to={`/cyclones/${c.id}`}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs"
                      >
                        Analyze →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Broadcast Alerts */}
        <div className="bg-[#0e172e] rounded-2xl p-5 border border-slate-700 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Emergency Broadcast Dispatches
            </h3>
            <Link to="/alerts" className="text-xs text-cyan-400 hover:underline">
              View All History →
            </Link>
          </div>

          <div className="space-y-2.5">
            {summary?.recent_alerts?.slice(0, 3).map((al) => (
              <div key={al.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {al.severity}: {al.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {al.total_recipients} Dispatched
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">{al.message_en}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                  <span>Channels: {al.channels.join(', ')}</span>
                  <span className="text-emerald-400">Delivered: {al.delivered_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Simulated Keypad Phone Modal */}
      <KeypadPhoneModal
        isOpen={ivrModalOpen}
        onClose={() => setIvrModalOpen(false)}
        cycloneId={1}
      />

    </div>
  );
};

export default Dashboard;
