import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types';
import { Play, ArrowRight, ArrowLeft, Users, Clock, Headphones, RotateCcw, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { getAllPlayerStats } from '../utils/statsStorage';

interface GameSetupScreenProps {
  settings: GameSettings;
  onStartMatch: (updatedSettings: GameSettings) => void;
  onBackToMenu: () => void;
}

export const GameSetupScreen: React.FC<GameSetupScreenProps> = ({
  settings,
  onStartMatch,
  onBackToMenu,
}) => {
  const isArabic = settings.language === 'ar';
  const BackArrow = isArabic ? ArrowRight : ArrowLeft;

  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [savedPlayerNames, setSavedPlayerNames] = useState<string[]>([]);

  useEffect(() => {
    getAllPlayerStats().then((list) => {
      const names = list.map((p) => p.name).filter((n) => n && n.trim().length > 0);
      setSavedPlayerNames(names);
    }).catch(() => {});
  }, []);

  const handleSelectSavedName = (name: string) => {
    // If P1 is default or empty, set P1, otherwise set P2
    const defaultP1 = isArabic ? 'اللاعب 1' : 'Player 1';
    const defaultP2 = isArabic ? 'اللاعب 2' : 'Player 2';
    if (!localSettings.player1Name || localSettings.player1Name === defaultP1) {
      setLocalSettings({ ...localSettings, player1Name: name });
    } else if (!localSettings.player2Name || localSettings.player2Name === defaultP2) {
      setLocalSettings({ ...localSettings, player2Name: name });
    } else {
      // Toggle or override P2
      setLocalSettings({ ...localSettings, player2Name: name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalP1 = localSettings.player1Name.trim() || (isArabic ? 'اللاعب 1' : 'Player 1');
    const finalP2 = localSettings.player2Name.trim() || (isArabic ? 'اللاعب 2' : 'Player 2');
    onStartMatch({
      ...localSettings,
      player1Name: finalP1,
      player2Name: finalP2,
    });
  };

  return (
    <div
      id="game-setup-screen"
      className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-y-auto bg-[#070a10]"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-[#111827]/50 via-[#070a10] to-[#04060a] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 max-w-lg w-full max-h-[96vh] flex flex-col bg-gradient-to-b from-[#101726] via-[#0c121e] to-[#080d15] border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">
                {isArabic ? 'إعدادات المباراة' : 'Match Setup'}
              </h2>
              <span className="text-[11px] text-amber-400/80 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {isArabic ? 'خصص أسماء اللاعبين وقوانين الجولة' : 'Customize players and match rules'}
              </span>
            </div>
          </div>

          <button
            type="button"
            id="btn-back-setup"
            onClick={onBackToMenu}
            className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BackArrow className="w-4 h-4" />
            <span>{isArabic ? 'رجوع' : 'Back'}</span>
          </button>
        </div>

        {/* Scrollable Setup Options */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 text-slate-200">
          {/* Card 1: Player Names */}
          <div className="bg-slate-950/80 border border-amber-500/25 rounded-2xl p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-black text-amber-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                {isArabic ? 'أسماء اللاعبين (وجهاً لوجه)' : 'Player Names (2 Players Face-to-Face)'}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                {isArabic ? 'لاعبان فقط' : '2 Players Only'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Player 1 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  {isArabic ? 'اللاعب الأول (يمين)' : 'Player 1 (Right)'}
                </label>
                <div className="relative">
                  <input
                    id="input-setup-player-1"
                    type="text"
                    maxLength={16}
                    value={localSettings.player1Name}
                    onChange={(e) => setLocalSettings({ ...localSettings, player1Name: e.target.value })}
                    className="w-full bg-[#0d131f] border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-black text-white focus:outline-none transition-colors"
                    placeholder={isArabic ? 'اسم اللاعب 1' : 'Player 1'}
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs">🎙️</span>
                </div>
              </div>

              {/* Player 2 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  {isArabic ? 'اللاعب الثاني (يسار)' : 'Player 2 (Left)'}
                </label>
                <div className="relative">
                  <input
                    id="input-setup-player-2"
                    type="text"
                    maxLength={16}
                    value={localSettings.player2Name}
                    onChange={(e) => setLocalSettings({ ...localSettings, player2Name: e.target.value })}
                    className="w-full bg-[#0d131f] border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-black text-white focus:outline-none transition-colors"
                    placeholder={isArabic ? 'اسم اللاعب 2' : 'Player 2'}
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs">🎧</span>
                </div>
              </div>
            </div>

            {/* Quick Pick from Saved Players */}
            {savedPlayerNames.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5 font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isArabic ? 'الأسماء المحفوظة سابقاً (اضغط للاختيار السريع):' : 'Saved Players (click to pick):'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {savedPlayerNames.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectSavedName(name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-500/50 text-[11px] font-bold text-slate-300 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>👤</span>
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Rounds Count */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                {isArabic ? 'عدد الجولات في المباراة' : 'Number of Match Rounds'}
              </span>
              <span className="font-mono text-amber-400 font-black">
                {localSettings.roundsCount} {isArabic ? 'جولات' : 'Rounds'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 7, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, roundsCount: num })}
                  className={`h-11 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    localSettings.roundsCount === num
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md border-b-2 border-amber-800'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {num} {isArabic ? 'جولات' : 'Rounds'}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Time Limit */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                {isArabic ? 'وقت التسجيل الأقصى' : 'Max Recording Time'}
              </span>
              <span className="font-mono text-amber-400 font-black">
                {localSettings.timeLimit} {isArabic ? 'ثانية' : 'seconds'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 20].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, timeLimit: sec })}
                  className={`h-11 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    localSettings.timeLimit === sec
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md border-b-2 border-amber-800'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {sec} {isArabic ? 'ثانية' : 's'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              {isArabic
                ? 'ملاحظة: اللعبة تحدد 20 ثانية كحد أقصى لضمان سرعة وتيرة اللعب والضحك.'
                : 'Note: Max 20 seconds ensures dynamic and fast-paced fun.'}
            </p>
          </div>

          {/* Card 4: Allowed Listens to Reversed */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-amber-400" />
                {isArabic ? 'مرات الاستماع للصوت المعكوس' : 'Allowed Listens to Reversed Audio'}
              </span>
              <span className="font-mono text-amber-400 font-black">
                {localSettings.allowedListens} {isArabic ? 'مرة' : 'times'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, allowedListens: num })}
                  className={`h-11 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    localSettings.allowedListens === num
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md border-b-2 border-amber-800'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {num} {isArabic ? (num === 1 ? 'مرة واحدة' : 'مرات') : (num === 1 ? '1 Time' : `${num} Times`)}
                </button>
              ))}
            </div>
          </div>

          {/* Card 5: Second Attempt Toggle */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-200">
                {isArabic ? 'السماح بإعادة التسجيل في نفس الجولة' : 'Allow 2nd Recording Attempt'}
              </span>
              <span className="block text-[10px] text-slate-400 mt-0.5">
                {isArabic ? 'إعطاء فرصة ثانية إذا أخطأ اللاعب' : 'Give a second chance if player stumbles'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLocalSettings({ ...localSettings, allowSecondAttempt: !localSettings.allowSecondAttempt })}
              className={`h-9 px-4 rounded-xl font-black text-xs transition-all cursor-pointer ${
                localSettings.allowSecondAttempt
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {localSettings.allowSecondAttempt
                ? (isArabic ? 'مسموح' : 'Allowed')
                : (isArabic ? 'محاولة واحدة' : '1 Attempt')}
            </button>
          </div>
        </form>

        {/* Sticky Launch Button in Footer */}
        <div className="p-4 bg-slate-950/95 border-t border-slate-800 shrink-0">
          <button
            id="btn-launch-match"
            onClick={handleSubmit}
            className="w-full h-15 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg border-b-4 border-amber-950 active:border-b-0 active:translate-y-1 shadow-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current text-slate-950" />
            <span>{isArabic ? 'انطلاق التحدي! 🚀' : 'Start Match! 🚀'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
