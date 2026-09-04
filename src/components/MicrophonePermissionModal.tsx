import React, { useState } from 'react';
import { MicOff, RotateCcw, ExternalLink, Sparkles, HelpCircle } from 'lucide-react';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onRetry: () => Promise<void>;
  onEnableDemoMode: () => void;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  isOpen,
  onRetry,
  onEnableDemoMode,
  onClose,
  lang,
}) => {
  const [retrying, setRetrying] = useState(false);
  const isArabic = lang === 'ar';

  if (!isOpen) return null;

  const handleRetryClick = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div
      id="mic-permission-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
    >
      <div className="relative max-w-md w-full bg-slate-900 border-2 border-rose-500 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-200">
        {/* Header with Icon */}
        <div className="flex items-center justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <MicOff className="w-7 h-7" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white text-center mb-2">
          {isArabic ? 'إذن الميكروفون مرفوض' : 'Microphone Access Denied'}
        </h2>

        {/* Message */}
        <p className="text-xs text-slate-300 text-center leading-relaxed mb-4">
          {isArabic
            ? 'لعبة ودنين تعتمد على تسجيل صوت اللاعب وعكسه. يرجى السماح بالوصول إلى الميكروفون في المتصفح للمتابعة.'
            : 'WDNIN requires microphone access to record and reverse player voices. Please allow microphone permissions to continue.'}
        </p>

        {/* Instructions Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 mb-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>{isArabic ? 'كيفية تفعيل الميكروفون:' : 'How to enable microphone:'}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
            <li>
              {isArabic
                ? 'اضغط على أيقونة القفل أو الإعدادات بجانب شريط العنوان في المتصفح.'
                : 'Click the lock or settings icon in your browser address bar.'}
            </li>
            <li>
              {isArabic
                ? 'غيّر إذن الميكروفون إلى "سماح" (Allow).'
                : 'Change Microphone permission to "Allow".'}
            </li>
            <li>
              {isArabic
                ? 'إذا كنت داخل نافذة مضمنة، افتح اللعبة في نافذة جديدة.'
                : 'If playing inside a frame, open the game in a new tab.'}
            </li>
          </ol>
        </div>

        {/* Actions Grid */}
        <div className="space-y-2.5">
          {/* Action 1: Retry Permission */}
          <button
            id="btn-retry-mic-permission"
            onClick={handleRetryClick}
            disabled={retrying}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            <span>
              {retrying
                ? (isArabic ? 'جاري طلب الإذن...' : 'Requesting access...')
                : (isArabic ? 'إعادة طلب إذن الميكروفون' : 'Try Again / Allow Mic')}
            </span>
          </button>

          {/* Action 2: Open in New Tab (Safe anchor link) */}
          {currentUrl && (
            <a
              id="link-open-in-new-tab"
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>{isArabic ? 'فتح في نافذة جديدة (يحل المشكلة تلقائياً)' : 'Open in New Tab (Fixes frame issues)'}</span>
            </a>
          )}

          {/* Action 3: Fallback Demo Voice Mode */}
          <button
            id="btn-enable-demo-mode"
            onClick={onEnableDemoMode}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 font-bold text-xs border border-amber-500/40 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isArabic ? 'المتابعة بوضع الصوت التجريبي (المحاكي)' : 'Continue with Demo Voice Mode'}</span>
          </button>

          {/* Action 4: Close/Dismiss */}
          <button
            id="btn-dismiss-mic-modal"
            onClick={onClose}
            className="w-full py-2 text-center text-slate-500 hover:text-slate-400 text-xs font-semibold"
          >
            {isArabic ? 'إلغاء والعودة' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
