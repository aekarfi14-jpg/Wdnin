import React, { useState } from 'react';
import { Mic, RotateCcw, Sparkles, Settings, Smartphone } from 'lucide-react';
import { isAndroidNative, openAndroidAppSettings } from '../utils/nativePermission';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onRetry: () => Promise<void>;
  onEnableDemoMode: () => void;
  onClose: () => void;
  lang: 'ar' | 'en';
  isPermanentlyDenied?: boolean;
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  isOpen,
  onRetry,
  onEnableDemoMode,
  onClose,
  lang,
  isPermanentlyDenied = false,
}) => {
  const [retrying, setRetrying] = useState(false);
  const isArabic = lang === 'ar';
  const isNative = isAndroidNative();
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!isOpen) return null;

  const handleRetryClick = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const handleOpenSettingsClick = async () => {
    await openAndroidAppSettings();
  };

  return (
    <div
      id="mic-permission-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none"
    >
      <div className="relative max-w-md w-full bg-slate-900 border-2 border-indigo-500/80 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-200">
        {/* Android App Badge */}
        <div className="flex items-center justify-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold tracking-wide">
            <Smartphone className="w-3.5 h-3.5" />
            <span>WDNIN • لعبة ودنين</span>
          </div>
        </div>

        {/* Header with Mic Icon */}
        <div className="flex items-center justify-center mb-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Mic className="w-8 h-8 animate-pulse text-indigo-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white text-center mb-2">
          {isArabic ? 'إذن الميكروفون 🎙️' : 'Microphone Permission 🎙️'}
        </h2>

        {/* Message */}
        <p className="text-xs text-slate-300 text-center leading-relaxed mb-4">
          {isNative
            ? (isArabic
                ? 'اسمح للعبة باستخدام الميكروفون باش نقدروا نسجلوا الأصوات.'
                : 'Please allow the game to access your microphone so we can record your voice.')
            : (isArabic
                ? 'لعبة ودنين تحتاج لاستخدام الميكروفون لتسجيل أصوات اللاعبين وعكسها.'
                : 'WDNIN needs microphone access to record and reverse player voices.')}
        </p>

        {/* Instruction Card */}
        {isNative ? (
          isPermanentlyDenied && (
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 mb-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Settings className="w-4 h-4 shrink-0" />
                <span>{isArabic ? 'تفعيل الإذن من إعدادات الهاتف:' : 'Enable from device settings:'}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {isArabic
                  ? 'تم رفض الإذن سابقاً. اضغط على الزر أدناه لفتح إعدادات التطبيق، ثم فعّل إذن "الميكروفون" وارجع للعبة.'
                  : 'Permission was previously denied. Tap the button below to open App Settings, enable Microphone, and return to the game.'}
              </p>
            </div>
          )
        ) : (
          /* Browser instructions ONLY when not on native APK */
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-3.5 mb-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Mic className="w-4 h-4 shrink-0" />
              <span>{isArabic ? 'تفعيل الميكروفون:' : 'Enable microphone:'}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isArabic
                ? 'اضغط على زر السماح بالميكروفون أدناه ووافق على طلب إذن الصوت.'
                : 'Tap Allow Microphone below and accept the audio permission prompt.'}
            </p>
          </div>
        )}

        {/* Actions Grid */}
        <div className="space-y-2.5">
          {isPermanentlyDenied ? (
            <>
              <button
                id="btn-open-android-settings"
                onClick={handleOpenSettingsClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>{isArabic ? 'افتح إعدادات التطبيق' : 'Open App Settings'}</span>
              </button>
              <button
                id="btn-retry-mic-permission-android"
                onClick={handleRetryClick}
                disabled={retrying}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                <span>{isArabic ? 'تحقق من الإذن وإعادة المحاولة' : 'Check Permission & Retry'}</span>
              </button>
            </>
          ) : (
            /* Action 1: Standard Allow / Retry Permission */
            <button
              id="btn-retry-mic-permission"
              onClick={handleRetryClick}
              disabled={retrying}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
              <span>
                {retrying
                  ? (isArabic ? 'جاري طلب الإذن...' : 'Requesting permission...')
                  : (isArabic ? 'السماح بالميكروفون 🎙️' : 'Allow Microphone 🎙️')}
              </span>
            </button>
          )}

          {/* Action 2: Fallback Demo Voice Mode */}
          <button
            id="btn-enable-demo-mode"
            onClick={onEnableDemoMode}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isArabic ? 'المتابعة بوضع الصوت التجريبي (بدون ميكروفون) ✨' : 'Continue with Demo Voice Mode ✨'}</span>
          </button>

          {/* Action 3: Close/Dismiss */}
          <button
            id="btn-dismiss-mic-modal"
            onClick={onClose}
            className="w-full py-2 text-center text-slate-400 hover:text-slate-300 text-xs font-semibold"
          >
            {isArabic ? 'إلغاء والعودة' : 'Cancel'}
          </button>

          {/* Discreet full-screen link ONLY if trapped inside an iframe and not native */}
          {isInIframe && !isNative && currentUrl && (
            <div className="pt-1 text-center">
              <a
                id="link-open-standalone"
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-500 hover:text-indigo-400 underline decoration-dotted"
              >
                {isArabic ? 'فتح في شاشة مستقلة' : 'Open in separate view'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


