import React, { useState, useEffect, useRef } from 'react';
import { GameSettings } from '../types';
import { X, Volume2, Music, Globe, Mic, Sparkles, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => AudioEngine.getInstance().getDemoMode());

  // Microphone live testing state
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);
  const [micTestVolume, setMicTestVolume] = useState<number>(0);
  const testStreamRef = useRef<MediaStream | null>(null);
  const testAudioCtxRef = useRef<AudioContext | null>(null);
  const testAnimRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
    setIsDemoMode(AudioEngine.getInstance().getDemoMode());
  }, [settings, isOpen]);

  // Clean up mic test on modal close
  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  const stopMicTest = () => {
    if (testAnimRef.current) {
      cancelAnimationFrame(testAnimRef.current);
      testAnimRef.current = null;
    }
    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach((track) => track.stop());
      testStreamRef.current = null;
    }
    if (testAudioCtxRef.current && testAudioCtxRef.current.state !== 'closed') {
      try {
        testAudioCtxRef.current.close();
      } catch {}
      testAudioCtxRef.current = null;
    }
    setIsTestingMic(false);
    setMicTestVolume(0);
  };

  const startMicTest = async () => {
    try {
      stopMicTest();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      testStreamRef.current = stream;
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      testAudioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsTestingMic(true);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const norm = Math.min(1, avg / 100);
        setMicTestVolume(norm);
        testAnimRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (err) {
      console.warn('Could not start mic test:', err);
      setIsTestingMic(false);
    }
  };

  if (!isOpen) return null;

  const isArabic = localSettings.language === 'ar';

  const handleSave = () => {
    stopMicTest();
    AudioEngine.getInstance().setDemoMode(isDemoMode);
    onSave(localSettings);
    onClose();
  };

  const handleModalClose = () => {
    stopMicTest();
    onClose();
  };

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
      onClick={handleModalClose}
    >
      <div
        className="relative max-w-xl w-full max-h-[92vh] bg-gradient-to-b from-[#101726] via-[#0d131f] to-[#070b12] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">
                {isArabic ? 'إعدادات الصوت والميكروفون' : 'Audio & Mic Settings'}
              </h2>
              <span className="text-[11px] text-amber-400/80 font-bold">
                {isArabic ? 'الموسيقى، المؤثرات، اللغة وفحص المايك' : 'Music, SFX, Language & Mic Test'}
              </span>
            </div>
          </div>

          <button
            id="btn-close-settings"
            onClick={handleModalClose}
            className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-red-950/60 border border-slate-700 text-slate-300 hover:text-red-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>{isArabic ? 'إغلاق' : 'Close'}</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 text-xs">
          {/* Section 1: Background Music */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-white text-sm">
                <Music className="w-4 h-4 text-amber-400" />
                <span>{isArabic ? 'موسيقى الخلفية (القائمة)' : 'Background Music (Menu)'}</span>
              </div>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, bgMusicEnabled: !localSettings.bgMusicEnabled })}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  localSettings.bgMusicEnabled
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {localSettings.bgMusicEnabled ? (isArabic ? 'مفعلة ✓' : 'ON ✓') : (isArabic ? 'معطلة' : 'OFF')}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1.5 font-bold">
                <span>{isArabic ? 'مستوى صوت الموسيقى' : 'Music Volume'}</span>
                <span className="font-mono text-amber-400 font-black">{Math.round(localSettings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                disabled={!localSettings.bgMusicEnabled}
                value={localSettings.musicVolume}
                onChange={(e) => setLocalSettings({ ...localSettings, musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Section 2: Sound Effects & Meme SFX */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-white text-sm">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>{isArabic ? 'مؤثرات الميمز الصوتية' : 'Meme Sound Effects (SFX)'}</span>
              </div>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, memeSfxEnabled: !localSettings.memeSfxEnabled })}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  localSettings.memeSfxEnabled
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {localSettings.memeSfxEnabled ? (isArabic ? 'مفعلة ✓' : 'ON ✓') : (isArabic ? 'معطلة' : 'OFF')}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1.5 font-bold">
                <span>{isArabic ? 'مستوى صوت المؤثرات' : 'SFX Volume'}</span>
                <span className="font-mono text-amber-400 font-black">{Math.round(localSettings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                disabled={!localSettings.memeSfxEnabled}
                value={localSettings.sfxVolume}
                onChange={(e) => setLocalSettings({ ...localSettings, sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Section 3: Language */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>{isArabic ? 'لغة الواجهة والتعليقات' : 'Language'}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, language: 'ar' })}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  localSettings.language === 'ar'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, language: 'en' })}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  localSettings.language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Section 4: Live Microphone Test & Hardware Sensitivity */}
          <div className="bg-slate-950/80 border border-amber-500/25 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Mic className="w-4 h-4 text-amber-400" />
                <span>{isArabic ? 'فحص واختبار الميكروفون المباشر' : 'Live Microphone Test'}</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                {isArabic ? 'محمي ومحلي' : 'Local Only'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isArabic
                ? 'اضغط زر الاختبار وتحدث لتتأكد أن هاتفك يلتقط صوتك بنقاء وقوة عالية قبل بدء المباراة:'
                : 'Click Test and speak to verify your device microphone picks up your voice clearly:'}
            </p>

            {/* Test Action & Live Meter */}
            <div className="bg-[#090e17] border border-slate-800 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={isTestingMic ? stopMicTest : startMicTest}
                  className={`h-9 px-3.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isTestingMic
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md animate-pulse'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isTestingMic ? (isArabic ? 'إيقاف الاختبار' : 'Stop Test') : (isArabic ? 'بدء فحص الصوت' : 'Start Mic Test')}</span>
                </button>

                <span className="text-[11px] font-mono text-slate-400">
                  {isTestingMic
                    ? (isArabic ? 'تحدث الآن في المايك...' : 'Speak now...')
                    : (isArabic ? 'جاهز للاختبار' : 'Ready')}
                </span>
              </div>

              {/* Dynamic Live Audio Sensitivity Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{isArabic ? 'حساسية الالتقاط:' : 'Sensitivity:'}</span>
                  <span className="text-amber-400 font-bold">{Math.round(micTestVolume * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-75"
                    style={{
                      width: `${Math.max(5, micTestVolume * 100)}%`,
                      background:
                        micTestVolume > 0.75
                          ? 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)'
                          : micTestVolume > 0.4
                          ? 'linear-gradient(to right, #10b981, #f59e0b)'
                          : '#10b981',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Offline Demo Fallback Switch */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-200">
                  {isArabic ? 'وضع الصوت المحاكى (بدون مايك)' : 'Demo Audio Mode (No Mic)'}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {isArabic ? 'لتجربة اللعبة على متصفحات تمنع المايك' : 'For devices blocking microphone'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`h-8 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isDemoMode
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {isDemoMode ? (isArabic ? 'مفعل' : 'Active') : (isArabic ? 'معطل' : 'Off')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Save & Exit */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleModalClose}
            className="h-12 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 cursor-pointer"
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            id="btn-save-settings"
            type="button"
            onClick={handleSave}
            className="h-12 px-7 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm border-b-4 border-amber-950 active:border-b-0 active:translate-y-1 shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{isArabic ? 'حفظ وتطبيق' : 'Save & Apply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

