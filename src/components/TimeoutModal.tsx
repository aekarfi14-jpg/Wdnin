import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface TimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const TimeoutModal: React.FC<TimeoutModalProps> = ({ isOpen, onClose, lang }) => {
  const isArabic = lang === 'ar';

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="timeout-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-sm w-full bg-slate-900 border-4 border-red-600 rounded-2xl overflow-hidden shadow-2xl p-5 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black bg-red-600 text-white shadow-lg">
              <AlertCircle className="w-4 h-4" />
              {isArabic ? 'توقف!' : 'Time Up!'}
            </span>
          </div>

          {/* Meme Image: stop.jpg */}
          <div className="w-52 h-44 mx-auto rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl mb-3">
            <img
              src="/assets/images/stop.jpg"
              alt="stop.jpg"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-3xl font-black text-red-500 mb-1">
            {isArabic ? 'توقف' : 'STOP'}
          </h2>
          <p className="text-sm font-bold text-slate-300">
            {isArabic
              ? 'وصلت للحد الأقصى للتسجيل (20 ثانية)!'
              : 'Reached maximum recording limit (20s)!'}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
