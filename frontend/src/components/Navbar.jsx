import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wind, 
  Activity, 
  ShieldAlert, 
  UserCircle2, 
  Bell, 
  Radio, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25) + " UTC");
  const [roleDropdown, setRoleDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#0b132b] border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Wind className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white font-mono">
                CYCLONE<span className="text-cyan-400">FUSION</span><span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">AI</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider hidden sm:block">
              Detect. Understand. Predict. Explain. Alert.
            </p>
          </div>
        </Link>

        {/* Center Live Status Indicators */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-semibold">1 ACTIVE STORM (VSCS VAYU)</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>DOPPLER RADARS: 19/19 OK</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-cyan-300 font-medium">{time}</div>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3">
          
          {/* Quick Role Switcher (For Demo evaluation) */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdown(!roleDropdown)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <UserCircle2 className="w-4 h-4 text-cyan-400" />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-medium text-white">{user?.name || "Guest"}</div>
                <div className="text-[9px] text-cyan-300 capitalize uppercase">{user?.role || "Citizen"}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                  Switch Demo Role Persona
                </div>
                <button
                  onClick={() => { switchDemoRole('admin'); setRoleDropdown(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex flex-col"
                >
                  <span className="font-semibold text-white">NDRF Admin Officer</span>
                  <span className="text-[10px] text-slate-400">Full broadcast, IVR, mass-evacuation control</span>
                </button>
                <button
                  onClick={() => { switchDemoRole('analyst'); setRoleDropdown(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex flex-col"
                >
                  <span className="font-semibold text-white">IMD Lead Meteorologist</span>
                  <span className="text-[10px] text-slate-400">AI analysis, XAI attribution & models</span>
                </button>
                <button
                  onClick={() => { switchDemoRole('citizen'); setRoleDropdown(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex flex-col"
                >
                  <span className="font-semibold text-white">Coastal Resident (Telugu)</span>
                  <span className="text-[10px] text-slate-400">Voice alerts, keypad phone & shelter guide</span>
                </button>
              </div>
            )}
          </div>

          <Link
            to="/alerts"
            className="p-2 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40 transition-colors relative"
            title="Emergency Alert Center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
