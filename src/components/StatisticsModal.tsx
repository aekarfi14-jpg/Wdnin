import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Download,
  Trash2,
  Users,
  Mic,
  Headphones,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Sparkles,
  BarChart3,
  Search,
  Filter,
  Volume2,
  Frown,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StoredRecording,
  PlayerRecord,
  MatchSummary,
  getAllRecordings,
  getLeaderboards,
  getAllMatches,
  deleteRecording,
  clearAllStatsAndRecordings
} from '../utils/statsStorage';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isArabic = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'recordings' | 'leaderboard' | 'matches'>('recordings');

  // Data states
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [topGuesser, setTopGuesser] = useState<PlayerRecord | null>(null);
  const [mostStruggled, setMostStruggled] = useState<PlayerRecord | null>(null);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedMatchFilter, setSelectedMatchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio Playback state
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);

  // Load data when modal opens
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recs, boards, matchSummaries] = await Promise.all([
        getAllRecordings(),
        getLeaderboards(),
        getAllMatches()
      ]);
      setRecordings(recs);
      setPlayers(boards.players);
      setTopGuesser(boards.topGuesser);
      setMostStruggled(boards.mostStruggled);
      setMatches(matchSummaries);
    } catch (err) {
      console.error('Error loading stats data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      stopAudio();
    }
  }, [isOpen]);

  // Audio playback controller
  const stopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setCurrentPlayingId(null);
    setAudioCurrentTime(0);
    setAudioDuration(0);
  };

  const handlePlayRecording = (rec: StoredRecording) => {
    if (currentPlayingId === rec.id) {
      // Toggle pause/play
      if (audioElementRef.current) {
        if (audioElementRef.current.paused) {
          audioElementRef.current.play();
        } else {
          audioElementRef.current.pause();
        }
      }
      return;
    }

    // Stop current audio first
    stopAudio();

    // Create object URL from stored Blob
    const url = URL.createObjectURL(rec.audioBlob);
    activeBlobUrlRef.current = url;

    const audio = new Audio(url);
    audioElementRef.current = audio;
    setCurrentPlayingId(rec.id);

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration || rec.duration || 0);
    };

    audio.ontimeupdate = () => {
      setAudioCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      stopAudio();
    };

    audio.onerror = (e) => {
      console.warn('Playback error for audio blob:', e);
      stopAudio();
    };

    audio.play().catch((err) => {
      console.warn('Audio play request interrupted:', err);
      stopAudio();
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  const handleDownload = (rec: StoredRecording) => {
    const url = URL.createObjectURL(rec.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WDNIN_Match_${rec.matchNumber}_Round_${rec.roundNumber}_${rec.creatorName}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDeleteSingle = async (id: string) => {
    if (confirm(isArabic ? 'هل تريد حذف هذا التسجيل؟' : 'Delete this recording?')) {
      if (currentPlayingId === id) {
        stopAudio();
      }
      await deleteRecording(id);
      loadData();
    }
  };

  const handleClearAll = async () => {
    const msg = isArabic
      ? 'هل أنت متأكد من مسح جميع الإحصائيات والتسجيلات نهائياً؟ لا يمكن التراجع عن هذا الإجراء.'
      : 'Are you sure you want to permanently delete all statistics and recordings? This cannot be undone.';
    if (confirm(msg)) {
      stopAudio();
      await clearAllStatsAndRecordings();
      loadData();
    }
  };

  if (!isOpen) return null;

  // Filter recordings
  const filteredRecordings = recordings.filter((rec) => {
    // Match filter
    if (selectedMatchFilter !== 'all' && rec.matchNumber.toString() !== selectedMatchFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCreator = rec.creatorName.toLowerCase().includes(q);
      const matchGuesser = rec.guesserName.toLowerCase().includes(q);
      const matchMatch = `مباراة ${rec.matchNumber}`.includes(q) || `match ${rec.matchNumber}`.includes(q);
      if (!matchCreator && !matchGuesser && !matchMatch) return false;
    }
    return true;
  });

  // Unique match numbers for filter dropdown
  const uniqueMatchNumbers = Array.from(new Set(recordings.map((r) => Number(r.matchNumber) || 0))).sort((a: number, b: number) => b - a);

  return (
    <div
      id="modal-statistics"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-w-2xl w-full h-[90vh] max-h-[800px] flex flex-col bg-gradient-to-b from-[#111928] via-[#0c121d] to-[#070b13] border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top Metallic Gold Highlight Line */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{isArabic ? 'الإحصائيات وأرشيف التسجيلات' : 'Statistics & Audio Archive'}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {recordings.length} {isArabic ? 'تسجيل' : 'recordings'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {isArabic
                  ? 'حفظ دائم للتسجيلات الصوتية وتصنيف أبطال التخمين'
                  : 'Permanent audio storage & player leaderboard'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-statistics"
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/90 bg-slate-950/40 px-3 py-2 shrink-0 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Tab 1: Recordings */}
            <button
              id="tab-btn-recordings"
              onClick={() => setActiveTab('recordings')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'recordings'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isArabic ? 'التسجيلات الأصلية' : 'Recordings'}</span>
            </button>

            {/* Tab 2: Leaderboard */}
            <button
              id="tab-btn-leaderboard"
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>{isArabic ? 'أبطال اللعبة والمخمنين' : 'Leaderboard'}</span>
            </button>

            {/* Tab 3: Matches */}
            <button
              id="tab-btn-matches"
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'matches'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{isArabic ? 'سجل المباريات' : 'Matches'}</span>
            </button>
          </div>

          {/* Reset All Button */}
          {recordings.length > 0 && (
            <button
              id="btn-clear-stats"
              onClick={handleClearAll}
              className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title={isArabic ? 'مسح جميع البيانات' : 'Clear all data'}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">{isArabic ? 'مسح الكل' : 'Clear All'}</span>
            </button>
          )}
        </div>

        {/* Tab Content Zone */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              <RotateCcw className="w-5 h-5 animate-spin mr-2" />
              <span>{isArabic ? 'جاري تحميل البيانات...' : 'Loading records...'}</span>
            </div>
          ) : activeTab === 'recordings' ? (
            /* ======================================================== */
            /* TAB 1: ALL ORIGINAL RECORDINGS WITH PLAYABLE AUDIO & MATCH # */
            /* ======================================================== */
            <div className="space-y-3">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute top-2.5 right-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isArabic ? 'ابحث باسم اللاعب أو المباراة...' : 'Search player or match...'}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 pr-9 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Match Filter */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs text-slate-400 font-bold shrink-0">
                    {isArabic ? 'المباراة:' : 'Match:'}
                  </span>
                  <select
                    value={selectedMatchFilter}
                    onChange={(e) => setSelectedMatchFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 text-amber-300 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer flex-1 sm:flex-initial"
                  >
                    <option value="all">{isArabic ? 'جميع المباريات' : 'All Matches'}</option>
                    {uniqueMatchNumbers.map((num) => (
                      <option key={num} value={num.toString()}>
                        {isArabic ? `مباراة #${num}` : `Match #${num}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recordings List */}
              {filteredRecordings.length === 0 ? (
                <div className="py-12 px-4 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                  <Volume2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-black text-slate-300 mb-1">
                    {isArabic ? 'لا توجد تسجيلات حتى الآن' : 'No recordings saved yet'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {isArabic
                      ? 'ابدأ مباراة والعب جولة لتسجيل الجمل الأصلية بصوتك، وسيتم حفظها هنا تلقائياً لتستمع إليها متى شئت!'
                      : 'Play a match and complete a round to save voice recordings here permanently!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredRecordings.map((rec) => {
                    const isPlayingThis = currentPlayingId === rec.id;
                    const dateStr = new Date(rec.timestamp).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={rec.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isPlayingThis
                            ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-950/40'
                            : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        {/* Top Info Strip */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Match Number Badge */}
                            <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40 font-black text-[11px] shadow-sm">
                              {isArabic ? `مباراة #${rec.matchNumber}` : `Match #${rec.matchNumber}`}
                            </span>

                            {/* Round Badge */}
                            <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-bold text-[11px]">
                              {isArabic ? `الجولة ${rec.roundNumber}` : `Round ${rec.roundNumber}`}
                            </span>

                            {/* Verdict Badge */}
                            {rec.success ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-black text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>{isArabic ? 'عرفها ✅' : 'Guessed ✅'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-950/60 text-red-300 border border-red-500/40 font-black text-[11px]">
                                <XCircle className="w-3 h-3 text-red-400" />
                                <span>{isArabic ? 'ما عرفهاش ❌' : 'Missed ❌'}</span>
                              </span>
                            )}
                          </div>

                          {/* Time / Duration */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{rec.duration}s</span>
                            <span className="text-slate-600">•</span>
                            <span className="hidden sm:inline">{dateStr}</span>
                          </div>
                        </div>

                        {/* Players Line: Creator (سجلها) and Guesser (قلدها/خمنها) */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-1.5 px-2 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-slate-400 text-[11px]">
                              {isArabic ? 'صاحب التسجيل:' : 'Creator:'}
                            </span>
                            <strong className="text-amber-200 font-bold truncate">{rec.creatorName}</strong>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <Headphones className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="text-slate-400 text-[11px]">
                              {isArabic ? 'المخمن/المستمع:' : 'Guesser:'}
                            </span>
                            <strong className="text-sky-200 font-bold truncate">{rec.guesserName}</strong>
                          </div>
                        </div>

                        {/* Direct Playback Audio Controls */}
                        <div className="flex items-center gap-2 pt-1">
                          {/* Play / Pause Main Trigger */}
                          <button
                            id={`btn-play-rec-${rec.id}`}
                            onClick={() => handlePlayRecording(rec)}
                            className={`h-9 px-4 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                              isPlayingThis
                                ? 'bg-amber-400 text-slate-950 shadow-md hover:bg-amber-300'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isPlayingThis ? (
                              <>
                                <Pause className="w-4 h-4 fill-current" />
                                <span>{isArabic ? 'إيقاف' : 'Pause'}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-current" />
                                <span>{isArabic ? 'تشغيل التسجيل الأصلي' : 'Play Audio'}</span>
                              </>
                            )}
                          </button>

                          {/* Progress Scrubber (when playing) */}
                          {isPlayingThis && (
                            <div className="flex-1 flex items-center gap-2 px-2">
                              <input
                                type="range"
                                min={0}
                                max={audioDuration || rec.duration || 1}
                                step={0.05}
                                value={audioCurrentTime}
                                onChange={handleSeek}
                                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                              />
                              <span className="text-[11px] font-mono text-amber-300 tabular-nums shrink-0">
                                {audioCurrentTime.toFixed(1)}s / {(audioDuration || rec.duration).toFixed(1)}s
                              </span>
                            </div>
                          )}

                          {/* Secondary Utilities: Download & Delete */}
                          <div className="mr-auto flex items-center gap-1">
                            <button
                              onClick={() => handleDownload(rec)}
                              className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-all cursor-pointer"
                              title={isArabic ? 'تحميل التسجيل الصوتي' : 'Download audio'}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteSingle(rec.id)}
                              className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-red-950/80 text-slate-500 hover:text-red-400 border border-slate-800 flex items-center justify-center transition-all cursor-pointer"
                              title={isArabic ? 'حذف هذا التسجيل' : 'Delete recording'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'leaderboard' ? (
            /* ======================================================== */
            /* TAB 2: LEADERBOARD & SAVED PLAYERS ROSTER                 */
            /* ======================================================== */
            <div className="space-y-4">
              {/* Highlight Cards: أكثر لاعب عرفها & أكثر واحد ميعرفش */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Top Guesser Card (أكثر لاعب عرفها) */}
                <div className="bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-black text-amber-300">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isArabic ? 'أكثر لاعب عرفها 🏆' : 'Best Guesser 🏆'}</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">
                      {isArabic ? 'ملك التخمين' : 'Master Guesser'}
                    </span>
                  </div>

                  {topGuesser ? (
                    <div className="space-y-2 mt-3">
                      <div className="text-2xl font-black text-white truncate" title={topGuesser.name}>
                        {topGuesser.name}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">
                            {isArabic ? 'عرفها بنجاح:' : 'Guessed:'}
                          </span>
                          <strong className="text-emerald-400 font-black text-base">
                            {topGuesser.correctGuesses} {isArabic ? 'مرات' : 'times'}
                          </strong>
                        </div>
                        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">
                            {isArabic ? 'نسبة النجاح:' : 'Accuracy:'}
                          </span>
                          <strong className="text-amber-300 font-black text-base">
                            {topGuesser.roundsAsGuesser > 0
                              ? `${Math.round((topGuesser.correctGuesses / topGuesser.roundsAsGuesser) * 100)}%`
                              : '0%'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic py-4 text-center">
                      {isArabic ? 'لم يتم لعب أي جولات بعد' : 'No rounds played yet'}
                    </div>
                  )}
                </div>

                {/* 2. Most Struggled Card (أكثر واحد ميعرفش) */}
                <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/50 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-[11px] font-black text-purple-300">
                      <Frown className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isArabic ? 'أكثر واحد ميعرفش 🤔' : 'Most Struggled 🤔'}</span>
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold">
                      {isArabic ? 'ضحية العكس' : 'The Struggler'}
                    </span>
                  </div>

                  {mostStruggled ? (
                    <div className="space-y-2 mt-3">
                      <div className="text-2xl font-black text-white truncate" title={mostStruggled.name}>
                        {mostStruggled.name}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">
                            {isArabic ? 'معرفهاش (أخطأ):' : 'Missed:'}
                          </span>
                          <strong className="text-red-400 font-black text-base">
                            {mostStruggled.missedGuesses} {isArabic ? 'مرات' : 'times'}
                          </strong>
                        </div>
                        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">
                            {isArabic ? 'إجمالي المحاولات:' : 'Attempts:'}
                          </span>
                          <strong className="text-purple-300 font-black text-base">
                            {mostStruggled.roundsAsGuesser} {isArabic ? 'جولة' : 'rounds'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic py-4 text-center">
                      {isArabic ? 'لم يتم تسجيل أي إخفاق بعد' : 'No misses recorded yet'}
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Saved Players Roster (قائمة كل اللاعبين المحفوظين) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? 'قائمة جميع اللاعبين المحفوظين' : 'Saved Players Roster'}</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {players.length} {isArabic ? 'لاعب' : 'players'}
                  </span>
                </div>

                {players.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-6">
                    {isArabic ? 'لا توجد بيانات لاعبين محفوظة بعد.' : 'No player records stored yet.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                          <th className="py-2 px-2 text-center w-10">#</th>
                          <th className="py-2 px-2">{isArabic ? 'الاسم' : 'Player'}</th>
                          <th className="py-2 px-2 text-center">{isArabic ? 'المباريات' : 'Matches'}</th>
                          <th className="py-2 px-2 text-center text-emerald-400">{isArabic ? 'عرفها' : 'Guessed'}</th>
                          <th className="py-2 px-2 text-center text-red-400">{isArabic ? 'معرفهاش' : 'Missed'}</th>
                          <th className="py-2 px-2 text-center text-amber-300">{isArabic ? 'النسبة' : 'Rate'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {players.map((p, idx) => {
                          const rate = p.roundsAsGuesser > 0
                            ? Math.round((p.correctGuesses / p.roundsAsGuesser) * 100)
                            : 0;

                          return (
                            <tr key={p.name} className="hover:bg-slate-900/50 transition-colors">
                              <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                              </td>
                              <td className="py-2.5 px-2 font-black text-white">
                                <span className="truncate block max-w-[140px]" title={p.name}>
                                  {p.name}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-slate-300">
                                {p.matchesPlayed}
                              </td>
                              <td className="py-2.5 px-2 text-center font-black text-emerald-400">
                                {p.correctGuesses}
                              </td>
                              <td className="py-2.5 px-2 text-center font-black text-red-400">
                                {p.missedGuesses}
                              </td>
                              <td className="py-2.5 px-2 text-center font-black text-amber-300">
                                {rate}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* TAB 3: MATCH HISTORY (سجل المباريات)                     */
            /* ======================================================== */
            <div className="space-y-2.5">
              {matches.length === 0 ? (
                <div className="py-12 px-4 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-black text-slate-300 mb-1">
                    {isArabic ? 'لا توجد مباريات مكتملة بعد' : 'No completed matches yet'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {isArabic
                      ? 'عند إنهاء أي مباراة بين لاعبين ستظهر نتائجها النهائية هنا مع إمكانية استعراض كل تسجيلاتها.'
                      : 'Completed matches will appear here with final scores and voice archives.'}
                  </p>
                </div>
              ) : (
                matches.map((m) => {
                  const dateStr = new Date(m.timestamp).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={m.matchNumber}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs">
                            {isArabic ? `مباراة #${m.matchNumber}` : `Match #${m.matchNumber}`}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {m.roundsCount} {isArabic ? 'جولات' : 'rounds'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{dateStr}</span>
                      </div>

                      {/* Head to Head Scores */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300 truncate">{m.player1Name}</span>
                          <span className="text-base font-black text-amber-400 tabular-nums">{m.player1Score}</span>
                        </div>
                        <div className="flex items-center justify-between border-r border-slate-800 pr-2">
                          <span className="text-xs font-bold text-slate-300 truncate">{m.player2Name}</span>
                          <span className="text-base font-black text-amber-400 tabular-nums">{m.player2Score}</span>
                        </div>
                      </div>

                      {/* Winner Banner */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-slate-400">{isArabic ? 'النتيجة:' : 'Outcome:'}</span>
                          <strong className="text-white font-black">
                            {m.winnerName === 'tie'
                              ? (isArabic ? 'تعادل بين اللاعبين' : 'Draw')
                              : (isArabic ? `فوز ${m.winnerName}` : `${m.winnerName} won`)}
                          </strong>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedMatchFilter(m.matchNumber.toString());
                            setActiveTab('recordings');
                          }}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isArabic ? 'عرض تسجيلات المباراة' : 'View recordings'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
