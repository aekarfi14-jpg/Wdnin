import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, ActivePlayer, GameSettings, AudioRecording } from './types';
import { AudioEngine, LiveAudioData } from './utils/audioEngine';
import { getRandomSuccessPhrase, getRandomFailPhrase } from './utils/algerianPhrases';
import { DirectorHub } from './components/DirectorHub';
import { MainMenu } from './components/MainMenu';
import { GameSetupScreen } from './components/GameSetupScreen';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { ContactQRModal } from './components/ContactQRModal';
import { GuessFeedbackModal } from './components/GuessFeedbackModal';
import { TimeoutModal } from './components/TimeoutModal';
import { WinModal } from './components/WinModal';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import { StatisticsModal } from './components/StatisticsModal';
import { saveRoundAudioAndStats, saveMatchFinish, getNextMatchNumber } from './utils/statsStorage';
import { isAndroidNative, checkAndroidMicPermission, requestAndroidMicPermission } from './utils/nativePermission';
import { Home, Award, Headphones, BarChart3 } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  player1Name: 'يونس',
  player2Name: 'محمد',
  roundsCount: 5,
  timeLimit: 20,
  allowedListens: 1,
  allowSecondAttempt: false,
  bgMusicEnabled: true,
  memeSfxEnabled: true,
  musicVolume: 0.4,
  sfxVolume: 0.8,
  language: 'ar',
};

const STORAGE_KEY = 'wdnin_game_settings_v1';

