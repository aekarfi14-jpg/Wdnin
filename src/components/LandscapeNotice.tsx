import React, { useEffect, useState } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

interface LandscapeNoticeProps {
  lang: 'ar' | 'en';
}

export const LandscapeNotice: React.FC<LandscapeNoticeProps> = ({ lang }) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if height > width and max-width is mobile size
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || dismissed) return null;

  const isArabic = lang === 'ar';

  return (
    <div
      id="portrait-orientation-notice"
      className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white select-none"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center mb-4">
        <RotateCw className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>

      <h3 className="text-2xl font-black mb-2">
        {isArabic ? 'اقلب الهاتف أفقياً' : 'Rotate Phone to Landscape'}
      </h3>
      <p className="text-sm text-slate-300 max-w-xs mb-6 leading-relaxed">
        {isArabic
          ? 'صُممت لعبة ودنين لتُلعب أفقياً بثلاثة أقسام: اللاعب 1، المخرج، واللاعب 2.'
          : 'WDNIN is designed for landscape gameplay with 3 columns: Player 1, Director, and Player 2.'}
      </p>

      <button
        onClick={() => setDismissed(true)}
        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
      >
        {isArabic ? 'المتابعة على أي حال' : 'Continue Anyway'}
      </button>
    </div>
  );
};
