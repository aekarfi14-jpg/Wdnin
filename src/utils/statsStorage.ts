// Persistent IndexedDB Storage for WDNIN Game Recordings and Player Statistics

export interface StoredRecording {
  id: string;
  matchNumber: number;
  roundNumber: number;
  timestamp: number;
  creatorName: string;
  guesserName: string;
  success: boolean; // true = عرفها, false = معرفهاش
  duration: number;
  audioBlob: Blob;
  imitationBlob?: Blob;
}

export interface PlayerRecord {
  name: string;
  totalRounds: number;
  roundsAsGuesser: number;
  roundsAsCreator: number;
  correctGuesses: number; // عرفها (نجح في التخمين)
  missedGuesses: number;  // معرفهاش (فشل في التخمين)
  matchesPlayed: number;
  matchesWon: number;
  lastPlayed: number;
}

export interface MatchSummary {
  matchNumber: number;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  winnerName: string; // name or 'tie'
  roundsCount: number;
  timestamp: number;
}

const DB_NAME = 'wdnin_game_stats_db';
const DB_VERSION = 1;

const STORES = {
  RECORDINGS: 'recordings',
  PLAYERS: 'player_stats',
  MATCHES: 'matches',
  META: 'meta',
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Recordings Store
      if (!db.objectStoreNames.contains(STORES.RECORDINGS)) {
        const recStore = db.createObjectStore(STORES.RECORDINGS, { keyPath: 'id' });
        recStore.createIndex('matchNumber', 'matchNumber', { unique: false });
        recStore.createIndex('timestamp', 'timestamp', { unique: false });
        recStore.createIndex('creatorName', 'creatorName', { unique: false });
        recStore.createIndex('guesserName', 'guesserName', { unique: false });
        recStore.createIndex('success', 'success', { unique: false });
      }

      // 2. Player Stats Store
      if (!db.objectStoreNames.contains(STORES.PLAYERS)) {
        const playerStore = db.createObjectStore(STORES.PLAYERS, { keyPath: 'name' });
        playerStore.createIndex('correctGuesses', 'correctGuesses', { unique: false });
        playerStore.createIndex('missedGuesses', 'missedGuesses', { unique: false });
        playerStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
      }

      // 3. Matches Store
      if (!db.objectStoreNames.contains(STORES.MATCHES)) {
        const matchStore = db.createObjectStore(STORES.MATCHES, { keyPath: 'matchNumber' });
        matchStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 4. Meta Store
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get the next sequential match number
 */
export async function getNextMatchNumber(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.MATCHES, 'readonly');
      const store = tx.objectStore(STORES.MATCHES);
      const req = store.getAllKeys();

      req.onsuccess = () => {
        const keys = req.result as number[];
        if (!keys || keys.length === 0) {
          resolve(1);
        } else {
          const max = Math.max(...keys.map((k) => (typeof k === 'number' ? k : Number(k) || 0)));
          resolve(max + 1);
        }
      };

      req.onerror = () => resolve(1);
    });
  } catch {
    return 1;
  }
}

/**
 * Save a round recording and automatically update both players' statistics
 */
export async function saveRoundAudioAndStats(data: {
  matchNumber: number;
  roundNumber: number;
  creatorName: string;
  guesserName: string;
  success: boolean;
  duration: number;
  audioBlob: Blob;
  imitationBlob?: Blob;
}): Promise<string> {
  const db = await openDB();
  const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = Date.now();

  const recording: StoredRecording = {
    id,
    matchNumber: data.matchNumber,
    roundNumber: data.roundNumber,
    timestamp,
    creatorName: data.creatorName.trim(),
    guesserName: data.guesserName.trim(),
    success: data.success,
    duration: Number(data.duration.toFixed(1)),
    audioBlob: data.audioBlob,
    imitationBlob: data.imitationBlob,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.RECORDINGS, STORES.PLAYERS], 'readwrite');
    const recStore = tx.objectStore(STORES.RECORDINGS);
    const playerStore = tx.objectStore(STORES.PLAYERS);

    // 1. Put recording
    recStore.put(recording);

    // 2. Update guesser stats
    const guesserReq = playerStore.get(recording.guesserName);
    guesserReq.onsuccess = () => {
      const existing: PlayerRecord = guesserReq.result || {
        name: recording.guesserName,
        totalRounds: 0,
        roundsAsGuesser: 0,
        roundsAsCreator: 0,
        correctGuesses: 0,
        missedGuesses: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        lastPlayed: timestamp,
      };

      existing.totalRounds += 1;
      existing.roundsAsGuesser += 1;
      if (recording.success) {
        existing.correctGuesses += 1;
      } else {
        existing.missedGuesses += 1;
      }
      existing.lastPlayed = timestamp;
      playerStore.put(existing);
    };

    // 3. Update creator stats
    const creatorReq = playerStore.get(recording.creatorName);
    creatorReq.onsuccess = () => {
      const existing: PlayerRecord = creatorReq.result || {
        name: recording.creatorName,
        totalRounds: 0,
        roundsAsGuesser: 0,
        roundsAsCreator: 0,
        correctGuesses: 0,
        missedGuesses: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        lastPlayed: timestamp,
      };

      existing.totalRounds += 1;
      existing.roundsAsCreator += 1;
      existing.lastPlayed = timestamp;
      playerStore.put(existing);
    };

    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Record the end of a match and update match wins / counts
 */