export default function App() {
  // Load persistent settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Main State Machine
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [creatorPlayer, setCreatorPlayer] = useState<ActivePlayer>('P1');
  const [guesserPlayer, setGuesserPlayer] = useState<ActivePlayer>('P2');
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);

  // Audio & Recording State
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [liveAudioData, setLiveAudioData] = useState<LiveAudioData | undefined>(undefined);
  const [p1Audio, setP1Audio] = useState<AudioRecording | null>(null);
  const [p2Audio, setP2Audio] = useState<AudioRecording | null>(null);
  const [listenCount, setListenCount] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isP2RecordingActive, setIsP2RecordingActive] = useState<boolean>(false);

  // Modal Controls
  const [rulesOpen, setRulesOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [contactOpen, setContactOpen] = useState<boolean>(false);
  const [guessFeedbackOpen, setGuessFeedbackOpen] = useState<boolean>(false);
  const [timeoutModalOpen, setTimeoutModalOpen] = useState<boolean>(false);
  const [winModalOpen, setWinModalOpen] = useState<boolean>(false);
  const [statisticsOpen, setStatisticsOpen] = useState<boolean>(false);
  const [currentMatchNumber, setCurrentMatchNumber] = useState<number>(1);
  const [micPermissionModalOpen, setMicPermissionModalOpen] = useState<boolean>(false);
  const [isPermanentlyDenied, setIsPermanentlyDenied] = useState<boolean>(false);
  const [pendingPlayerRecording, setPendingPlayerRecording] = useState<'P1' | 'P2' | null>(null);
  const [lastGuessSuccess, setLastGuessSuccess] = useState<boolean>(false);
  const [lastGuessPhrase, setLastGuessPhrase] = useState<string>('');

  // Audio Engine Instance
  const audioEngine = useRef(AudioEngine.getInstance()).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoresRef = useRef<{ p1: number; p2: number }>({ p1: 0, p2: 0 });

  // Sync settings to engine and localStorage
  useEffect(() => {
    audioEngine.updateSettings(
      settings.bgMusicEnabled,
      settings.memeSfxEnabled,
      settings.musicVolume,
      settings.sfxVolume
    );
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings, audioEngine]);

  // Handle ambient background music: strictly Main Menu only, stops automatically during gameplay
  useEffect(() => {
    if (gameState === 'MAIN_MENU' || gameState === 'GAME_SETUP') {
      audioEngine.playMusic('Misic00.mp3');
    } else {
      // Gameplay requires clear audio recording and listening - stop music completely
      audioEngine.stopMusic();
    }
  }, [gameState, audioEngine]);

  // Load active match number on startup
  useEffect(() => {
    getNextMatchNumber()
      .then((num) => setCurrentMatchNumber(num))
      .catch(() => {});
  }, []);

  // Timer interval cleanup
  const clearRecordingTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // --- Handlers ---
  // Transition to dedicated Game Setup Page after clicking Start Game on Main Menu
  const handleOpenGameSetup = async () => {
    await audioEngine.playSfx('mrhb-byk.mp3');
    setGameState('GAME_SETUP');
  };

  // Launch the match after configuring names/rounds in GameSetupScreen
  const handleLaunchMatch = async (updatedSettings: GameSettings) => {
    setSettings(updatedSettings);
    // Determine accurate match number
    try {
      const nextNum = await getNextMatchNumber();
      setCurrentMatchNumber(nextNum);
    } catch {}

    await audioEngine.playSfx('skyviewray-lets-go.mp3');
    setCurrentRound(1);
    setCreatorPlayer('P1');
    setGuesserPlayer('P2');
    setP1Score(0);
    setP2Score(0);
    scoresRef.current = { p1: 0, p2: 0 };
    setP1Audio(null);
    setP2Audio(null);
    setListenCount(0);
    setIsPlayingAudio(false);
    setIsP2RecordingActive(false);
    setGameState('ROUND_START');
  };

  const handleBackToMenuFromSetup = () => {
    setGameState('MAIN_MENU');
  };

  const handleOpenRules = async () => {
    setRulesOpen(true);
    await audioEngine.playSfx('mrhb-byk.mp3');
  };

  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  // STEP 2: Player 1 Recording
  const handleStartRecordingP1 = async () => {
    try {
      if (isAndroidNative()) {
        const perm = await requestAndroidMicPermission();
        if (perm.permission !== 'granted') {
          setIsPermanentlyDenied(perm.isPermanentlyDenied);
          setPendingPlayerRecording('P1');
          setMicPermissionModalOpen(true);
          return;
        }
      }

      await audioEngine.playSfx('quack_5.mp3');
      setRecordingSeconds(0);
      setGameState('PLAYER_1_RECORDING');

      await audioEngine.startRecording(
        (vol) => {
          setVolumeLevel(vol);
        },
        (liveData) => {
          setLiveAudioData(liveData);
        }
      );

      clearRecordingTimer();
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= settings.timeLimit) {
            handleTimeoutStopP1();
          }
          return next;
        });
      }, 1000);
    } catch (err: unknown) {
      console.warn('Microphone permission or hardware error:', err);
      clearRecordingTimer();
      setVolumeLevel(0);
      setGameState('ROUND_START');
      setPendingPlayerRecording('P1');
      if (err && typeof err === 'object' && 'isPermanentlyDenied' in err) {
        setIsPermanentlyDenied(Boolean((err as { isPermanentlyDenied?: boolean }).isPermanentlyDenied));
      }
      setMicPermissionModalOpen(true);
    }
  };

  const handleTimeoutStopP1 = async () => {
    clearRecordingTimer();
    audioEngine.playSfx('plankton-augh.mp3');
    setTimeoutModalOpen(true);
    await handleStopRecordingP1Internal();
  };

  const handleStopRecordingP1 = async () => {
    clearRecordingTimer();
    audioEngine.playEndTimerSound();
    await handleStopRecordingP1Internal();
  };

  const handleStopRecordingP1Internal = async () => {
    setGameState('REVERSING_P1');
    setVolumeLevel(0);
    setLiveAudioData(undefined);
    audioEngine.playReverseSound();

    try {
      const rec = await audioEngine.stopRecording();
      const reversed = await audioEngine.reverseAudioBuffer(rec.audioBuffer);

      setP1Audio({
        blob: rec.blob,
        url: rec.url,
        duration: rec.audioBuffer.duration,
        waveform: rec.waveform,
        reversedBlob: reversed.reversedBlob,
        reversedUrl: reversed.reversedUrl,
        reversedWaveform: reversed.waveform,
      });

      setListenCount(0);
      setGameState('PLAYER_2_LISTENING');
    } catch (err) {
      console.error('Reversal error:', err);
      setGameState('ROUND_START');
    }
  };

  // STEP 4: Player 2 Listening to reversed audio
  const handlePlayReversedP1 = async () => {
    if (!p1Audio?.reversedUrl) return;
    if (isPlayingAudio) {
      audioEngine.stopPlayback();
      setIsPlayingAudio(false);
      return;
    }
    // Block playback if reached or exceeded allowedListens limit
    if (listenCount >= settings.allowedListens) {
      return;
    }
    audioEngine.playStartListeningSound();
    setListenCount((prev) => prev + 1);
    setIsPlayingAudio(true);

    await audioEngine.playAudioUrl(p1Audio.reversedUrl);
    setIsPlayingAudio(false);
    audioEngine.playEndListeningSound();
  };

  const handleStopPlayback = () => {
    audioEngine.stopPlayback();
    setIsPlayingAudio(false);
  };

  const handleProceedToP2Recording = () => {
    audioEngine.stopPlayback();
    setIsPlayingAudio(false);
    setRecordingSeconds(0);
    setIsP2RecordingActive(false);
    setGameState('PLAYER_2_RECORDING');
  };

  // STEP 5: Player 2 Recording Imitation
  const startRecordingP2Process = async () => {
    try {
      if (isAndroidNative()) {
        const perm = await requestAndroidMicPermission();
        if (perm.permission !== 'granted') {
          setIsPermanentlyDenied(perm.isPermanentlyDenied);
          setPendingPlayerRecording('P2');
          setMicPermissionModalOpen(true);
          return;
        }
      }

      await audioEngine.playSfx('quack_5.mp3');
      setRecordingSeconds(0);
      setIsP2RecordingActive(true);

      await audioEngine.startRecording(
        (vol) => {
          setVolumeLevel(vol);
        },
        (liveData) => {
          setLiveAudioData(liveData);
        }
      );

      clearRecordingTimer();
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= settings.timeLimit) {
            handleTimeoutStopP2();
          }
          return next;
        });
      }, 1000);
    } catch (err: unknown) {
      console.warn('Microphone permission or hardware error in P2:', err);
      clearRecordingTimer();
      setVolumeLevel(0);
      setIsP2RecordingActive(false);
      setGameState('PLAYER_2_LISTENING');
      setPendingPlayerRecording('P2');
      if (err && typeof err === 'object' && 'isPermanentlyDenied' in err) {
        setIsPermanentlyDenied(Boolean((err as { isPermanentlyDenied?: boolean }).isPermanentlyDenied));
      }
      setMicPermissionModalOpen(true);
    }
  };

  const handleTimeoutStopP2 = async () => {
    clearRecordingTimer();
    setIsP2RecordingActive(false);
    audioEngine.playSfx('plankton-augh.mp3');
    setTimeoutModalOpen(true);
    await handleStopRecordingP2Internal();
  };

  const handleStopRecordingP2 = async () => {
    clearRecordingTimer();
    setIsP2RecordingActive(false);
    audioEngine.playEndTimerSound();
    await handleStopRecordingP2Internal();
  };

  // STEP 6: Reverse Player 2 imitation back to normal
  const handleStopRecordingP2Internal = async () => {
    setGameState('REVERSING_P2');
    setVolumeLevel(0);
    setLiveAudioData(undefined);
    audioEngine.playReverseSound();

    try {
      const rec = await audioEngine.stopRecording();
      const reversed = await audioEngine.reverseAudioBuffer(rec.audioBuffer);

      setP2Audio({
        blob: rec.blob,
        url: rec.url,
        duration: rec.audioBuffer.duration,
        waveform: rec.waveform,
        reversedBlob: reversed.reversedBlob,
        reversedUrl: reversed.reversedUrl,
        reversedWaveform: reversed.waveform,
      });

      setGameState('RESULT_PLAYBACK');
    } catch (err) {
      console.error('Error reversing imitation:', err);
      setGameState('PLAYER_2_LISTENING');
    }
  };

  // STEP 7: Result playback & Guess Decision
  const handlePlayResultP2 = async () => {
    if (!p2Audio?.reversedUrl) return;
    if (isPlayingAudio) {
      audioEngine.stopPlayback();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    await audioEngine.playAudioUrl(p2Audio.reversedUrl);
    setIsPlayingAudio(false);
  };

  const handleProceedToGuess = () => {
    audioEngine.stopPlayback();
    setIsPlayingAudio(false);
    setGameState('GUESS');
  };

  // STEP 8: Decision (عرفها vs معرفهاش)
  const handleGuessResult = async (success: boolean) => {
    setLastGuessSuccess(success);

    // Guesser score calculation without stale state
    let nextP1Score = scoresRef.current.p1;
    let nextP2Score = scoresRef.current.p2;
    if (success) {
      // Guesser gets points!
      if (guesserPlayer === 'P1') {
        nextP1Score += 1;
      } else {
        nextP2Score += 1;
      }
      scoresRef.current = { p1: nextP1Score, p2: nextP2Score };
      setP1Score(nextP1Score);
      setP2Score(nextP2Score);
      setLastGuessPhrase(getRandomSuccessPhrase(settings.language));
      audioEngine.playSfx('suuuui.mp3');
    } else {
      setLastGuessPhrase(getRandomFailPhrase(settings.language));
      audioEngine.playSfx('yyy_ahqVbsA.mp3');
    }

    // Persist real audio recording and player statistics in IndexedDB
    if (p1Audio?.blob) {
      saveRoundAudioAndStats({
        matchNumber: currentMatchNumber,
        roundNumber: currentRound,
        creatorName: creatorName,
        guesserName: guesserName,
        success: success,
        duration: p1Audio.duration || recordingSeconds || 0,
        audioBlob: p1Audio.blob,
        imitationBlob: p2Audio?.blob,
      }).catch((err) => console.warn('Failed auto-saving round recording:', err));
    }

    setGuessFeedbackOpen(true);
  };

  const handleCloseGuessFeedback = () => {
    setGuessFeedbackOpen(false);
    // Move to round end or final win
    if (currentRound >= settings.roundsCount) {
      audioEngine.playSfx('booyah-free-fire.mp3');
      setGameState('FINAL_WIN');
      setWinModalOpen(true);

      // Save complete match finish summary with guaranteed fresh scores
      const finalP1 = scoresRef.current.p1;
      const finalP2 = scoresRef.current.p2;
      const finalWinner = finalP1 > finalP2 ? p1Name : finalP2 > finalP1 ? p2Name : 'tie';

      saveMatchFinish({
        matchNumber: currentMatchNumber,
        player1Name: p1Name,
        player2Name: p2Name,
        player1Score: finalP1,
        player2Score: finalP2,
        winnerName: finalWinner,
        roundsCount: settings.roundsCount,
        timestamp: Date.now(),
      }).catch((err) => console.warn('Failed saving match finish summary:', err));
    } else {
      setGameState('ROUND_END');
    }
  };

  // STEP 9: Swap Roles and Next Round
  const handleNextRound = () => {
    audioEngine.stopPlayback();
    setIsPlayingAudio(false);
    setIsP2RecordingActive(false);
    setCurrentRound((r) => r + 1);
    // Swap roles: creator becomes guesser, guesser becomes creator
    setCreatorPlayer((prev) => (prev === 'P1' ? 'P2' : 'P1'));
    setGuesserPlayer((prev) => (prev === 'P1' ? 'P2' : 'P1'));
    setP1Audio(null);
    setP2Audio(null);
    setListenCount(0);
    setRecordingSeconds(0);
    setGameState('ROUND_START');
  };

  // Replay game with same two players
  const handleReplay = async () => {
    setWinModalOpen(false);
    audioEngine.stopPlayback();
    setIsPlayingAudio(false);
    setIsP2RecordingActive(false);

    try {
      const nextNum = await getNextMatchNumber();
      setCurrentMatchNumber(nextNum);
    } catch {}

    await audioEngine.playSfx('skyviewray-lets-go.mp3');
    setCurrentRound(1);
    setCreatorPlayer('P1');
    setGuesserPlayer('P2');
    setP1Score(0);
    setP2Score(0);
    scoresRef.current = { p1: 0, p2: 0 };
    setP1Audio(null);
    setP2Audio(null);
    setListenCount(0);
    setRecordingSeconds(0);
    setGameState('ROUND_START');
  };

  const handleReturnToMainMenu = () => {
    clearRecordingTimer();
    audioEngine.stopPlayback();
    audioEngine.cleanupMicrophone();
    setIsPlayingAudio(false);
    setIsP2RecordingActive(false);
    setWinModalOpen(false);
    setGuessFeedbackOpen(false);
    setTimeoutModalOpen(false);
    setMicPermissionModalOpen(false);
    setPendingPlayerRecording(null);
    setGameState('MAIN_MENU');
  };

  const handleRetryMicPermission = async () => {
    const granted = await audioEngine.requestMicrophonePermission();
    if (granted) {
      setMicPermissionModalOpen(false);
      setIsPermanentlyDenied(false);
      if (pendingPlayerRecording === 'P1') {
        handleStartRecordingP1();
      } else if (pendingPlayerRecording === 'P2') {
        startRecordingP2Process();
      }
      setPendingPlayerRecording(null);
    } else {
      if (isAndroidNative()) {
        const check = await checkAndroidMicPermission();
        setIsPermanentlyDenied(check.isPermanentlyDenied);
      }
    }
  };

  useEffect(() => {
    const handleAppFocus = async () => {
      if (isAndroidNative() && micPermissionModalOpen) {
        const check = await checkAndroidMicPermission();
        if (check.permission === 'granted') {
          setIsPermanentlyDenied(false);
          setMicPermissionModalOpen(false);
          if (pendingPlayerRecording === 'P1') {
            handleStartRecordingP1();
          } else if (pendingPlayerRecording === 'P2') {
            startRecordingP2Process();
          }
          setPendingPlayerRecording(null);
        } else {
          setIsPermanentlyDenied(check.isPermanentlyDenied);
        }
      }
    };

    window.addEventListener('focus', handleAppFocus);
    return () => {
      window.removeEventListener('focus', handleAppFocus);
    };
  }, [micPermissionModalOpen, pendingPlayerRecording]);

  const handleEnableDemoMode = () => {
    audioEngine.setDemoMode(true);
    setMicPermissionModalOpen(false);
    if (pendingPlayerRecording === 'P1') {
      handleStartRecordingP1();
    } else if (pendingPlayerRecording === 'P2') {
      startRecordingP2Process();
    }
    setPendingPlayerRecording(null);
  };

  const handleCloseMicModal = () => {
    setMicPermissionModalOpen(false);
    setPendingPlayerRecording(null);
  };

  // Current Player Details
  const p1Name = settings.player1Name || 'يونس';
  const p2Name = settings.player2Name || 'محمد';
  const creatorName = creatorPlayer === 'P1' ? p1Name : p2Name;
  const guesserName = guesserPlayer === 'P1' ? p1Name : p2Name;

  // Active status helpers for Player 1 & Player 2
  const isP1Creator = creatorPlayer === 'P1';
  const isP2Creator = creatorPlayer === 'P2';

  const isP1Recording =
    (gameState === 'PLAYER_1_RECORDING' && isP1Creator) ||
    (gameState === 'PLAYER_2_RECORDING' && !isP1Creator && isP2RecordingActive);

  const isP2Recording =
    (gameState === 'PLAYER_1_RECORDING' && isP2Creator) ||
    (gameState === 'PLAYER_2_RECORDING' && !isP2Creator && isP2RecordingActive);

  const isP1Reversing =
    (gameState === 'REVERSING_P1' && isP1Creator) ||
    (gameState === 'REVERSING_P2' && !isP1Creator);

  const isP2Reversing =
    (gameState === 'REVERSING_P1' && isP2Creator) ||
    (gameState === 'REVERSING_P2' && !isP2Creator);

  const isP1Listening =
    (gameState === 'PLAYER_2_LISTENING' && guesserPlayer === 'P1') ||
    (gameState === 'RESULT_PLAYBACK' && true);

  const isP2Listening =
    (gameState === 'PLAYER_2_LISTENING' && guesserPlayer === 'P2') ||
    (gameState === 'RESULT_PLAYBACK' && true);

  return (
    <div
      id="wdnin-app-root"
      dir={settings.language === 'ar' ? 'rtl' : 'ltr'}
      className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between select-none"
    >
      {/* Mode 1: Main Menu Screen */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          onStartGame={handleOpenGameSetup}
          onOpenRules={handleOpenRules}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenContact={() => setContactOpen(true)}
          onOpenStatistics={() => setStatisticsOpen(true)}
          lang={settings.language}
        />
      )}

      {/* Mode 2: Dedicated Match Setup Screen after clicking Start Game */}
      {gameState === 'GAME_SETUP' && (
        <GameSetupScreen
          settings={settings}
          onStartMatch={handleLaunchMatch}
          onBackToMenu={handleBackToMenuFromSetup}
        />
      )}

      {/* Mode 3: Unified Single-Screen Gameplay (No Screen Splitting, No Card Overlaps) */}
      {gameState !== 'MAIN_MENU' && gameState !== 'GAME_SETUP' && (
        <main
          id="gameplay-unified-container"
          className="w-full h-full max-w-xl mx-auto p-2 sm:p-3 overflow-hidden flex flex-col justify-between"
        >
          {/* Top HUD: Both Players' Scoreboard + Roles + Quick Navigation */}
          <header className="w-full bg-gradient-to-b from-[#131b2c] via-[#0d1421] to-[#070b13] border border-amber-500/35 rounded-2xl p-2 sm:p-2.5 shadow-xl shrink-0 mb-1.5 sm:mb-2">
            {/* Top Row: Back to Menu & Round Badge & Statistics */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-gameplay-home"
                  onClick={handleReturnToMainMenu}
                  className="h-8 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title={settings.language === 'ar' ? 'العودة للقائمة الرئيسية' : 'Main Menu'}
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>{settings.language === 'ar' ? 'الرئيسية' : 'Menu'}</span>
                </button>

                <button
                  id="btn-gameplay-stats"
                  onClick={() => setStatisticsOpen(true)}
                  className="h-8 px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  title={settings.language === 'ar' ? 'الإحصائيات والتسجيلات' : 'Statistics'}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{settings.language === 'ar' ? 'الإحصائيات' : 'Stats'}</span>
                </button>
              </div>

              <div className="px-3 py-1 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>
                  {settings.language === 'ar'
                    ? `الجولة ${currentRound} من ${settings.roundsCount}`
                    : `Round ${currentRound} of ${settings.roundsCount}`}
                </span>
              </div>
            </div>

            {/* Matchup Strip: Player 1 (Sky) vs Player 2 (Amber) */}
            <div className="grid grid-cols-2 gap-2 items-center">
              {/* Player 1 Card */}
              <div
                className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  isP1Recording
                    ? 'bg-red-950/60 border-red-500/60 shadow-lg shadow-red-950/30'
                    : isP1Listening
                    ? 'bg-sky-950/60 border-sky-500/60 shadow-lg shadow-sky-950/30'
                    : isP1Creator
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-80'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-900/70 text-sky-300 border border-sky-500/40 shrink-0">
                      P1
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white truncate block" title={p1Name}>
                      {p1Name}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold mt-0.5">
                    {isP1Recording ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        {settings.language === 'ar' ? 'يسجل الآن' : 'Recording'}
                      </span>
                    ) : isP1Listening ? (
                      <span className="text-sky-400 flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {settings.language === 'ar' ? 'يستمع ويقلد' : 'Listening'}
                      </span>
                    ) : (
                      <span className="text-slate-500">{settings.language === 'ar' ? 'ينتظر دوره' : 'Waiting'}</span>
                    )}
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-500/30 text-amber-400 font-black text-sm sm:text-base tabular-nums shrink-0">
                  {p1Score}
                </div>
              </div>

              {/* Player 2 Card */}
              <div
                className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  isP2Recording
                    ? 'bg-red-950/60 border-red-500/60 shadow-lg shadow-red-950/30'
                    : isP2Listening
                    ? 'bg-sky-950/60 border-sky-500/60 shadow-lg shadow-sky-950/30'
                    : isP2Creator
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-80'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-900/70 text-amber-300 border border-amber-500/40 shrink-0">
                      P2
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white truncate block" title={p2Name}>
                      {p2Name}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold mt-0.5">
                    {isP2Recording ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        {settings.language === 'ar' ? 'يسجل الآن' : 'Recording'}
                      </span>
                    ) : isP2Listening ? (
                      <span className="text-sky-400 flex items-center gap-1">
                        <Headphones className="w-3 h-3" />
                        {settings.language === 'ar' ? 'يستمع ويقلد' : 'Listening'}
                      </span>
                    ) : (
                      <span className="text-slate-500">{settings.language === 'ar' ? 'ينتظر دوره' : 'Waiting'}</span>
                    )}
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-500/30 text-amber-400 font-black text-sm sm:text-base tabular-nums shrink-0">
                  {p2Score}
                </div>
              </div>
            </div>
          </header>

          {/* Central Stage: Full-Width Director Hub with Spacious, Non-Overlapping Cards */}
          <div className="flex-1 w-full min-h-0 flex flex-col">
            <DirectorHub
              id="gameplay-director-hub"
              gameState={gameState}
              currentRound={currentRound}
              totalRounds={settings.roundsCount}
              creatorPlayer={creatorPlayer}
              guesserPlayer={guesserPlayer}
              creatorName={creatorName}
              guesserName={guesserName}
              recordingSeconds={recordingSeconds}
              maxRecordingTime={settings.timeLimit}
              listenCount={listenCount}
              allowedListens={settings.allowedListens}
              allowSecondAttempt={settings.allowSecondAttempt}
              liveAudioData={liveAudioData}
              isPlayingAudio={isPlayingAudio}
              isP2RecordingActive={isP2RecordingActive}
              onStartRecordingP1={handleStartRecordingP1}
              onStopRecordingP1={handleStopRecordingP1}
              onPlayReversedP1={handlePlayReversedP1}
              onStopPlayback={handleStopPlayback}
              onProceedToP2Recording={handleProceedToP2Recording}
              onStartRecordingP2={startRecordingP2Process}
              onStopRecordingP2={handleStopRecordingP2}
              onPlayResultP2={handlePlayResultP2}
              onProceedToGuess={handleProceedToGuess}
              onGuessResult={handleGuessResult}
              onNextRound={handleNextRound}
              onMainMenu={handleReturnToMainMenu}
              lang={settings.language}
            />
          </div>
        </main>
      )}

      {/* Modals & Overlays */}
      <RulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
        lang={settings.language}
      />

      <SettingsModal
        isOpen={settingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
      />

      <ContactQRModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        lang={settings.language}
      />

      <GuessFeedbackModal
        isOpen={guessFeedbackOpen}
        isSuccess={lastGuessSuccess}
        creatorName={creatorName}
        guesserName={guesserName}
        phrase={lastGuessPhrase}
        originalAudioUrl={p1Audio?.url}
        originalAudioBlob={p1Audio?.blob}
        onClose={handleCloseGuessFeedback}
        lang={settings.language}
      />

      <TimeoutModal
        isOpen={timeoutModalOpen}
        onClose={() => setTimeoutModalOpen(false)}
        lang={settings.language}
      />

      <WinModal
        isOpen={winModalOpen}
        player1Name={p1Name}
        player2Name={p2Name}
        p1Score={scoresRef.current.p1}
        p2Score={scoresRef.current.p2}
        onReplay={handleReplay}
        onMainMenu={handleReturnToMainMenu}
        onOpenStatistics={() => setStatisticsOpen(true)}
        lang={settings.language}
      />

      <StatisticsModal
        isOpen={statisticsOpen}
        onClose={() => setStatisticsOpen(false)}
        lang={settings.language}
      />

      <MicrophonePermissionModal
        isOpen={micPermissionModalOpen}
        onRetry={handleRetryMicPermission}
        onEnableDemoMode={handleEnableDemoMode}
        onClose={handleCloseMicModal}
        lang={settings.language}
        isPermanentlyDenied={isPermanentlyDenied}
      />
    </div>
  );
}
