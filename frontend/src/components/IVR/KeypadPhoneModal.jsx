import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  Radio, 
  Globe, 
  RotateCcw, 
  ShieldCheck, 
  Home, 
  X,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { api } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';

export const KeypadPhoneModal = ({ 
  isOpen, 
  onClose, 
  cycloneId = 1,
  defaultPhone = "+91 98765 43212",
  defaultName = "Praveen Kumar (Visakhapatnam)",
  defaultLang = "english"
}) => {
  const { addToast } = useNotification();
  
  // Call States
  const [callStatus, setCallStatus] = useState('IDLE'); // IDLE, RINGING, IN_CALL, ENDED
  const [callSid, setCallSid] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(defaultLang);
  const [voicePrompt, setVoicePrompt] = useState('');
  const [activeMenu, setActiveMenu] = useState('MAIN'); // MAIN, LANG_SELECT
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [keyHistory, setKeyHistory] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  
  const timerRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Clean speech synthesis and timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Compute Speaker Status for UI display
  const getSpeakerStatus = () => {
    if (callStatus === 'ENDED') return 'Call Ended';
    if (callStatus === 'IN_CALL') {
      if (audioPlaying) return 'Speaking';
      return 'Listening';
    }
    return 'Speaker Ready';
  };

  // Web Speech API Voice synthesis helper
  const speakText = (text, lang, onDone) => {
    if (!synthRef.current || isMuted) {
      if (onDone) setTimeout(onDone, 600);
      return;
    }
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice for browser TTS
    const voices = synthRef.current.getVoices ? synthRef.current.getVoices() : [];
    if (lang === 'telugu') {
      utterance.lang = 'te-IN';
      const teVoice = voices.find(v => v.lang.startsWith('te') || v.lang.includes('TEL'));
      if (teVoice) utterance.voice = teVoice;
    } else if (lang === 'hindi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi') || v.name.includes('Kalpana') || v.name.includes('Hemant'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India') || v.name.includes('Ravi') || v.name.includes('Heera') || v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.rate = 0.93; // Clear emergency broadcast cadence
    utterance.pitch = 1.0;

    utterance.onstart = () => setAudioPlaying(true);
    utterance.onend = () => {
      setAudioPlaying(false);
      if (onDone) onDone();
    };
    utterance.onerror = () => {
      setAudioPlaying(false);
      if (onDone) onDone();
    };

    synthRef.current.speak(utterance);
  };

  // 1. Initiate Simulated Voice Call
  const startVoiceCall = async () => {
    try {
      setCallStatus('RINGING');
      setCallDuration(0);
      setKeyHistory([]);
      setActiveMenu('MAIN');
      
      const res = await api.initiateIVRCall({
        phone_number: defaultPhone,
        recipient_name: defaultName,
        language: currentLanguage,
        cyclone_id: cycloneId,
        district: "Visakhapatnam"
      });

      setCallSid(res.data.call_sid);
      
      setTimeout(() => {
        setCallStatus('IN_CALL');
        setVoicePrompt(res.data.voice_prompt);
        speakText(res.data.voice_prompt, currentLanguage);

        setCallLogs([{
          step: "CALL_ANSWERED",
          time: new Date().toLocaleTimeString(),
          prompt: res.data.voice_prompt,
          lang: currentLanguage
        }]);

        // Start duration counter
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }, 1200);

    } catch (err) {
      addToast("Failed to initiate IVR voice call", "error");
      setCallStatus('IDLE');
    }
  };

  // 2. Handle Keypad DTMF Press
  const handleKeypadPress = async (digit) => {
    if (callStatus !== 'IN_CALL') return;

    // Play DTMF beep sound via Web Audio API
    playDTMFTone(digit);
    setKeyHistory(prev => [...prev, digit]);

    try {
      let payloadDigit = digit;
      if (activeMenu === 'LANG_SELECT') {
        if (digit === '1') payloadDigit = 'lang_te';
        else if (digit === '2') payloadDigit = 'lang_hi';
        else if (digit === '3') payloadDigit = 'lang_en';
        setActiveMenu('MAIN');
      } else if (digit === '4') {
        setActiveMenu('LANG_SELECT');
      }

      const res = await api.interactIVRKeypad({
        call_sid: callSid,
        digit: payloadDigit,
        current_language: currentLanguage
      });

      const nextLang = res.data.language;
      setCurrentLanguage(nextLang);
      setVoicePrompt(res.data.voice_prompt);

      setCallLogs(prev => [
        {
          step: `KEY_${digit} (${res.data.action_taken})`,
          time: new Date().toLocaleTimeString(),
          prompt: res.data.voice_prompt,
          lang: nextLang
        },
        ...prev
      ]);

      if (res.data.status === 'COMPLETED' || digit === '5') {
        // Speak the ending message before disconnecting
        speakText(res.data.voice_prompt, nextLang, () => {
          endCall();
        });
      } else {
        speakText(res.data.voice_prompt, nextLang);
      }

    } catch (err) {
      console.error("IVR Interaction Error", err);
    }
  };

  // Play realistic DTMF Beep
  const playDTMFTone = (digit) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(697 + parseInt(digit || '1') * 40, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Ignore audio context error
    }
  };

  const endCall = () => {
    if (synthRef.current) synthRef.current.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallStatus('ENDED');
    setAudioPlaying(false);
    addToast("IVR Call successfully logged in disaster audit records", "success");
  };

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e172e] border border-cyan-500/40 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        
        {/* LEFT: Phone Hardware UI (Keypad Phone Device) */}
        <div className="w-full md:w-[380px] bg-slate-950 p-6 flex flex-col items-center justify-between border-r border-slate-800">
          
          {/* Phone Speaker & Antenna */}
          <div className="w-full flex items-center justify-between px-4 mb-2">
            <div className="w-3 h-5 bg-slate-700 rounded-t-sm" />
            <div className="w-20 h-2 bg-slate-800 rounded-full border border-slate-700" />
            <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" /> 4G/2G BSNL
            </div>
          </div>

          {/* Phone Monochrome / Color Screen */}
          <div className="w-full bg-[#1e293b] border-4 border-slate-800 rounded-2xl p-4 shadow-inner flex flex-col justify-between min-h-[190px] relative overflow-hidden">
            
            {/* Screen Top Status Bar */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 border-b border-slate-700/60 pb-1">
              <span className="text-emerald-400 font-bold">EMERGENCY IVR</span>
              <span>{callStatus === 'IN_CALL' ? formatDuration(callDuration) : '10:45 AM'}</span>
            </div>

            {/* Screen Main State */}
            {callStatus === 'IDLE' && (
              <div className="my-auto text-center space-y-1">
                <div className="text-xs text-slate-400">Ready for Automated Call</div>
                <div className="text-sm font-bold text-cyan-300 font-mono">{defaultPhone}</div>
                <div className="text-[11px] text-slate-400">{defaultName}</div>
              </div>
            )}

            {callStatus === 'RINGING' && (
              <div className="my-auto text-center space-y-2 animate-pulse">
                <PhoneCall className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <div className="text-xs font-bold text-emerald-300">INCOMING EMERGENCY CALL</div>
                <div className="text-[11px] font-mono text-slate-300">DISASTER CONTROL CENTER 1070</div>
              </div>
            )}

            {callStatus === 'IN_CALL' && (
              <div className="my-auto space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    LIVE VOICE ALERT
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      {getSpeakerStatus()}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                      {currentLanguage}
                    </span>
                  </div>
                </div>

                {/* Animated Voice Waveform */}
                <div className="flex items-center justify-center gap-1 h-6">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-cyan-400 rounded-full transition-all duration-150 ${
                        audioPlaying 
                          ? `h-${(i % 5) + 2} animate-pulse` 
                          : 'h-1.5 opacity-40'
                      }`}
                      style={{ height: audioPlaying ? `${Math.max(4, (i % 6) * 5 + 4)}px` : '4px' }}
                    />
                  ))}
                </div>

                <div className="text-[11px] text-slate-200 bg-slate-900/90 p-2 rounded-lg border border-slate-700 line-clamp-3 leading-relaxed">
                  {voicePrompt}
                </div>
              </div>
            )}

            {callStatus === 'ENDED' && (
              <div className="my-auto text-center space-y-1">
                <div className="text-xs font-bold text-red-400">CALL DISCONNECTED</div>
                <div className="text-[11px] text-slate-400">Duration: {formatDuration(callDuration)}</div>
                <div className="text-[10px] text-emerald-400">Response Recorded & Synced</div>
              </div>
            )}

            {/* Screen Bottom Helper */}
            <div className="text-[9px] font-mono text-slate-400 border-t border-slate-700/60 pt-1 flex justify-between">
              <span>{activeMenu === 'LANG_SELECT' ? 'Press 1-3 for Lang' : 'Press 1-5 on Keypad'}</span>
              <span>Key: {keyHistory.join('→') || 'None'}</span>
            </div>
          </div>

          {/* Action Buttons (Call / End) */}
          <div className="w-full flex justify-between gap-3 mt-4">
            <button
              onClick={startVoiceCall}
              disabled={callStatus === 'IN_CALL' || callStatus === 'RINGING'}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Call User</span>
            </button>
            <button
              onClick={endCall}
              disabled={callStatus === 'IDLE' || callStatus === 'ENDED'}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-red-600/30 transition-transform active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>

          {/* Physical Phone Keypad (3x4 Grid) */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4">
            {[
              { k: '1', sub: activeMenu === 'LANG_SELECT' ? 'Telugu' : 'Repeat' },
              { k: '2', sub: activeMenu === 'LANG_SELECT' ? 'Hindi' : 'Safety' },
              { k: '3', sub: activeMenu === 'LANG_SELECT' ? 'English' : 'Shelter' },
              { k: '4', sub: 'Lang' },
              { k: '5', sub: 'End Call' },
              { k: '6', sub: 'MNO' },
              { k: '7', sub: 'PQRS' },
              { k: '8', sub: 'TUV' },
              { k: '9', sub: 'WXYZ' },
              { k: '*', sub: 'Vol' },
              { k: '0', sub: '+' },
              { k: '#', sub: 'Help' },
            ].map(({ k, sub }) => (
              <button
                key={k}
                onClick={() => handleKeypadPress(k)}
                disabled={callStatus !== 'IN_CALL'}
                className="bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 disabled:opacity-40 text-slate-100 p-2.5 rounded-xl border border-slate-700 shadow flex flex-col items-center justify-center transition-all group active:scale-90"
              >
                <span className="text-base font-bold font-mono group-hover:text-cyan-300">{k}</span>
                <span className="text-[9px] text-slate-400 group-hover:text-cyan-200">{sub}</span>
              </button>
            ))}
          </div>

        </div>

        {/* RIGHT: IVR Call Console, Audio Controls & Real-Time Transcript */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-slate-900/90">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-cyan-400" />
                    Inclusive Voice Alert System (IVR)
                  </h3>
                  <span className="bg-cyan-950 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-700/50 font-mono">
                    SIH Innovation
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Delivers life-saving cyclone voice advisories to non-smartphone & feature-phone users with zero Internet needed.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language & Voice Speaker Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <Globe className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Active Language</div>
                  <div className="font-bold text-cyan-300 capitalize">{currentLanguage}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Volume2 className={`w-4 h-4 ${audioPlaying ? 'text-cyan-400 animate-pulse' : callStatus === 'ENDED' ? 'text-slate-400' : 'text-emerald-400'}`} />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Speaker Status</div>
                  <div className={`font-bold ${audioPlaying ? 'text-cyan-300' : callStatus === 'ENDED' ? 'text-slate-400' : 'text-emerald-300'}`}>
                    {getSpeakerStatus()}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                    isMuted 
                      ? 'bg-red-950 border-red-500/40 text-red-300' 
                      : 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isMuted ? 'Muted' : 'TTS Unmuted'}</span>
                </button>
              </div>
            </div>

            {/* Keypad Menu Guide Table */}
            <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between font-mono uppercase tracking-wider">
                <span>Keypad Interaction Flow</span>
                <span className="text-[10px] text-cyan-400">
                  {activeMenu === 'LANG_SELECT' ? 'Language menu active: 1=Te, 2=Hi, 3=En' : 'Press digit on left phone'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center font-mono text-[11px] border border-cyan-700">1</span>
                  <span className="text-slate-200">Repeat Emergency Alert</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center font-mono text-[11px] border border-cyan-700">2</span>
                  <span className="text-slate-200">Safety Instructions</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center font-mono text-[11px] border border-cyan-700">3</span>
                  <span className="text-slate-200">Nearest Shelter Info</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 font-bold flex items-center justify-center font-mono text-[11px] border border-cyan-700">4</span>
                  <span className="text-slate-200">Change Language (Te/Hi/En)</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center gap-2 col-span-2 sm:col-span-1">
                  <span className="w-5 h-5 rounded-full bg-red-950 text-red-300 font-bold flex items-center justify-center font-mono text-[11px] border border-red-700">5</span>
                  <span className="text-red-300">End Voice Call</span>
                </div>
              </div>
            </div>

            {/* Live Call Transcript Stream */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Live Multilingual Call Transcript</span>
                <span className="text-[10px] text-slate-500">Telephony Audit Stream</span>
              </div>
              <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 max-h-[190px] overflow-y-auto space-y-2 font-mono text-xs">
                {callLogs.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Click "Call User" on the phone to start emergency voice transmission.
                  </div>
                ) : (
                  callLogs.map((log, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-cyan-400">{log.step}</span>
                        <span>{log.time}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-sans text-xs">{log.prompt}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bottom Footer Note */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Telephony Interface: MockTelephonyProvider (Simulated IVR Call for Demo)</span>
            <span className="text-emerald-400">● 100% OPERATIONAL IN DEMO</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default KeypadPhoneModal;
