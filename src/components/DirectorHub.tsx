import React from 'react';
import { GameState, ActivePlayer } from '../types';
import { LiveAudioData } from '../utils/audioEngine';
import { LiveAudioVisualizer } from './LiveAudioVisualizer';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Home,
  Clock,
  Sparkles,
  Volume2,
  Disc,
  Repeat,
  Headphones,
  Award,
  Pause,
  Radio,
  VolumeX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DirectorHubProps {
  id: string;
  gameState: GameState;
  currentRound: number;
  totalRounds: number;
  creatorPlayer: ActivePlayer;
  guesserPlayer: ActivePlayer;
  creatorName: string;
  guesserName: string;
  recordingSeconds: number;
  maxRecordingTime: number;
  listenCount: number;
  allowedListens: number;
  allowSecondAttempt: boolean;
  liveAudioData?: LiveAudioData;
  isPlayingAudio?: boolean;
  isP2RecordingActive?: boolean;
  onStartRecordingP1: () => void;
  onStopRecordingP1: () => void;
  onPlayReversedP1: () => void;
  onStopPlayback?: () => void;
  onProceedToP2Recording: () => void;
  onStartRecordingP2: () => void;
  onStopRecordingP2: () => void;
  onPlayResultP2: () => void;
  onProceedToGuess: () => void;
  onGuessResult: (success: boolean) => void;
  onNextRound: () => void;
  onMainMenu: () => void;
  lang: 'ar' | 'en';
}

