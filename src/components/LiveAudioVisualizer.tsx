import React, { useRef, useEffect } from 'react';
import { Mic, Radio, Volume2 } from 'lucide-react';

interface LiveAudioVisualizerProps {
  volume: number; // 0 to 1
  timeDomain: number[]; // -1 to 1 points
  frequencies: number[]; // 0 to 1 bars
  playerName: string;
  remainingSeconds?: number;
  maxSeconds?: number;
  compact?: boolean;
  lang?: 'ar' | 'en';
}

export const LiveAudioVisualizer: React.FC<LiveAudioVisualizerProps> = ({
  volume,
  timeDomain,
  frequencies,
  playerName,
  remainingSeconds,
  maxSeconds = 20,
  compact = false,
  lang = 'ar',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isArabic = lang === 'ar';

  // Smooth canvas rendering for the live vocal oscilloscope wave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const midY = height / 2;
    const points = timeDomain && timeDomain.length > 0 ? timeDomain : [0];

    // Background subtle acoustic center guide line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Secondary harmonic wave (subtle shadow wave)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.22)';
    ctx.lineWidth = compact ? 1.5 : 2;

    const step = width / (points.length - 1 || 1);
    for (let i = 0; i < points.length; i++) {
      const sample = points[i];
      // smooth bell curve window to taper edges at left & right
      const window = Math.sin((i / (points.length - 1)) * Math.PI);
      const amp = (sample * 0.75 + Math.sin(i * 0.4) * 0.08 * (volume + 0.1)) * (height * 0.42) * window;
      const x = i * step;
      const y = midY + amp * 0.8;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * step;
        const prevSample = points[i - 1];
        const prevWindow = Math.sin(((i - 1) / (points.length - 1)) * Math.PI);
        const prevAmp = (prevSample * 0.75 + Math.sin((i - 1) * 0.4) * 0.08 * (volume + 0.1)) * (height * 0.42) * prevWindow;
        const prevY = midY + prevAmp * 0.8;
        const cx = (prevX + x) / 2;
        const cy = (prevY + y) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cx, cy);
      }
    }
    ctx.stroke();

    // Primary vibrant studio audio wave (Refined Champagne Gold & Warm Amber)
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#f59e0b'); // amber-500
    gradient.addColorStop(0.5, '#fbbf24'); // amber-400
    gradient.addColorStop(1, '#f59e0b');

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = compact ? 2 : 2.75;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < points.length; i++) {
      const sample = points[i];
      const window = Math.sin((i / (points.length - 1)) * Math.PI);
      // Amplify voice modulation
      const voiceAmp = (sample * 1.35 + Math.sin(Date.now() * 0.005 + i * 0.3) * 0.05 * (volume + 0.05)) * (height * 0.44) * window;
      const x = i * step;
      const y = midY + voiceAmp;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * step;
        const prevSample = points[i - 1];
        const prevWindow = Math.sin(((i - 1) / (points.length - 1)) * Math.PI);
        const prevAmp = (prevSample * 1.35 + Math.sin(Date.now() * 0.005 + (i - 1) * 0.3) * 0.05 * (volume + 0.05)) * (height * 0.44) * prevWindow;
        const prevY = midY + prevAmp;
        const cx = (prevX + x) / 2;
        const cy = (prevY + y) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cx, cy);
      }
    }
    ctx.stroke();
  }, [timeDomain, volume, compact]);

  // Decibel level segments calculation (8 discrete luxury level segments)
  const activeSegments = Math.round(volume * 8);

  return (
    <div
      className={`w-full flex flex-col items-center justify-between transition-all select-none ${
        compact
          ? 'py-2 px-3 bg-slate-900/90 border border-amber-500/25 rounded-2xl shadow-lg'
          : 'py-3.5 px-4 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-amber-500/30 rounded-3xl shadow-xl'
      }`}
    >
      {/* Top Header: Recording Studio Badge + Player Label + Timer */}
      <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Studio Record Tally Light */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 font-black text-[10px] tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE REC</span>
          </div>

          <span className="font-bold text-slate-300 text-xs truncate max-w-[120px]">
            {playerName}
          </span>
        </div>

        {remainingSeconds !== undefined && (
          <div className="flex items-center gap-1.5 font-mono text-xs font-black text-amber-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 font-sans font-bold">
              {isArabic ? 'متبقي:' : 'Left:'}
            </span>
            <span>{Math.max(0, remainingSeconds)}s</span>
          </div>
        )}
      </div>

      {/* Center Oscilloscope Waveform Canvas */}
      <div className="relative w-full my-2 flex items-center justify-center bg-slate-950/90 rounded-2xl border border-slate-800/90 p-1.5 overflow-hidden">
        {/* Subtle grid lines for high-end studio audio equipment feel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <canvas
          ref={canvasRef}
          width={compact ? 240 : 340}
          height={compact ? 64 : 88}
          className="w-full h-auto max-h-[88px] block relative z-10"
        />

        {/* Dynamic Voice Intensity Aura */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-150 rounded-2xl"
          style={{
            background: `radial-gradient(ellipse at center, rgba(245, 158, 11, ${volume * 0.18}) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Bottom Spectrum & Decibel Meter */}
      <div className="w-full flex items-center justify-between gap-3 pt-1">
        {/* Real Frequency Spectrum Bars (18-20 bands) */}
        <div className="flex items-end gap-1 flex-1 h-6 px-2 py-0.5 bg-slate-950/70 rounded-xl border border-slate-800">
          {(frequencies && frequencies.length > 0
            ? frequencies.slice(0, 18)
            : [0.15, 0.4, 0.7, 0.5, 0.9, 0.65, 0.8, 0.45, 0.6, 0.75, 0.35, 0.55, 0.8, 0.4, 0.65, 0.3, 0.5, 0.2]
          ).map((val, idx) => {
            const barHeight = Math.max(15, Math.min(100, val * 100));
            return (
              <div
                key={idx}
                className="flex-1 rounded-full transition-all duration-75"
                style={{
                  height: `${barHeight}%`,
                  background:
                    idx < 12
                      ? 'linear-gradient(to top, #d97706, #fbbf24)'
                      : idx < 15
                      ? 'linear-gradient(to top, #ea580c, #f97316)'
                      : 'linear-gradient(to top, #dc2626, #ef4444)',
                  opacity: 0.85 + val * 0.15,
                }}
              />
            );
          })}
        </div>

        {/* 8-Segment Audio Level Meter */}
        <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-950/70 rounded-xl border border-slate-800 shrink-0">
          <Volume2 className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((seg) => {
            const isLit = seg < activeSegments;
            const segColor =
              seg < 5
                ? isLit
                  ? 'bg-emerald-400 shadow-sm'
                  : 'bg-emerald-950/50'
                : seg < 7
                ? isLit
                  ? 'bg-amber-400 shadow-sm'
                  : 'bg-amber-950/50'
                : isLit
                ? 'bg-rose-500 shadow-sm'
                : 'bg-rose-950/50';

            return (
              <div
                key={seg}
                className={`w-1.5 h-3 rounded-xs transition-colors duration-75 ${segColor}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
