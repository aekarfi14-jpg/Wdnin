import React, { useEffect } from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, lang }) => {
  const isArabic = lang === 'ar';

  // Allow closing with ESC key for quick exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="rules-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[92vh] bg-gradient-to-b from-[#101726] via-[#0d131f] to-[#070b12] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with prominent, large exit button */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/90 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">
                {isArabic ? 'قوانين لعبة ودنين' : 'WDNIN Game Rules'}
              </h2>
              <span className="text-[11px] text-amber-400/80 font-bold">
                {isArabic ? 'تحدي عكس الصوت المباشر' : 'Reverse Audio Challenge'}
              </span>
            </div>
          </div>

          {/* Easy-to-tap prominent Close Button at top */}
          <button
            id="btn-close-rules"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق القوانين' : 'Close Rules'}
            className="h-10 px-3.5 rounded-xl bg-slate-800/90 hover:bg-red-950/70 border border-slate-700 hover:border-red-600/60 text-slate-300 hover:text-red-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
            <span>{isArabic ? 'إغلاق' : 'Close'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            {/* Image side */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[210px] aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-xl bg-slate-950">
                <img
                  src="/assets/images/Rols.jpg"
                  alt="Game Rules"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/images/rols.jpg';
                  }}
                />
              </div>
              <span className="text-xs text-amber-300/80 font-bold mt-2.5 text-center">
                {isArabic ? 'قوانين بسيطة، ضحك ومتعة 100%!' : 'Simple rules, pure fun!'}
              </span>
            </div>

            {/* Rules numbered list */}
            <div className="sm:col-span-7 space-y-2">
              {isArabic ? (
                <ol className="space-y-2 text-xs md:text-sm text-slate-300 font-medium">
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">1</span>
                    <span><strong>لاعبان فقط أوفلاين:</strong> تلعب اللعبة حصرياً بين شخصين وجهاً لوجه على نفس الهاتف.</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">2</span>
                    <span><strong>تسجيل الجملة:</strong> يضغط اللاعب الأول زر التسجيل ويسجل أي جملة أو مثل شعبي.</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">3</span>
                    <span><strong>عكس الصوت:</strong> يعكس التطبيق التسجيل مباشرة ويخرج صوتاً غريباً مضحكاً.</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">4</span>
                    <span><strong>الاستماع والتقليد:</strong> يستمع اللاعب الثاني للصوت المعكوس، ثم يستعد ويضغط ابدأ التسجيل لتقليده!</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">5</span>
                    <span><strong>إعادة العكس:</strong> يعكس التطبيق تسجيل التقليد ليرجع للأصل لمعرفة هل قالها صح أم لا!</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">6</span>
                    <span><strong>الحكم والتبادل:</strong> تختار "عرفها" أو "معرفهاش"، ثم تتبادلون الأدوار حتى نهاية الجولات والفائز باللقب!</span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2 text-xs md:text-sm text-slate-300 font-medium">
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">1</span>
                    <span><strong>2 Players Offline:</strong> Head-to-head party game on a single phone.</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">2</span>
                    <span><strong>Record Sentence:</strong> Player 1 records any sentence or phrase.</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">3</span>
                    <span><strong>Audio Reversal:</strong> The app reverses the audio in real time into backwards speech.</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">4</span>
                    <span><strong>Imitation:</strong> Player 2 listens, gets ready, and records their vocal imitation!</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">5</span>
                    <span><strong>Flip Back:</strong> The app flips the imitation to reveal the normal sentence!</span>
                  </li>
                  <li className="flex items-start gap-2.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 border border-amber-500/40">6</span>
                    <span><strong>Judge & Swap:</strong> Judge "Got it" or "Missed", swap roles each round.</span>
                  </li>
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Large Bottom Exit Button (Full Width, Easy Touch Target) */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 shrink-0">
          <button
            id="btn-understand-rules"
            onClick={onClose}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base border-b-4 border-amber-950 active:border-b-0 active:translate-y-1 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>{isArabic ? 'فهمت القوانين — إغلاق والعودة' : 'Understood — Close & Return'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
