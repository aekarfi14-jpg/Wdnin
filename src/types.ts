export type GameState =
  | 'MAIN_MENU'
  | 'GAME_SETUP'
  | 'RULES'
  | 'SETTINGS'
  | 'CONTACT_QR'
  | 'ROUND_START'
  | 'PLAYER_1_RECORDING'
  | 'REVERSING_P1'
  | 'PLAYER_2_LISTENING'
  | 'PLAYER_2_RECORDING'
  | 'REVERSING_P2'
  | 'RESULT_PLAYBACK'
  | 'GUESS'
  | 'GUESS_FEEDBACK'
  | 'TIMEOUT_STOP'
  | 'ROUND_END'
  | 'FINAL_WIN';

export type ActivePlayer = 'P1' | 'P2';

export interface GameSettings {
  player1Name: string;
  player2Name: string;
  roundsCount: number;
  timeLimit: number; // hard max 20
  allowedListens: number;
  allowSecondAttempt: boolean;
  bgMusicEnabled: boolean;
  memeSfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  language: 'ar' | 'en';
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
  waveform: number[];
  reversedBlob?: Blob;
  reversedUrl?: string;
  reversedWaveform?: number[];
}

export interface RoundHistory {
  roundNumber: number;
  creatorPlayer: ActivePlayer;
  guesserPlayer: ActivePlayer;
  success: boolean;
  winnerName?: string;
}
