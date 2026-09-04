import React from 'react';
import { Play, BookOpen, Settings, Headphones, Sparkles, Users, Mic, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onOpenContact: () => void;
  onOpenStatistics: () => void;
  lang: 'ar' | 'en';
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenRules,
  onOpenSettings,
  onOpenContact,
  onOpenStatistics,
  lang,
}) => {
  const isArabic = lang === 'ar';

  return (
    <div
      id="main-menu"
      className="relative w-full h-full flex flex-col items-center justify-center p-3 md:p-6 select-none overflow-hidden bg-[#070a10]"
    >
      {/* Dynamic Background Atmosphere - Warm Brushed Slate and Deep Midnight */}
      <div className="absolute inset-0 bg-radial-gradient from-[#111827]/40 via-[#070a10] to-[#04060a] pointer-events-none" />

      {/* Main Container Card - High-End Luxury Game HUD Styling */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 max-w-md w-full bg-gradient-to-b from-[#101726] via-[#0c121e] to-[#080d15] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center"
      >
        {/* Top Chamfer Light Accent */}
        <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

        {/* Game Badge Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 text-amber-300/90 border border-amber-500/25 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isArabic ? 'لعبة التحدي الصوتي للاعبين' : '2-Player Audio Challenge'}</span>
        </div>

        {/* Title Logo - Metallic Gold & Obsidian */}
        <div className="relative mb-3">
          <h1 className="text-6xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 font-serif drop-shadow-sm">
            WDNIN
          </h1>
          <div className="text-sm md:text-base font-black text-slate-200 mt-1.5 flex items-center justify-center gap-2">
            <Mic className="w-4 h-4 text-amber-400" />
            <span>{isArabic ? 'ودنين — تحدي عكس الصوت' : 'WDNIN — Reverse Audio Challenge'}</span>
          </div>
        </div>

        {/* 2-Player Explicit Offline Indicator */}
        <div className="flex items-center gap-2 bg-slate-950/90 px-4 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-bold mb-6 shadow-inner">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>{isArabic ? 'لاعبان فقط وجهاً لوجه أوفلاين' : '2 Players Offline Face-to-Face'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" />
        </div>

        {/* Mobile Tactile Action Buttons (High-End Game Styling with 3D Bevels) */}
        <div className="w-full space-y-3">
          {/* Main Play Button: ابدأ اللعبة */}
          <button
            id="btn-main-start"
            onClick={onStartGame}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xl border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current text-slate-950" />
            </div>
            <span className="tracking-wide text-slate-950">{isArabic ? 'ابدأ اللعبة' : 'Start Game'}</span>
          </button>

          {/* Secondary Buttons Grid: High-contrast, easy-tap mobile buttons in balanced 2x2 grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Statistics Button: الإحصائيات والتسجيلات */}
            <button
              id="btn-main-statistics"
              onClick={onOpenStatistics}
              className="h-20 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30 hover:from-slate-800 hover:to-amber-900/40 text-amber-300 hover:text-amber-200 font-extrabold text-xs border border-amber-500/40 border-b-4 border-b-amber-900/80 active:border-b active:translate-y-1 shadow-md transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="font-black">{isArabic ? 'الإحصائيات والتسجيلات' : 'Statistics & Audio'}</span>
            </button>

            {/* Rules Button: طريقة اللعب */}
            <button
              id="btn-main-rules"
              onClick={onOpenRules}
              className="h-20 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 hover:text-white font-extrabold text-xs border border-slate-800 border-b-4 border-b-slate-950 active:border-b active:translate-y-1 shadow-md transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>{isArabic ? 'طريقة اللعب' : 'Rules'}</span>
            </button>

            {/* Settings Button: الإعدادات */}
            <button
              id="btn-main-settings"
              onClick={onOpenSettings}
              className="h-20 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 hover:text-white font-extrabold text-xs border border-slate-800 border-b-4 border-b-slate-950 active:border-b active:translate-y-1 shadow-md transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Settings className="w-4 h-4" />
              </div>
              <span>{isArabic ? 'الإعدادات' : 'Settings'}</span>
            </button>

            {/* Support Button: الدعم الفني */}
            <button
              id="btn-main-contact"
              onClick={onOpenContact}
              className="h-20 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 hover:text-white font-extrabold text-xs border border-slate-800 border-b-4 border-b-slate-950 active:border-b active:translate-y-1 shadow-md transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                <Headphones className="w-4 h-4" />
              </div>
              <span>{isArabic ? 'الدعم الفني' : 'Support'}</span>
            </button>
          </div>
        </div>

        {/* Footer info: Clean, authentic, luxury */}
        <div className="mt-6 pt-3 border-t border-slate-800/90 w-full flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{isArabic ? 'أوفلاين 100% بدون إنترنت' : '100% Offline'}</span>
          <span className="text-amber-400/80">v1.2.0 Luxury Edition</span>
        </div>
      </motion.div>
    </div>
  );
};

