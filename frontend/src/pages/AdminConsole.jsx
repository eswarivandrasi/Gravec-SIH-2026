import React, { useState, useEffect } from 'react';
import { Settings, Users, ShieldAlert, Activity, Server, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export const AdminConsole = () => {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, logRes, stRes] = await Promise.all([
          api.getUsers(),
          api.getAuditLogs(),
          api.getSystemStatus()
        ]);
        setUsers(uRes.data || []);
        setAuditLogs(logRes.data || []);
        setSystemStatus(stRes.data);
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
              NDRF DISASTER COMMAND
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            System Administration & Telemetry Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage registered citizen registries, inspect real-time system audit logs, and verify subsystem health.
          </p>
        </div>
      </div>

      {/* Subsystems Health Grid */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider border-b border-slate-800 pb-3">
          <Server className="w-4 h-4 text-cyan-400" />
          Subsystem Operational Status
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(systemStatus?.subsystems || {}).map(([sub, status], i) => (
            <div key={i} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1 text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase truncate">
                {sub.replace(/_/g, ' ')}
              </div>
              <div className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Citizens & Responders */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Users className="w-4 h-4 text-emerald-400" />
            Registered Citizens & Responders ({users.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Role-Based Access</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3">District</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Language</th>
                <th className="py-2 px-3">Alert Pref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-white">{u.name}</td>
                  <td className="py-2.5 px-3 text-cyan-300">{u.phone_number}</td>
                  <td className="py-2.5 px-3 text-slate-300">{u.district}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] uppercase font-bold text-slate-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-amber-300">{u.preferred_language}</td>
                  <td className="py-2.5 px-3 text-emerald-400">{u.alert_preference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider border-b border-slate-800 pb-3">
          <FileText className="w-4 h-4 text-cyan-400" />
          Disaster Management Audit Trail (50 Events)
        </h2>

        <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-cyan-400 font-bold">{log.action}</span>
                <span className="text-slate-400 ml-2 text-[11px]">[{log.username}]</span>
                <div className="text-[10px] text-slate-500 truncate max-w-lg">
                  {JSON.stringify(log.details)}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 shrink-0 ml-4">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminConsole;
