import React, { useEffect, useState } from 'react';
import { X, Headphones, Send, QrCode, CheckCircle2, Copy, Mail, Smartphone, ShieldCheck, ExternalLink, Gamepad2, Download, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';

interface ContactQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const ContactQRModal: React.FC<ContactQRModalProps> = ({ isOpen, onClose, lang }) => {
  const isArabic = lang === 'ar';
  const qrTarget = 'https://cdn.phototourl.com/free/2026-09-03-27d0b9cf-f4b9-478d-965e-475b04d812b2.jpg';
  const similarGamesUrl = 'https://aekarfi14-jpg.github.io/my-app-releases/';

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'qr'>('form');

  // Support Form State
  const [category, setCategory] = useState<string>('suggestion');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedSimilarGames, setCopiedSimilarGames] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(qrTarget, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketNum = Math.floor(10000 + Math.random() * 90000);
      setSubmittedTicket(`WDN-${ticketNum}`);
      setMessage('');
    }, 600);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@wdnin.dz');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopySimilarGames = () => {
    navigator.clipboard.writeText(similarGamesUrl);
    setCopiedSimilarGames(true);
    setTimeout(() => setCopiedSimilarGames(false), 2000);
  };

  return (
    <div
      id="contact-support-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-slate-900 border-2 border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl p-5 md:p-6 text-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-support"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700 active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isArabic ? 'مركز الدعم الفني والملاحظات' : 'Customer Support & Feedback'}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isArabic ? 'خدمة اللاعبين الرسمية • إصدار أندرويد v1.0.4' : 'Official Player Support • Android v1.0.4'}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-4">
          <button
            id="tab-support-form"
            onClick={() => setActiveTab('form')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إرسال ملاحظة أو بلاغ' : 'Send Ticket / Report'}</span>
          </button>
          <button
            id="tab-support-qr"
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isArabic ? 'رمز الدعم المباشر' : 'Direct Support QR'}</span>
          </button>
        </div>

        {/* Tab 1: Interactive Support & Feedback Form */}
        {activeTab === 'form' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Featured Link Card: Download Similar Games / تحميل ألعاب مشابهة (بعيداً عن QR) */}
            <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-indigo-950/40 border-2 border-amber-500/45 rounded-2xl p-3 sm:p-3.5 shadow-xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                      <span>{isArabic ? 'تحميل ألعاب وتطبيقات مشابهة' : 'Download Similar Games & Apps'}</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      {isArabic
                        ? 'صفحة رسمية لتحميل أحدث الألعاب الترفيهية والتطبيقات المشابهة'
                        : 'Direct page to download our latest games and similar entertainment apps'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Direct Open + Copy Link */}
              <div className="flex items-center gap-2 pt-0.5">
                <a
                  id="btn-link-similar-games"
                  href={similarGamesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm border-b-2 border-amber-900 active:border-b-0 active:translate-y-0.5 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>{isArabic ? 'تحميل ألعاب مشابهة (فتح الرابط)' : 'Download Similar Games'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950 opacity-80" />
                </a>

                <button
                  type="button"
                  id="btn-copy-similar-games"
                  onClick={handleCopySimilarGames}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                  title={isArabic ? 'نسخ رابط التحميل' : 'Copy link'}
                >
                  {copiedSimilarGames ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-black">{isArabic ? 'تم النسخ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs">{isArabic ? 'نسخ' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {submittedTicket ? (
              <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-2xl p-5 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-black text-white">
                  {isArabic ? 'تم استلام ملاحظتك بنجاح!' : 'Your feedback was submitted!'}
                </h4>
                <p className="text-xs text-slate-300">
                  {isArabic
                    ? `رقم التذكرة المرجعي: ${submittedTicket}. نقدّر مساعدتك في تحسين تجربة لعبة ودنين.`
                    : `Ticket Reference: ${submittedTicket}. Thank you for helping improve WDNIN.`}
                </p>
                <button
                  onClick={() => setSubmittedTicket(null)}
                  className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all"
                >
                  {isArabic ? 'إرسال ملاحظة أخرى' : 'Submit Another Note'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSupport} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {isArabic ? 'نوع الطلب أو الملاحظة' : 'Request Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="suggestion">{isArabic ? '💡 اقتراح لتحسين اللعبة' : '💡 Feature Suggestion'}</option>
                    <option value="audio_issue">{isArabic ? '🎤 مشكلة في تسجيل أو وضوح الصوت' : '🎤 Audio / Recording Issue'}</option>
                    <option value="bug">{isArabic ? '⚙️ بلاغ عن خلل فني أو تقني' : '⚙️ Technical Bug Report'}</option>
                    <option value="other">{isArabic ? '💬 استفسار عام' : '💬 General Inquiry'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {isArabic ? 'تفاصيل الملاحظة أو الاستفسار' : 'Message Details'}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isArabic
                        ? 'اكتب ملاحظتك أو الصعوبة التي واجهتها أثناء اللعب...'
                        : 'Describe your feedback, suggestion, or issue...'
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none"
                    required
                  />
                </div>

                {/* Submit button with tactile feel */}
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm border-b-4 transition-all flex items-center justify-center gap-2 ${
                    message.trim() && !isSubmitting
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-800 active:border-b-0 active:translate-y-1 shadow-lg'
                      : 'bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (isArabic ? 'جاري الإرسال...' : 'Sending...')
                      : (isArabic ? 'إرسال إلى فريق الدعم' : 'Submit Support Ticket')}
                  </span>
                </button>
              </form>
            )}

            {/* Direct contact footnote */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>support@wdnin.dz</span>
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedEmail ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ البريد' : 'Copy')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Direct Support QR Code */}
        {activeTab === 'qr' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-2">
            <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Official Support QR" className="w-44 h-44 rounded-lg" />
              ) : (
                <div className="w-44 h-44 bg-slate-100 flex items-center justify-center rounded-lg text-slate-500 text-xs">
                  Loading QR...
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">
                {isArabic ? 'رمز الدعم الفني المباشر' : 'Direct Support QR Code'}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {isArabic
                  ? 'امسح الرمز بكاميرا هاتفك للوصول المباشر لقناة الدعم والتحديثات الرسمية للعبة.'
                  : 'Scan with your phone camera to access official support and updates.'}
              </p>
            </div>

            {/* Direct Link Button Under QR taking to the exact same result */}
            <a
              id="btn-direct-link-from-qr"
              href={qrTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-xs py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm shadow-xl flex items-center justify-center gap-2 border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-slate-950" />
              <span>{isArabic ? 'انتقال مباشر إلى الرابط (فتح فوري)' : 'Direct Link (Open Instantly)'}</span>
            </a>

            <div className="w-full pt-2 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>{isArabic ? 'تطبيق WDNIN — تجربة أندرويد مستقلة' : 'WDNIN — Standalone Android Experience'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