export async function saveMatchFinish(summary: MatchSummary): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.MATCHES, STORES.PLAYERS], 'readwrite');
    const matchStore = tx.objectStore(STORES.MATCHES);
    const playerStore = tx.objectStore(STORES.PLAYERS);

    matchStore.put(summary);

    // Update matchesPlayed & matchesWon for P1
    const p1Req = playerStore.get(summary.player1Name);
    p1Req.onsuccess = () => {
      const p1: PlayerRecord = p1Req.result || {
        name: summary.player1Name,
        totalRounds: 0,
        roundsAsGuesser: 0,
        roundsAsCreator: 0,
        correctGuesses: 0,
        missedGuesses: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        lastPlayed: summary.timestamp,
      };
      p1.matchesPlayed += 1;
      if (summary.winnerName === summary.player1Name) {
        p1.matchesWon += 1;
      }
      p1.lastPlayed = summary.timestamp;
      playerStore.put(p1);
    };

    // Update matchesPlayed & matchesWon for P2
    const p2Req = playerStore.get(summary.player2Name);
    p2Req.onsuccess = () => {
      const p2: PlayerRecord = p2Req.result || {
        name: summary.player2Name,
        totalRounds: 0,
        roundsAsGuesser: 0,
        roundsAsCreator: 0,
        correctGuesses: 0,
        missedGuesses: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        lastPlayed: summary.timestamp,
      };
      p2.matchesPlayed += 1;
      if (summary.winnerName === summary.player2Name) {
        p2.matchesWon += 1;
      }
      p2.lastPlayed = summary.timestamp;
      playerStore.put(p2);
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Fetch all stored recordings ordered by newest first
 */
export async function getAllRecordings(): Promise<StoredRecording[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.RECORDINGS, 'readonly');
      const store = tx.objectStore(STORES.RECORDINGS);
      const req = store.getAll();

      req.onsuccess = () => {
        const list: StoredRecording[] = req.result || [];
        // Sort descending by timestamp
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error fetching recordings from IndexedDB:', err);
    return [];
  }
}

/**
 * Delete a single recording
 */
export async function deleteRecording(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.RECORDINGS, 'readwrite');
    const store = tx.objectStore(STORES.RECORDINGS);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Fetch all players and their comprehensive stats
 */
export async function getAllPlayerStats(): Promise<PlayerRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PLAYERS, 'readonly');
      const store = tx.objectStore(STORES.PLAYERS);
      const req = store.getAll();

      req.onsuccess = () => {
        const list: PlayerRecord[] = req.result || [];
        resolve(list);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error fetching player stats from IndexedDB:', err);
    return [];
  }
}

/**
 * Fetch all matches summaries
 */
export async function getAllMatches(): Promise<MatchSummary[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.MATCHES, 'readonly');
      const store = tx.objectStore(STORES.MATCHES);
      const req = store.getAll();

      req.onsuccess = () => {
        const list: MatchSummary[] = req.result || [];
        list.sort((a, b) => b.matchNumber - a.matchNumber);
        resolve(list);
      };

      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Computes leaderboards:
 * 1. أكثر لاعب عرفها (Most successful guesser)
 * 2. أكثر واحد ميعرفش (Most missed / struggled guesser)
 * 3. Complete list of all players sorted by performance
 */
export async function getLeaderboards(): Promise<{
  topGuesser: PlayerRecord | null;
  mostStruggled: PlayerRecord | null;
  players: PlayerRecord[];
}> {
  const players = await getAllPlayerStats();

  if (players.length === 0) {
    return {
      topGuesser: null,
      mostStruggled: null,
      players: [],
    };
  }

  // Find top guesser (highest correct guesses, tie-breaker: success percentage)
  const playersWithGuesses = players.filter((p) => p.roundsAsGuesser > 0);

  let topGuesser: PlayerRecord | null = null;
  if (playersWithGuesses.length > 0) {
    topGuesser = [...playersWithGuesses].sort((a, b) => {
      if (b.correctGuesses !== a.correctGuesses) {
        return b.correctGuesses - a.correctGuesses;
      }
      const rateA = a.roundsAsGuesser > 0 ? a.correctGuesses / a.roundsAsGuesser : 0;
      const rateB = b.roundsAsGuesser > 0 ? b.correctGuesses / b.roundsAsGuesser : 0;
      return rateB - rateA;
    })[0];
  }

  // Find most struggled player (highest missed guesses)
  let mostStruggled: PlayerRecord | null = null;
  if (playersWithGuesses.length > 0) {
    mostStruggled = [...playersWithGuesses].sort((a, b) => {
      if (b.missedGuesses !== a.missedGuesses) {
        return b.missedGuesses - a.missedGuesses;
      }
      return b.roundsAsGuesser - a.roundsAsGuesser;
    })[0];
  }

  // Sort overall players by correct guesses, then total rounds
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.correctGuesses !== a.correctGuesses) {
      return b.correctGuesses - a.correctGuesses;
    }
    return b.totalRounds - a.totalRounds;
  });

  return {
    topGuesser,
    mostStruggled,
    players: sortedPlayers,
  };
}

/**
 * Clear all records and statistics (with confirmation in UI)
 */
export async function clearAllStatsAndRecordings(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.RECORDINGS, STORES.PLAYERS, STORES.MATCHES], 'readwrite');
    tx.objectStore(STORES.RECORDINGS).clear();
    tx.objectStore(STORES.PLAYERS).clear();
    tx.objectStore(STORES.MATCHES).clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
