import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Lock, Phone, User, MapPin, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('adminpassword123');
  
  // Register fields
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Visakhapatnam');
  const [language, setLanguage] = useState('telugu');
  const [alertPref, setAlertPref] = useState('ALL');

  const { login, register } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const res = await login(phone, password);
      if (res.success) {
        addToast("Logged in successfully", "success");
        navigate('/');
      } else {
        addToast(res.message, "error");
      }
    } else {
      const res = await register({
        name,
        phone_number: phone,
        password,
        district,
        preferred_language: language,
        alert_preference: alertPref
      });
      if (res.success) {
        addToast("Registration complete! Welcome to CycloneFusion AI", "success");
        navigate('/');
      } else {
        addToast(res.message, "error");
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-[#0e172e] border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
            <Wind className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-extrabold text-white font-mono">
            CYCLONE<span className="text-cyan-400">FUSION</span> AI
          </h1>
          <p className="text-xs text-slate-400">
            {isLogin ? "Sign in to access Disaster Command Center" : "Register for life-saving cyclone voice & SMS alerts"}
          </p>
        </div>

        {/* Toggle Login / Register */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setPhone('9876543210'); setPassword('adminpassword123'); }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              isLogin ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setPhone('9876543215'); setPassword('password123'); }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              !isLogin ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Citizen Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {!isLogin && (
            <div>
              <label className="text-slate-300 font-mono block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 pl-9 rounded-xl text-white"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 font-mono block mb-1">Mobile Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone number"
                className="w-full bg-slate-950 border border-slate-800 p-2.5 pl-9 rounded-xl text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-mono block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 pl-9 rounded-xl text-white"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-mono block mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white"
                  >
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Kakinada">Kakinada</option>
                    <option value="Srikakulam">Srikakulam</option>
                    <option value="Puri">Puri</option>
                    <option value="Ganjam">Ganjam</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-mono block mb-1">Voice Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white"
                  >
                    <option value="telugu">Telugu (తెలుగు)</option>
                    <option value="hindi">Hindi (हिंदी)</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 text-xs mt-2"
          >
            <span>{isLogin ? "Authenticate to Console" : "Complete Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {isLogin && (
          <div className="text-[11px] text-slate-400 text-center font-mono border-t border-slate-800/80 pt-3">
            Demo Credentials: <span className="text-cyan-300 font-bold">9876543210</span> / <span className="text-cyan-300 font-bold">adminpassword123</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginRegister;
