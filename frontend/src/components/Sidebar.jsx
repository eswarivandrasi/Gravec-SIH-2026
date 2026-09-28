import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  UploadCloud,
  History,
  PhoneCall,
  ShieldCheck,
  BarChart3,
  Settings,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Disaster Dashboard', icon: LayoutDashboard },
    { to: '/cyclones/1', label: 'AI Cyclone Studio & XAI', icon: Cpu },
    { to: '/ingestion', label: 'Multi-Source Ingestion', icon: UploadCloud },
    { to: '/historical', label: 'Historical Similarity', icon: History },
    { to: '/alerts', label: 'Alert Center & IVR System', icon: PhoneCall, badge: 'INNOVATION' },
    { to: '/safety', label: 'Safety & Shelters', icon: ShieldCheck },
    { to: '/models', label: 'Model Evaluation', icon: BarChart3 },
    { to: '/admin', label: 'Admin Command', icon: Settings, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-[#0d1838] border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        
        {/* Navigation Group */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2 font-semibold">
            Core Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* System Summary Card in Sidebar */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] space-y-2">
          <div className="flex items-center justify-between font-mono text-slate-300">
            <span>Primary Focus:</span>
            <span className="text-red-400 font-bold">VAYU-26</span>
          </div>
          <div className="flex items-center justify-between font-mono text-slate-300">
            <span>Category:</span>
            <span className="text-amber-400 font-bold">VSCS (Cat 3)</span>
          </div>
          <div className="flex items-center justify-between font-mono text-slate-300">
            <span>Landfall ETA:</span>
            <span className="text-cyan-300 font-bold">~24 hrs</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full w-3/4 rounded-full" />
          </div>
          <div className="text-[10px] text-slate-400 text-center font-mono">
            Predicted: Visakhapatnam-Puri Coast
          </div>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center justify-between text-[10px]">
          <span>SIH2026 Engine v2.1</span>
          <span className="text-emerald-400">● MOCK READY</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
