import React, { useEffect } from 'react';
import { Trophy, RotateCcw, Home, Award, BarChart3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinModalProps {
  isOpen: boolean;
  player1Name: string;
  player2Name: string;
  p1Score: number;
  p2Score: number;
  onReplay: () => void;
  onMainMenu: () => void;
  onOpenStatistics: () => void;
  lang: 'ar' | 'en';
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  player1Name,
  player2Name,
  p1Score,
  p2Score,
  onReplay,
  onMainMenu,
  onOpenStatistics,
  lang,
}) => {
  const isArabic = lang === 'ar';

  const isTie = p1Score === p2Score;
  const winnerName = p1Score > p2Score ? player1Name : player2Name;
  const winnerScore = Math.max(p1Score, p2Score);

  useEffect(() => {
    if (!isOpen) return;

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="win-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg select-none"
    >
      <div className="relative max-w-lg w-full bg-slate-900 border-4 border-amber-500 rounded-3xl overflow-hidden shadow-2xl p-6 text-center">
        {/* Top Trophy Banner */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-amber-400">
            {isTie
              ? (isArabic ? 'تعادل أسطوري!' : 'Legendary Tie!')
              : (isArabic ? 'الفائز في لعبة ودنين!' : 'WDNIN Champion!')}
          </span>
        </div>

        {/* Meme Image: win.jpg */}
        <div className="relative w-48 h-40 mx-auto rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-xl mb-3">
          <img
            src="/assets/images/win.jpg"
            alt="win.jpg"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Winner Name & Announcement */}
        {!isTie ? (
          <div className="space-y-1 mb-4">
            <h2 className="text-3xl font-black text-white flex items-center justify-center gap-2">
              <Award className="w-7 h-7 text-amber-400 animate-bounce" />
              <span>{winnerName}</span>
              <Award className="w-7 h-7 text-amber-400 animate-bounce" />
            </h2>
            <p className="text-sm font-bold text-emerald-400">
              {isArabic
                ? `مبروك عليك الفوز بـ ${winnerScore} نقاط!`
                : `Congratulations! Won with ${winnerScore} points!`}
            </p>
          </div>
        ) : (
          <div className="space-y-1 mb-4">
            <h2 className="text-2xl font-black text-white">
              {isArabic ? 'تعادل بين البطلين!' : 'Draw between champions!'}
            </h2>
            <p className="text-sm font-bold text-amber-400">
              {isArabic ? `النقاط متساوية (${p1Score} - ${p2Score})` : `Equal score (${p1Score} - ${p2Score})`}
            </p>
          </div>
        )}

        {/* Scores Table */}
        <div className="grid grid-cols-2 gap-3 mb-5 max-w-sm mx-auto">
          <div className={`p-3 rounded-2xl border ${p1Score >= p2Score ? 'bg-indigo-950/70 border-indigo-500/50' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="text-xs text-slate-400 font-bold">{player1Name}</div>
            <div className="text-2xl font-black text-white">{p1Score}</div>
          </div>
          <div className={`p-3 rounded-2xl border ${p2Score >= p1Score ? 'bg-indigo-950/70 border-indigo-500/50' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="text-xs text-slate-400 font-bold">{player2Name}</div>
            <div className="text-2xl font-black text-white">{p2Score}</div>
          </div>
        </div>

        {/* Action Buttons: نعاودوها & الإحصائيات & القائمة الرئيسية */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              id="btn-replay-game"
              onClick={onReplay}
              className="w-full sm:w-auto flex-1 h-14 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{isArabic ? 'نعاودوها (العب مجدداً)' : 'Play Again'}</span>
            </button>

            <button
              id="btn-win-main-menu"
              onClick={onMainMenu}
              className="w-full sm:w-auto flex-1 h-14 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-black text-base border border-slate-700 border-b-4 border-b-slate-950 active:border-b active:translate-y-1 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-5 h-5" />
              <span>{isArabic ? 'القائمة الرئيسية' : 'Main Menu'}</span>
            </button>
          </div>

          <button
            id="btn-win-view-stats"
            onClick={onOpenStatistics}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 font-bold text-sm border border-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>{isArabic ? 'عرض تسجيلات المباراة والإحصائيات 🎙️' : 'View Match Recordings & Stats 🎙️'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