export const DirectorHub: React.FC<DirectorHubProps> = ({
  id,
  gameState,
  currentRound,
  totalRounds,
  creatorName,
  guesserName,
  recordingSeconds,
  maxRecordingTime,
  listenCount,
  allowedListens,
  allowSecondAttempt,
  liveAudioData,
  isPlayingAudio = false,
  isP2RecordingActive = false,
  onStartRecordingP1,
  onStopRecordingP1,
  onPlayReversedP1,
  onStopPlayback,
  onProceedToP2Recording,
  onStartRecordingP2,
  onStopRecordingP2,
  onPlayResultP2,
  onProceedToGuess,
  onGuessResult,
  onNextRound,
  onMainMenu,
  lang,
}) => {
  const isArabic = lang === 'ar';
  const NextArrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div
      id={id}
      className="h-full flex flex-col justify-between p-3 sm:p-4 bg-gradient-to-b from-[#101726] via-[#0b1019] to-[#070a10] border-2 border-amber-500/35 rounded-3xl shadow-2xl relative select-none overflow-hidden"
    >
      {/* Top Metallic Gold Highlight Line */}
      <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none" />

      {/* Center Zone: Dedicated Non-Overlapping Luxurious Content Cards */}
      <div className="flex-1 my-auto flex flex-col items-center justify-center text-center px-1 py-2 w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* STATE 1: ROUND_START (Player 1 Ready Card) */}
          {gameState === 'ROUND_START' && (
            <motion.div
              key="round_start_card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950/70 border border-amber-500/25 rounded-2xl p-4 shadow-xl space-y-3"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-[11px] font-black text-amber-300">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{isArabic ? 'المرحلة 1: تسجيل الجملة' : 'Stage 1: Sentence Recording'}</span>
              </div>

              {/* Animated Microphone Icon */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-red-500/15 animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 border-2 border-red-400/40 shadow-lg flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                {isArabic ? `دورك للتسجيل يا ${creatorName}!` : `${creatorName}'s Turn to Record!`}
              </h3>

              {/* Explanatory subtitle in its own clean container (NO OVERLAP) */}
              <div className="bg-[#090e18] border border-slate-800 rounded-xl p-2.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic
                    ? 'اضغط زر التسجيل بالأسفل وتكلم بوضوح. سيتم عكس كلامك مباشرة ليسمعه رفيقك بالمقلوب!'
                    : 'Press Record below and speak clearly. Your sentence will be flipped backwards in real time!'}
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 2: PLAYER_1_RECORDING (Live Audio Waveform) */}
          {gameState === 'PLAYER_1_RECORDING' && (
            <motion.div
              key="p1_recording_card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center"
            >
              <LiveAudioVisualizer
                volume={liveAudioData?.volume || 0}
                timeDomain={liveAudioData?.timeDomain || []}
                frequencies={liveAudioData?.frequencies || []}
                playerName={creatorName}
                remainingSeconds={maxRecordingTime - recordingSeconds}
                maxSeconds={maxRecordingTime}
                lang={lang}
              />
            </motion.div>
          )}

          {/* STATE 3: REVERSING_P1 (Reversing Mechanical Tape) */}
          {gameState === 'REVERSING_P1' && (
            <motion.div
              key="reversing_p1_card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 shadow-xl space-y-3"
            >
              {/* 3D Cassette Tape Flipping Animation */}
              <div className="relative w-24 h-24 mx-auto [perspective:1000px]">
                <motion.div
                  animate={{ rotateY: [0, 180, 360] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 via-amber-950 to-slate-900 p-1 border border-amber-500/40 shadow-xl"
                >
                  <div className="w-full h-full bg-[#080d15] rounded-xl flex flex-col items-center justify-center border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <Disc className="w-7 h-7 text-amber-400 animate-spin" />
                      <Disc className="w-7 h-7 text-amber-500 animate-spin" style={{ animationDirection: 'reverse' }} />
                    </div>
                    <span className="text-[9px] font-black text-amber-300 tracking-widest mt-1.5 font-mono">
                      ◀◀ REVERSE AUDIO
                    </span>
                  </div>
                </motion.div>
              </div>

              <div>
                <h4 className="text-base font-black text-white">
                  {isArabic ? 'جاري قلب وعكس الصوت...' : 'Reversing Audio Samples...'}
                </h4>
                <p className="text-xs text-amber-300/80 font-medium mt-1">
                  {isArabic ? 'تحويل الصوت زمنيّاً إلى كلام معكوس' : 'Flipping PCM samples in real time'}
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 4: PLAYER_2_LISTENING (Luxurious Playback Card) */}
          {gameState === 'PLAYER_2_LISTENING' && (
            <motion.div
              key="p2_listening_card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-md bg-slate-950/75 border border-amber-500/35 rounded-2xl p-4 shadow-xl space-y-3"
            >
              {/* Top Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-[11px] font-black text-sky-300">
                  {isArabic ? `المستمع: ${guesserName}` : `Listener: ${guesserName}`}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-amber-300 font-mono">
                  {isArabic ? `مرات الاستماع: ${listenCount} / ${allowedListens}` : `Listens: ${listenCount} / ${allowedListens}`}
                </span>
              </div>

              {/* Central Dynamic Audio Animation: Animated Disc / Equalizer */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {isPlayingAudio && (
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                )}
                <div
                  className={`w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-xl transition-all duration-300 ${
                    isPlayingAudio
                      ? 'border-amber-400 bg-gradient-to-br from-amber-500/30 via-slate-900 to-amber-900/40'
                      : 'border-slate-700 bg-slate-900/80'
                  }`}
                >
                  {isPlayingAudio ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Disc className="w-10 h-10 text-amber-400" />
                    </motion.div>
                  ) : (
                    <Headphones className="w-9 h-9 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Animated Equalizer Sound Bars (Visible while playing) */}
              {isPlayingAudio ? (
                <div className="flex items-center justify-center gap-1 h-6">
                  {[0.4, 0.9, 0.6, 1, 0.7, 0.85, 0.5, 0.95].map((scale, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['4px', '22px', '8px', '24px', '6px'] }}
                      transition={{
                        duration: 0.75,
                        repeat: Infinity,
                        delay: i * 0.08,
                        ease: 'easeInOut',
                      }}
                      className="w-1 bg-amber-400 rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 block font-mono">
                  {isArabic ? 'اضغط ابدأ التشغيل للاستماع' : 'Tap Play to Listen'}
                </span>
              )}

              {/* Title */}
              <h3 className="text-lg font-black text-white leading-tight">
                {isArabic ? `اسمع الصوت المعكوس يا ${guesserName}!` : `Listen to the Reversed Audio!`}
              </h3>

              {/* Explanatory text container (Completely separate from buttons/icons) */}
              <div className="bg-[#080d16] border border-slate-800 rounded-xl p-2.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic
                    ? 'استمع بدقة للحروف والنغمات المعكوسة. عندما تنتهي، اضغط "التالي" لتسجيل تقليدك.'
                    : 'Listen closely to the reversed syllables, then tap Next when ready to imitate!'}
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 5: PLAYER_2_RECORDING */}
          {gameState === 'PLAYER_2_RECORDING' && (
            <div className="w-full flex flex-col items-center">
              {!isP2RecordingActive ? (
                /* Sub-State: Preparation Before Recording (User is prepared, not rushed!) */
                <motion.div
                  key="p2_prepare_card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-slate-950/75 border border-amber-500/35 rounded-2xl p-4 shadow-xl space-y-3"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-black text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isArabic ? 'المرحلة 2: تقليد الصوت' : 'Stage 2: Voice Imitation'}</span>
                  </div>

                  {/* Pulsing Ready Microphone */}
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 border-2 border-emerald-400/40 shadow-lg flex items-center justify-center"
                    >
                      <Mic className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                    {isArabic ? `جاهز للتقليد يا ${guesserName}؟` : `Ready to Imitate, ${guesserName}?`}
                  </h3>

                  {/* Explanatory text in dedicated box */}
                  <div className="bg-[#090e18] border border-slate-800 rounded-xl p-2.5">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isArabic
                        ? 'خذ نفساً واستحضر النغمة المعكوسة. اضغط "ابدأ التسجيل" عندما تكون مستعداً تماماً!'
                        : 'Take a breath and recall the reversed melody. Tap Start Recording whenever you are ready!'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* Sub-State: Active Recording with Live Visualizer */
                <motion.div
                  key="p2_live_recording"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col items-center"
                >
                  <LiveAudioVisualizer
                    volume={liveAudioData?.volume || 0}
                    timeDomain={liveAudioData?.timeDomain || []}
                    frequencies={liveAudioData?.frequencies || []}
                    playerName={guesserName}
                    remainingSeconds={maxRecordingTime - recordingSeconds}
                    maxSeconds={maxRecordingTime}
                    lang={lang}
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* STATE 6: REVERSING_P2 (Reversing Imitation Back to Normal) */}
          {gameState === 'REVERSING_P2' && (
            <motion.div
              key="reversing_p2_card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 shadow-xl space-y-3"
            >
              <div className="relative w-24 h-24 mx-auto [perspective:1000px]">
                <motion.div
                  animate={{ rotateY: [360, 180, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 via-amber-950 to-slate-900 p-1 border border-amber-500/40 shadow-xl"
                >
                  <div className="w-full h-full bg-[#080d15] rounded-xl flex flex-col items-center justify-center border border-amber-500/20">
                    <Repeat className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-[9px] font-black text-amber-300 tracking-widest mt-1.5 font-mono">
                      ▶▶ RE-FLIP BACK
                    </span>
                  </div>
                </motion.div>
              </div>

              <div>
                <h4 className="text-base font-black text-white">
                  {isArabic ? 'عكس التقليد للأصل...' : 'Reversing Imitation Back...'}
                </h4>
                <p className="text-xs text-amber-300/80 font-medium mt-1">
                  {isArabic ? 'هل سيعود الصوت للجملة الأصلية؟' : 'Restoring backwards imitation to normal'}
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 7: RESULT_PLAYBACK (Listening to Final Result) */}
          {gameState === 'RESULT_PLAYBACK' && (
            <motion.div
              key="result_playback_card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-slate-950/75 border border-amber-500/35 rounded-2xl p-4 shadow-xl space-y-3"
            >
              <span className="inline-block text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-500/30">
                {isArabic ? 'المرحلة 3: استماع النتيجة 🔊' : 'Stage 3: Result Playback'}
              </span>

              {/* Dynamic Sound Waves Animation */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                {isPlayingAudio && (
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                )}
                <div
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all ${
                    isPlayingAudio
                      ? 'border-amber-400 bg-amber-500/25'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <Volume2 className={`w-8 h-8 ${isPlayingAudio ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                </div>
              </div>

              {/* Playing Equalizer Indicator */}
              {isPlayingAudio && (
                <div className="flex items-center justify-center gap-1 h-5">
                  {[0.5, 0.8, 0.4, 0.95, 0.6, 0.9].map((val, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['4px', '20px', '6px', '18px'] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.07 }}
                      className="w-1 bg-amber-400 rounded-full"
                    />
                  ))}
                </div>
              )}

              <h3 className="text-lg font-black text-white leading-tight">
                {isArabic ? 'اسمعوا النتيجة بعد العكس!' : 'Listen to the Re-Flipped Result!'}
              </h3>

              <div className="bg-[#080d16] border border-slate-800 rounded-xl p-2.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic
                    ? 'اضغط "ابدأ التشغيل" لسماع تسجيل التقليد بعد عكسه، ثم انتقل للحكم.'
                    : 'Tap Start Playback to hear the imitation reversed back, then judge!'}
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 8: GUESS (Verdict) */}
          {gameState === 'GUESS' && (
            <motion.div
              key="guess_verdict_card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-slate-950/75 border border-amber-500/35 rounded-2xl p-4 shadow-xl space-y-3"
            >
              <span className="inline-block text-[11px] font-black text-amber-300 bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-500/30">
                {isArabic ? 'الحكم النهائي ⚖️' : 'Final Judgment'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {isArabic ? `هل ${guesserName} نطق الجملة صح؟` : `Did ${guesserName} guess correctly?`}
              </h3>
              <div className="bg-[#080d16] border border-slate-800 rounded-xl p-2.5">
                <p className="text-xs text-slate-300">
                  {isArabic
                    ? 'إذا كانت الجملة مفهومة وصحيحة اضغط "عرفها"، وإلا اضغط "معرفهاش".'
                    : 'If the restored speech matched the original sentence, award the point!'}
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 9: ROUND_END (Role Swap) */}
          {gameState === 'ROUND_END' && (
            <motion.div
              key="round_end_card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-md bg-slate-950/75 border border-emerald-500/35 rounded-2xl p-4 shadow-xl space-y-3"
            >
              <span className="inline-block text-[11px] font-black text-emerald-400 bg-emerald-950/60 px-3.5 py-1 rounded-full border border-emerald-600/40">
                {isArabic ? `اكتملت الجولة ${currentRound}` : `Round ${currentRound} Complete`}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {isArabic ? 'تبادل الأدوار الآن!' : 'Roles Switch Now!'}
              </h3>
              <div className="bg-[#080d16] border border-slate-800 rounded-xl p-2.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic
                    ? `${guesserName} سيسجل جملته الجديدة، و ${creatorName} سيستمع ويقلّد!`
                    : `${guesserName} will record the new sentence, and ${creatorName} will listen and guess!`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Controls: Ergonomic, Non-Overlapping Tactile Luxury Buttons */}
      <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-800/90 shrink-0">
        {/* ROUND_START: Button ابدأ التسجيل */}
        {gameState === 'ROUND_START' && (
          <button
            id="btn-start-record-p1"
            onClick={onStartRecordingP1}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-base md:text-lg border-b-4 border-red-950 active:border-b-0 active:translate-y-1 shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Mic className="w-5 h-5" />
            <span>{isArabic ? 'ابدأ التسجيل (تكلم بوضوح)' : 'Start Recording (Speak Now)'}</span>
          </button>
        )}

        {/* PLAYER_1_RECORDING: Button إيقاف التسجيل */}
        {gameState === 'PLAYER_1_RECORDING' && (
          <button
            id="btn-stop-record-p1"
            onClick={onStopRecordingP1}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-700 via-red-800 to-rose-900 hover:from-red-600 hover:to-rose-800 text-white font-black text-base md:text-lg border-b-4 border-black active:border-b-0 active:translate-y-1 shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer animate-pulse"
          >
            <Square className="w-5 h-5 fill-current" />
            <span>{isArabic ? 'إيقاف التسجيل (انتهيت من الكلام)' : 'Stop Recording (Finished)'}</span>
          </button>
        )}

        {/* REVERSING_P1: Static Disabled State */}
        {gameState === 'REVERSING_P1' && (
          <button
            id="btn-reversing-p1"
            disabled
            className="w-full h-14 rounded-2xl bg-slate-900 text-amber-300 font-black text-sm md:text-base border-b-4 border-slate-950 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
            <span>{isArabic ? 'جاري قلب وعكس الصوت...' : 'Reversing Audio...'}</span>
          </button>
        )}

        {/* PLAYER_2_LISTENING: Dedicated Play / Stop Playback Buttons & Next */}
        {gameState === 'PLAYER_2_LISTENING' && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2">
              {/* Toggle Start Playback / Stop Playback */}
              <button
                id="btn-toggle-play-reversed-p1"
                onClick={isPlayingAudio ? onStopPlayback : onPlayReversedP1}
                className={`flex-1 h-13 rounded-2xl font-black text-sm md:text-base border-b-4 active:border-b-0 active:translate-y-1 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-amber-950'
                    : 'bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white border-sky-950'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>{isArabic ? 'إيقاف التشغيل' : 'Stop Playback'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isArabic ? 'ابدأ تشغيل المعكوس' : 'Start Playback'}</span>
                  </>
                )}
              </button>

              {/* Re-listen Button if allowed */}
              {allowSecondAttempt && (
                <button
                  id="btn-re-listen"
                  disabled={listenCount >= allowedListens || isPlayingAudio}
                  onClick={onPlayReversedP1}
                  className={`h-13 px-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    listenCount < allowedListens && !isPlayingAudio
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 cursor-pointer'
                      : 'bg-slate-900/60 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                  title={isArabic ? 'استماع مرة أخرى' : 'Re-listen'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isArabic ? 'إعادة' : 'Replay'}</span>
                </button>
              )}
            </div>

            {/* Next Button (Active only after listening at least once) */}
            <button
              id="btn-proceed-p2-record"
              disabled={listenCount === 0}
              onClick={onProceedToP2Recording}
              className={`w-full h-13 rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all ${
                listenCount > 0
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-b-4 border-amber-950 active:border-b-0 active:translate-y-1 shadow-md cursor-pointer'
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <span>{isArabic ? 'التالي (استعد للتقليد)' : 'Next (Get Ready to Imitate)'}</span>
              <NextArrow className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* PLAYER_2_RECORDING: Prepare State ("ابدأ التسجيل") OR Recording State ("إيقاف التسجيل") */}
        {gameState === 'PLAYER_2_RECORDING' && (
          <div className="w-full">
            {!isP2RecordingActive ? (
              /* User has preparation time! Clear Start button */
              <button
                id="btn-start-record-p2"
                onClick={onStartRecordingP2}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base md:text-lg border-b-4 border-emerald-950 active:border-b-0 active:translate-y-1 shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>{isArabic ? 'ابدأ التسجيل (جاهز للتقليد)' : 'Start Recording (Ready)'}</span>
              </button>
            ) : (
              /* Actively recording: Stop button */
              <button
                id="btn-stop-record-p2"
                onClick={onStopRecordingP2}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-700 via-red-800 to-rose-900 hover:from-red-600 hover:to-rose-800 text-white font-black text-base md:text-lg border-b-4 border-black active:border-b-0 active:translate-y-1 shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>{isArabic ? 'إيقاف التسجيل (انتهيت من التقليد)' : 'Stop Imitation (Finished)'}</span>
              </button>
            )}
          </div>
        )}

        {/* REVERSING_P2: Static Disabled State */}
        {gameState === 'REVERSING_P2' && (
          <button
            id="btn-reversing-p2"
            disabled
            className="w-full h-14 rounded-2xl bg-slate-900 text-amber-300 font-black text-sm md:text-base border-b-4 border-slate-950 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
            <span>{isArabic ? 'عكس التسجيل للأصل...' : 'Reversing Imitation...'}</span>
          </button>
        )}

        {/* RESULT_PLAYBACK: Start Playback / Stop Playback & Proceed to Guess */}
        {gameState === 'RESULT_PLAYBACK' && (
          <div className="flex flex-col gap-2 w-full">
            <button
              id="btn-toggle-play-result-p2"
              onClick={isPlayingAudio ? onStopPlayback : onPlayResultP2}
              className={`w-full h-13 rounded-2xl font-black text-sm md:text-base border-b-4 active:border-b-0 active:translate-y-1 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isPlayingAudio
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-amber-950'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 border-amber-950'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>{isArabic ? 'إيقاف التشغيل' : 'Stop Playback'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>{isArabic ? 'ابدأ تشغيل النتيجة' : 'Start Playing Result'}</span>
                </>
              )}
            </button>

            <button
              id="btn-proceed-guess"
              onClick={onProceedToGuess}
              className="w-full h-13 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm md:text-base border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isArabic ? 'التالي (الحكم والتقييم)' : 'Next (Judge Guess)'}</span>
              <NextArrow className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* GUESS: Tactile Verdict Buttons (Got It vs Missed It) */}
        {gameState === 'GUESS' && (
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              id="btn-guess-success"
              onClick={() => onGuessResult(true)}
              className="h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-base md:text-lg border-b-4 border-emerald-950 active:border-b-0 active:translate-y-1 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isArabic ? 'عرفها' : 'Got It!'}</span>
            </button>

            <button
              id="btn-guess-fail"
              onClick={() => onGuessResult(false)}
              className="h-14 rounded-2xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white font-black text-base md:text-lg border-b-4 border-rose-950 active:border-b-0 active:translate-y-1 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
              <span>{isArabic ? 'معرفهاش' : 'Missed It'}</span>
            </button>
          </div>
        )}

        {/* ROUND_END: Proceed to Next Round */}
        {gameState === 'ROUND_END' && (
          <button
            id="btn-next-round"
            onClick={onNextRound}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base md:text-lg border-b-4 border-amber-950 active:border-b-0 active:translate-y-1 shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>{isArabic ? 'التالي (ابدأ الجولة)' : 'Next (Start Round)'}</span>
            <NextArrow className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
