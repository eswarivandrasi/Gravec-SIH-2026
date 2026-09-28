import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Home, 
  Anchor, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Users, 
  Globe, 
  CheckCircle2, 
  HeartHandshake 
} from 'lucide-react';
import { api } from '../api/client';

export const SafetyShelters = () => {
  const [instructions, setInstructions] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [lang, setLang] = useState('telugu'); // telugu, hindi, english
  const [searchDistrict, setSearchDistrict] = useState('ALL');
  const [activeStage, setActiveStage] = useState('BEFORE'); // BEFORE, DURING, AFTER

  useEffect(() => {
    const loadData = async () => {
      try {
        const [instRes, shRes] = await Promise.all([
          api.getSafetyInstructions(),
          api.getShelters()
        ]);
        setInstructions(instRes.data || []);
        setShelters(shRes.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const filteredShelters = searchDistrict === 'ALL'
    ? shelters
    : shelters.filter(s => s.district.toLowerCase() === searchDistrict.toLowerCase());

  const filteredInstructions = instructions.filter(i => i.stage === activeStage);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              CITIZEN RESILIENCE & PREPAREDNESS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Multilingual Safety Guidelines & Cyclone Shelters
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Actionable disaster protocols for coastal residents, fishermen, and farmers in Telugu, Hindi, and English.
          </p>
        </div>

        {/* Language Selection Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start">
          {[
            { id: 'telugu', label: 'తెలుగు (Telugu)' },
            { id: 'hindi', label: 'हिंदी (Hindi)' },
            { id: 'english', label: 'English' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                lang === l.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Instructions Phase Navigator */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Cyclone Action Plan (Dos & Don'ts)
          </h2>

          <div className="flex gap-2">
            {[
              { id: 'BEFORE', label: '1. Before Cyclone' },
              { id: 'DURING', label: '2. During Landfall' },
              { id: 'AFTER', label: '3. Post-Cyclone Recovery' },
            ].map(stage => (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStage === stage.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInstructions.map((item) => {
            let instructionText = item.instruction_en;
            if (lang === 'telugu') instructionText = item.instruction_te;
            else if (lang === 'hindi') instructionText = item.instruction_hi;

            return (
              <div key={item.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400 uppercase font-mono">{item.category}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    Priority #{item.priority}
                  </span>
                </div>
                <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                  {instructionText}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Shelters Directory */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Home className="w-4 h-4 text-emerald-400" />
              Coastal Emergency Shelters & Evacuation Centers
            </h2>
            <p className="text-xs text-slate-400">Equipped with solar power, potable water, first aid, and sat-phones</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Filter:</span>
            <select
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-white text-xs font-mono"
            >
              <option value="ALL">All Coastal Districts</option>
              <option value="Visakhapatnam">Visakhapatnam</option>
              <option value="Kakinada">Kakinada</option>
              <option value="Srikakulam">Srikakulam</option>
              <option value="Puri">Puri</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShelters.map((sh) => (
            <div key={sh.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-xs sm:text-sm">{sh.name}</h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {sh.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{sh.address}</span>
              </div>
              
              {/* Capacity Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Occupancy: {sh.current_occupancy} / {sh.capacity} citizens</span>
                  <span className="text-cyan-400">{Math.round((sh.current_occupancy / sh.capacity) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${Math.round((sh.current_occupancy / sh.capacity) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Amenities & Contact */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900 font-mono">
                <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                  {sh.amenities.slice(0, 3).join(', ')}
                </div>
                <div className="text-cyan-300 font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>{sh.contact_phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SafetyShelters;
