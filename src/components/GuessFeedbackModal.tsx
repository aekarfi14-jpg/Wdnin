import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Volume2, Play, Square, ArrowLeft, ArrowRight, Radio } from 'lucide-react';

interface GuessFeedbackModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  creatorName?: string;
  guesserName: string;
  phrase: string;
  originalAudioUrl?: string;
  originalAudioBlob?: Blob | null;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const GuessFeedbackModal: React.FC<GuessFeedbackModalProps> = ({
  isOpen,
  isSuccess,
  creatorName,
  guesserName,
  phrase,
  originalAudioUrl,
  originalAudioBlob,
  onClose,
  lang,
}) => {
  const isArabic = lang === 'ar';
  const NextArrow = isArabic ? ArrowLeft : ArrowRight;

  const [isPlayingOriginal, setIsPlayingOriginal] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Manage audio URL from props (url or blob)
  useEffect(() => {
    if (!isOpen) {
      setAudioSrc(null);
      setIsPlayingOriginal(false);
      setPlaybackProgress(0);
      return;
    }

    let createdUrl: string | null = null;
    if (originalAudioUrl) {
      setAudioSrc(originalAudioUrl);
    } else if (originalAudioBlob) {
      createdUrl = URL.createObjectURL(originalAudioBlob);
      setAudioSrc(createdUrl);
    } else {
      setAudioSrc(null);
    }

    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, originalAudioUrl, originalAudioBlob]);

  // Cleanup audio playback when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePlayOriginal = () => {
    if (!audioSrc) return;

    if (isPlayingOriginal && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingOriginal(false);
      setPlaybackProgress(0);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
    } else {
      audioRef.current.src = audioSrc;
    }

    audioRef.current.currentTime = 0;

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current && audioRef.current.duration) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setPlaybackProgress(progress);
      }
    };

    audioRef.current.onended = () => {
      setIsPlayingOriginal(false);
      setPlaybackProgress(0);
    };

    audioRef.current.onerror = (e) => {
      console.warn('Playback error:', e);
      setIsPlayingOriginal(false);
      setPlaybackProgress(0);
    };

    audioRef.current
      .play()
      .then(() => {
        setIsPlayingOriginal(true);
      })
      .catch((err) => {
        console.warn('Playback prevented or audio error:', err);
        setIsPlayingOriginal(false);
      });
  };

  const handleDismiss = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingOriginal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="guess-feedback-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className={`relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 text-center border-2 my-auto ${
            isSuccess
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500 shadow-[0_10px_35px_rgba(16,185,129,0.3)]'
              : 'bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/40 border-rose-500 shadow-[0_10px_35px_rgba(244,63,94,0.3)]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Result Badge */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {isSuccess ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>{isArabic ? 'عرفها! (+1 نقطة)' : 'Guessed It! (+1 Pt)'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm">
                <X className="w-4 h-4 text-rose-400 stroke-[3]" />
                <span>{isArabic ? 'معرفهاش! (0 نقاط)' : 'Missed It! (0 Pts)'}</span>
              </span>
            )}
          </div>

          {/* Meme Image Container with Fallback */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-xl mb-3.5 bg-slate-950">
            <img
              src={isSuccess ? '/assets/images/yep.jpg' : '/assets/images/nop.jpg'}
              alt={isSuccess ? 'yep.jpg' : 'nop.jpg'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = isSuccess ? '/assets/images/yep.jpg' : '/assets/images/nop.jpg';
              }}
            />
            {/* Subtle Gradient vignette on image */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
          </div>

          {/* Guesser Name */}
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-wide">
            {guesserName}
          </h3>

          {/* Humorous Algerian Reaction Phrase */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 mb-3.5 shadow-inner">
            <p className="text-sm sm:text-base font-extrabold text-amber-300 leading-snug">
              {phrase}
            </p>
          </div>

          {/* Dedicated Original Voice Playback Section (ALWAYS available, never cut off) */}
          {audioSrc && (
            <div className="mb-4 p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-md">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2 px-1">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {isArabic
                      ? `الجملة الأصلية بصوت ${creatorName ? creatorName : 'اللاعب'}:`
                      : `Original sentence by ${creatorName || 'Player'}:`}
                  </span>
                </span>
                {isPlayingOriginal && (
                  <span className="text-[10px] text-cyan-400 animate-pulse flex items-center gap-1 font-mono">
                    <Radio className="w-3 h-3 animate-spin" />
                    {isArabic ? 'جاري التشغيل...' : 'Playing...'}
                  </span>
                )}
              </div>

              {/* Progress Bar when playing */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>

              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                id="btn-feedback-play-original"
                onClick={handleTogglePlayOriginal}
                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isPlayingOriginal
                    ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 hover:bg-rose-900 shadow-md'
                    : 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 border-cyan-400 active:scale-98 shadow-md'
                }`}
              >
                {isPlayingOriginal ? (
                  <>
                    <Square className="w-4 h-4 fill-current text-rose-400" />
                    <span>{isArabic ? 'إيقاف تشغيل الصوت الأصلي' : 'Stop Original Audio'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-slate-950" />
                    <span>{isArabic ? '🎙️ اسمع الجملة الأصلية الحقيقية' : '🎙️ Hear Original Sentence'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Continue / Dismiss Button with tactile feedback */}
          <div>
            <button
              id="btn-dismiss-feedback"
              type="button"
              onClick={handleDismiss}
              className={`w-full h-13 py-3 px-4 rounded-2xl font-black text-sm sm:text-base border-b-4 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:border-b-0 active:translate-y-1 ${
                isSuccess
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-950'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-950'
              }`}
            >
              <span>{isArabic ? 'متابعة الجولة (التالي)' : 'Continue Round (Next)'}</span>
              <NextArrow className="w-4 h-4 stroke-[3]" />
            </button>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {isArabic ? 'اضغط للاستمرار إلى الجولة التالية' : 'Press to proceed to next round'}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
