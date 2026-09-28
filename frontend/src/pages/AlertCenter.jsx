import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Send, 
  Bell, 
  ShieldAlert, 
  Volume2, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Users
} from 'lucide-react';
import { api } from '../api/client';
import { KeypadPhoneModal } from '../components/IVR/KeypadPhoneModal';
import { useNotification } from '../context/NotificationContext';

export const AlertCenter = () => {
  const { addToast } = useNotification();
  const [alerts, setAlerts] = useState([]);
  const [ivrCalls, setIvrCalls] = useState([]);
  const [ivrModalOpen, setIvrModalOpen] = useState(false);
  const [selectedCallUser, setSelectedCallUser] = useState({
    name: "Praveen Kumar (Coastal Fisherfolk)",
    phone: "+91 98765 43212",
    lang: "english"
  });

  // Test Alert Dispatch state
  const [testPhone, setTestPhone] = useState('+919876543210');
  const [testDistrict, setTestDistrict] = useState('Visakhapatnam');
  const [testChannel, setTestChannel] = useState('SMS');
  const [testLang, setTestLang] = useState('telugu');

  useEffect(() => {
    fetchAlertData();
  }, []);

  const fetchAlertData = async () => {
    try {
      const [alRes, ivrRes] = await Promise.all([
        api.getAlertHistory(),
        api.getIVRCalls()
      ]);
      setAlerts(alRes.data || []);
      setIvrCalls(ivrRes.data || []);
    } catch (e) {
      console.error("Error loading alerts", e);
    }
  };

  const handleTestAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.testAlert({
        phone_number: testPhone,
        district: testDistrict,
        channel: testChannel,
        language: testLang
      });
      addToast(res.data.message, "success");
      fetchAlertData();
    } catch (err) {
      addToast("Failed to dispatch test alert", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-red-300 bg-red-950 px-2.5 py-0.5 rounded border border-red-500/40 font-bold animate-pulse">
              MULTI-CHANNEL BROADCAST CENTER
            </span>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              INCLUSIVE IVR VOICES
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Emergency Alert & Keypad Phone Voice System
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Dispatches automated voice advisories in Telugu, Hindi, and English to non-smartphone keypad users, cellular broadcast alerts, and coastal warning sirens.
          </p>
        </div>

        <button
          onClick={() => setIvrModalOpen(true)}
          className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-xl shadow-red-600/30 transition-transform active:scale-95 self-start"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Launch Simulated Keypad Phone</span>
        </button>
      </div>

      {/* Grid: Test Dispatch Panel + Multi-lingual Voice Alert Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Test Alert Dispatcher Card */}
        <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Send className="w-4 h-4 text-cyan-400" />
              Direct Test Alert Dispatcher
            </h2>
            <span className="text-[10px] font-mono text-emerald-400">Mock Engine</span>
          </div>

          <form onSubmit={handleTestAlert} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-mono block mb-1">Target Phone Number</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-mono block mb-1">District</label>
                <select
                  value={testDistrict}
                  onChange={(e) => setTestDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono"
                >
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Vizianagaram">Vizianagaram</option>
                  <option value="Srikakulam">Srikakulam</option>
                  <option value="Kakinada">Kakinada</option>
                  <option value="Puri">Puri</option>
                  <option value="Ganjam">Ganjam</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-mono block mb-1">Channel</label>
                <select
                  value={testChannel}
                  onChange={(e) => setTestChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono"
                >
                  <option value="SMS">SMS Gateway</option>
                  <option value="IVR">IVR Voice Call</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SIREN">Coastal Siren</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-mono block mb-1">Language</label>
              <select
                value={testLang}
                onChange={(e) => setTestLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white font-mono"
              >
                <option value="telugu">తెలుగు (Telugu)</option>
                <option value="hindi">हिंदी (Hindi)</option>
                <option value="english">English</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Emergency Alert</span>
            </button>
          </form>
        </div>

        {/* Multilingual Voice Broadcast Preview */}
        <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Standard Multilingual Voice Messages
            </h2>
            <span className="text-[10px] font-mono text-slate-400">3 Languages</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Telugu */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-cyan-300 uppercase font-bold">1. Telugu (తెలుగు)</div>
              <p className="text-slate-200 leading-relaxed font-sans text-[11px]">
                "నమస్కారం. మీ ప్రాంతానికి తుఫాను తీవ్ర హెచ్చరిక జారీ చేయబడింది. దయచేసి స్థానిక అధికారుల సూచనలను పాటించండి మరియు సురక్షిత ప్రాంతాలకు వెళ్లండి. సహాయం కోసం 1070 కి కాల్ చేయండి."
              </p>
            </div>

            {/* Hindi */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-amber-300 uppercase font-bold">2. Hindi (हिंदी)</div>
              <p className="text-slate-200 leading-relaxed font-sans text-[11px]">
                "नमस्ते। आपके क्षेत्र में चक्रवात का गंभीर ख़तरा पाया गया है। कृपया स्थानीय प्रशासन के निर्देशों का पालन करें और तुरंत सुरक्षित स्थान पर जाएं। हेल्पलाइन: 1070."
              </p>
            </div>

            {/* English */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-300 uppercase font-bold">3. English</div>
              <p className="text-slate-200 leading-relaxed font-sans text-[11px]">
                "Cyclone alert. A severe cyclone-related risk has been detected in your area. Please follow local authority instructions and move to a designated safe location if advised."
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Dispatched Alerts History & IVR Call Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mass Broadcast History */}
        <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider border-b border-slate-800 pb-3">
            <History className="w-4 h-4 text-cyan-400" />
            Dispatched Mass Alerts History
          </h2>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.map((al) => (
              <div key={al.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400">{al.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(al.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">{al.message_en}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                  <span>Districts: {al.affected_districts.join(', ')}</span>
                  <span className="text-emerald-400 font-bold">{al.delivered_count} Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IVR Voice Call Audit Records */}
        <div className="bg-[#0e172e] p-6 rounded-3xl border border-slate-700 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider border-b border-slate-800 pb-3">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            Keypad Phone IVR Audit Stream
          </h2>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {ivrCalls.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No IVR calls recorded yet. Click "Launch Simulated Keypad Phone" above to test.
              </div>
            ) : (
              ivrCalls.map((call) => (
                <div key={call.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{call.recipient_name} ({call.phone_number})</span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded capitalize">
                      {call.language}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    District: {call.district} | Status: <strong className="text-emerald-400">{call.call_status}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 flex justify-between">
                    <span>DTMF Sequence: <strong className="text-amber-300">{call.digits_pressed}</strong></span>
                    <span>Duration: {call.duration_seconds}s</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Simulated Keypad Phone Modal */}
      <KeypadPhoneModal
        isOpen={ivrModalOpen}
        onClose={() => setIvrModalOpen(false)}
        defaultName={selectedCallUser.name}
        defaultPhone={selectedCallUser.phone}
        defaultLang={selectedCallUser.lang}
      />

    </div>
  );
};

export default AlertCenter;
