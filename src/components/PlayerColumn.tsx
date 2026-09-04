import React from 'react';
import { Mic, Headphones, Volume2, AudioWaveform, Disc, Radio, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { LiveAudioData } from '../utils/audioEngine';

interface PlayerColumnProps {
  id: string;
  side: 'left' | 'right';
  playerNumber: '1' | '2';
  name: string;
  score: number;
  isCurrentRecorder: boolean;
  isCurrentListener: boolean;
  isRecordingActive: boolean;
  isReversingActive: boolean;
  isListeningActive: boolean;
  volumeLevel: number;
  waveform?: number[];
  liveAudioData?: LiveAudioData;
  lang: 'ar' | 'en';
}

export const PlayerColumn: React.FC<PlayerColumnProps> = ({
  id,
  side,
  playerNumber,
  name,
  score,
  isCurrentRecorder,
  isCurrentListener,
  isRecordingActive,
  isReversingActive,
  isListeningActive,
  volumeLevel,
  waveform,
  liveAudioData,
  lang,
}) => {
  const isArabic = lang === 'ar';
  const isActivePlayer = isCurrentRecorder || isCurrentListener;

  // Visual accents: Player 1 = Platinum/Sky, Player 2 = Champagne Gold/Amber
  const isP1 = playerNumber === '1';
  const crestColor = isP1
    ? 'bg-sky-950/80 text-sky-300 border-sky-500/30'
    : 'bg-amber-950/80 text-amber-300 border-amber-500/30';

  const cardBorder = isActivePlayer
    ? isRecordingActive
      ? 'border-red-600/40 bg-gradient-to-b from-[#151016] via-[#0d1017] to-[#070a10]'
      : isListeningActive
      ? 'border-sky-500/40 bg-gradient-to-b from-[#0e1624] via-[#0b1019] to-[#070a10]'
      : 'border-amber-500/35 bg-gradient-to-b from-[#131722] via-[#0c1018] to-[#070a10]'
    : 'border-slate-800/80 bg-[#090d14]/90 opacity-80';

  return (
    <div
      id={id}
      className={`relative h-full flex flex-col justify-between p-3.5 md:p-4 rounded-3xl transition-all duration-300 select-none overflow-hidden border shadow-xl ${cardBorder}`}
    >
      {/* Top Header: Player Crest, Name, Score Plaque */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${crestColor}`}>
            {isArabic ? `اللاعب ${playerNumber}` : `Player ${playerNumber}`}
          </span>
          <span className="text-[11px] text-slate-400 font-bold">
            {side === 'right' ? (isArabic ? 'الجهة اليمنى' : 'Right') : (isArabic ? 'الجهة اليسرى' : 'Left')}
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide truncate max-w-[160px]" title={name}>
            {name}
          </h2>

          {/* High-End Tactile Score Plaque (Brushed Bronze & Gold) */}
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-slate-900 to-slate-950 px-3.5 py-1 rounded-2xl border border-amber-500/25 shadow-sm">
            <span className="text-[11px] text-slate-400 font-bold">{isArabic ? 'النقاط' : 'Score'}</span>
            <span className="text-xl md:text-2xl font-black text-amber-400 tabular-nums">
              {score}
            </span>
          </div>
        </div>

        {/* Current Round Role Pill */}
        <div className="mt-2 flex items-center gap-2">
          {isCurrentRecorder && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-red-950/70 text-red-300 border border-red-700/40 shadow-sm">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>{isArabic ? 'دورك: سجّل الجملة' : 'Role: Recording'}</span>
            </div>
          )}
          {isCurrentListener && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-sky-950/70 text-sky-300 border border-sky-600/40 shadow-sm">
              <Headphones className="w-3.5 h-3.5 text-sky-400" />
              <span>{isArabic ? 'دورك: استمع وقلّد' : 'Role: Guesser'}</span>
            </div>
          )}
          {!isCurrentRecorder && !isCurrentListener && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs text-slate-500 bg-slate-900/60 border border-slate-800">
              <span>{isArabic ? 'في الانتظار' : 'Waiting'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Live Audio Display Animation & Visual Feedback */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 min-h-0 w-full">
        {/* ANIMATION 1: LIVE RECORDING (عرض الصوت الحقيقي أثناء التسجيل) */}
        {isRecordingActive && (
          <div className="flex flex-col items-center justify-center w-full px-1">
            {/* Dynamic Microphone Studio Head */}
            <div className="relative flex items-center justify-center mb-3">
              {/* Subtle Concentric Sound Rings */}
              <motion.div
                animate={{
                  scale: [1, 1.25 + volumeLevel * 0.4, 1],
                  opacity: [0.6, 0.15, 0.6]
                }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-24 h-24 rounded-full border border-red-500/30"
              />

              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-b from-red-600 via-rose-700 to-red-800 flex items-center justify-center border-2 border-red-400/40 shadow-md">
                <Mic className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Live Audio Oscilloscope Miniature Wave */}
            <div className="w-full max-w-[200px] h-9 flex items-center justify-center px-2 bg-slate-950/90 rounded-xl border border-red-500/30 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path
                  d={
                    liveAudioData?.timeDomain && liveAudioData.timeDomain.length > 0
                      ? liveAudioData.timeDomain
                          .slice(0, 32)
                          .map((val, idx, arr) => {
                            const x = (idx / (arr.length - 1)) * 100;
                            const y = 20 + val * 16 * (volumeLevel * 1.5 + 0.2);
                            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                          })
                          .join(' ')
                      : 'M 0 20 L 100 20'
                  }
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Live Frequency Spectrum Bars */}
            <div className="flex items-end gap-1 mt-2.5 h-8 px-3 py-1 bg-slate-950/80 rounded-xl border border-slate-800">
              {(liveAudioData?.frequencies && liveAudioData.frequencies.length > 0
                ? liveAudioData.frequencies.slice(0, 12)
                : [0.2, 0.5, 0.8, 0.6, 0.9, 0.7, 0.85, 0.4, 0.6, 0.3, 0.5, 0.2]
              ).map((val, i) => {
                const heightPercent = Math.max(16, Math.min(100, val * 100));
                return (
                  <motion.div
                    key={i}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.06 }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300"
                  />
                );
              })}
            </div>

            {/* HUD Status Text */}
            <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{isArabic ? 'عرض الصوت مباشر ●' : 'LIVE AUDIO WAVE ●'}</span>
            </div>
          </div>
        )}

        {/* ANIMATION 2: 3D REVERSING (Luxury Reel-to-Reel Reverse) */}
        {isReversingActive && (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="relative w-18 h-18 [perspective:800px]">
              <motion.div
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [1, 1.04, 1]
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 via-amber-950 to-slate-900 p-0.5 border border-amber-500/35 shadow-md [transform-style:preserve-3d]"
              >
                <div className="w-full h-full bg-[#080c14] rounded-xl flex flex-col items-center justify-center border border-amber-500/20">
                  <Disc className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-[9px] font-black text-amber-300 tracking-wider mt-1 font-mono">
                    ◀◀ REVERSE
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Audio Waveform Reversal Track */}
            <div className="flex items-center gap-1 mt-3 h-8 w-full max-w-[170px] justify-center px-2 bg-slate-950/80 rounded-xl border border-amber-500/30">
              {(waveform && waveform.length > 0 ? waveform.slice(0, 14) : [0.3, 0.7, 0.9, 0.4, 0.8, 0.5, 0.75, 0.35, 0.6, 0.85, 0.4]).map(
                (val, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      scaleY: [1, 0.25, 1],
                      backgroundColor: ['#f59e0b', '#d97706', '#fbbf24']
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: (14 - idx) * 0.05 }}
                    className="w-1 rounded-full bg-amber-500"
                    style={{ height: `${Math.max(22, val * 100)}%` }}
                  />
                )
              )}
            </div>

            <div className="mt-2 text-xs font-black text-amber-300/90 font-mono">
              <span>{isArabic ? 'قلب مسار الصوت ◀◀' : 'FLIPPING SAMPLES ◀◀'}</span>
            </div>
          </div>
        )}

        {/* ANIMATION 3: LISTENING TO AUDIO */}
        {isListeningActive && (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.15, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="absolute w-22 h-22 rounded-full border border-sky-500/30"
              />
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-b from-sky-600 via-blue-700 to-sky-800 flex items-center justify-center border-2 border-sky-400/40 shadow-md">
                <Headphones className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 px-3 py-1 bg-slate-950/80 rounded-xl border border-sky-500/30">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <div className="flex items-center gap-1 h-5">
                {[0.4, 0.8, 1.0, 0.65, 0.9, 0.5].map((_, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ scaleY: [0.3, 1.2, 0.3] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: idx * 0.12 }}
                    className="w-1.5 h-full bg-gradient-to-t from-sky-500 to-sky-300 rounded-full"
                  />
                ))}
              </div>
            </div>

            <p className="mt-2 text-xs font-black text-sky-300">
              {isArabic ? 'استمع للصوت المعكوس 🎧' : 'Listening to Reversed Audio 🎧'}
            </p>
          </div>
        )}

        {/* ANIMATION 4: STANDBY READY */}
        {!isRecordingActive && !isReversingActive && !isListeningActive && (
          <div className="flex flex-col items-center justify-center text-slate-500 py-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-2 shadow-inner">
              <AudioWaveform className="w-6 h-6 text-slate-500" />
            </div>
            {waveform && waveform.length > 0 ? (
              <div className="flex items-center gap-0.5 h-6 w-full max-w-[150px] justify-center opacity-50">
                {waveform.slice(0, 16).map((val, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-amber-500/60 rounded-full"
                    style={{ height: `${Math.max(20, val * 100)}%` }}
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-bold">
                {isArabic ? 'مستعد للتحدي' : 'Ready'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Game HUD Status */}
      <div className="relative z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>{isArabic ? 'حالة اللاعب' : 'Status'}</span>
        <span className="font-black text-slate-200">
          {isRecordingActive
            ? (isArabic ? '🔴 تسجيل صوت مباشر' : '🔴 Recording Voice')
            : isReversingActive
            ? (isArabic ? '🔄 قلب وعكس الصوت' : '🔄 Reversing Audio')
            : isListeningActive
            ? (isArabic ? '🎧 استماع' : '🎧 Listening')
            : (isArabic ? 'جاهز' : 'Ready')}
        </span>
      </div>
    </div>
  );
};

