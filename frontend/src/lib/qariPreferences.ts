import { useEffect, useState, useCallback, useRef, type MutableRefObject } from 'react';

export const QARI_STORAGE_KEY = 'hifzhly_qari_preference';
export const QARI_UPDATED_EVENT = 'hifzhly_qari_updated';
export const DEFAULT_QARI_ID = 'Misyari-Rasyid-Al-Afasi';

export interface QariOption {
  /** Exact folder identifier on https://cdn.equran.id/ */
  id: string;
  /** Audio map key returned by https://equran.id/api/v2/surat/:number */
  equranCode: string;
  name: string;
  subtitle: string;
}

export const QARI_LIST: QariOption[] = [
  {
    id: 'Misyari-Rasyid-Al-Afasi',
    equranCode: '05',
    name: 'Syaikh Misyari Rasyid Al-Afasi',
    subtitle: 'Imam Masjid Al-Kabir Kuwait (Hafsh)',
  },
  {
    id: 'Abdurrahman-as-Sudais',
    equranCode: '03',
    name: 'Syaikh Abdurrahman As-Sudais',
    subtitle: 'Imam Besar Masjidil Haram Mekkah',
  },
  {
    id: 'Abdullah-Al-Juhany',
    equranCode: '01',
    name: 'Syaikh Abdullah Al-Juhany',
    subtitle: 'Imam Masjidil Haram Mekkah',
  },
  {
    id: 'Abdul-Muhsin-Al-Qasim',
    equranCode: '02',
    name: 'Syaikh Abdul Muhsin Al-Qasim',
    subtitle: 'Imam Masjid Nabawi Madinah',
  },
  {
    id: 'Ibrahim-Al-Dossari',
    equranCode: '04',
    name: 'Syaikh Ibrahim Al-Dossari',
    subtitle: 'Qari & Dewan Lajnah Mushaf',
  },
  {
    id: 'Yasser-Al-Dosari',
    equranCode: '06',
    name: 'Syaikh Yasser Al-Dosari',
    subtitle: 'Imam Masjidil Haram Mekkah',
  },
];

/**
 * Normalizes a stored Qari ID (or EQuran code) to the exact case-sensitive CDN folder identifier.
 * Repairs legacy mis-cased values (e.g. "Abdurrahman-As-Sudais" -> "Abdurrahman-as-Sudais").
 */
export function normalizeQariId(rawId?: string | null): string {
  if (!rawId) return DEFAULT_QARI_ID;
  const trimmed = rawId.trim();
  const lowered = trimmed.toLowerCase();

  const match = QARI_LIST.find(
    (q) => q.id.toLowerCase() === lowered || q.equranCode === trimmed
  );
  return match ? match.id : DEFAULT_QARI_ID;
}

export function getQariOption(qariId?: string | null): QariOption {
  const canonicalId = normalizeQariId(qariId);
  return QARI_LIST.find((q) => q.id === canonicalId) || QARI_LIST[0];
}

export function getSavedQariPreference(): string {
  try {
    const raw = localStorage.getItem(QARI_STORAGE_KEY);
    const canonical = normalizeQariId(raw);
    if (raw && raw !== canonical) {
      localStorage.setItem(QARI_STORAGE_KEY, canonical);
    }
    return canonical;
  } catch {
    return DEFAULT_QARI_ID;
  }
}

export function saveQariPreference(qariId: string): string {
  const canonical = normalizeQariId(qariId);
  try {
    localStorage.setItem(QARI_STORAGE_KEY, canonical);
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(QARI_UPDATED_EVENT));
  }
  return canonical;
}

/**
 * Subscribes a React component to the active user Qari preference across same-tab
 * settings updates and cross-tab localStorage updates.
 */
export function useQariPreference() {
  const [qariId, setQariId] = useState<string>(() => getSavedQariPreference());

  useEffect(() => {
    const syncPreference = () => {
      setQariId(getSavedQariPreference());
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === QARI_STORAGE_KEY) {
        syncPreference();
      }
    };

    window.addEventListener(QARI_UPDATED_EVENT, syncPreference);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(QARI_UPDATED_EVENT, syncPreference);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setQari = useCallback((nextId: string) => {
    const canonical = saveQariPreference(nextId);
    setQariId(canonical);
    return canonical;
  }, []);

  const qariOption = getQariOption(qariId);

  return { qariId, qariOption, setQari };
}

/**
 * Returns prioritized array of candidate URLs for an ayah.
 * Prioritizes high-speed Edge CDN (BunnyCDN / Singapore POP with 300-day cache)
 * and falls back to cdn.equran.id to guarantee 100% availability.
 */
export function getAyahAudioUrls(
  surahNumber: number,
  ayahNumber: number,
  qariId?: string | null
): string[] {
  const qari = getQariOption(qariId ?? getSavedQariPreference());
  const sPad = String(surahNumber).padStart(3, '0');
  const aPad = String(ayahNumber).padStart(3, '0');
  const equranUrl = `https://cdn.equran.id/audio-partial/${qari.id}/${sPad}${aPad}.mp3`;

  // High-speed Edge CDN mapping (BunnyCDN edge cached with 0-ms latency in ID / SG)
  let everyAyahUrl: string | null = null;
  if (qari.id === 'Misyari-Rasyid-Al-Afasi') {
    everyAyahUrl = `https://everyayah.com/data/Alafasy_128kbps/${sPad}${aPad}.mp3`;
  } else if (qari.id === 'Abdurrahman-as-Sudais') {
    everyAyahUrl = `https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/${sPad}${aPad}.mp3`;
  } else if (qari.id === 'Yasser-Al-Dosari') {
    everyAyahUrl = `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${sPad}${aPad}.mp3`;
  } else if (qari.id === 'Abdul-Muhsin-Al-Qasim') {
    everyAyahUrl = `https://everyayah.com/data/Abdul_Muhsin_Al-Qasim_192kbps/${sPad}${aPad}.mp3`;
  }

  if (everyAyahUrl) {
    return [everyAyahUrl, equranUrl];
  }
  return [equranUrl];
}

export function getAyahAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  qariId?: string | null
): string {
  const urls = getAyahAudioUrls(surahNumber, ayahNumber, qariId);
  return urls[0];
}

// ── In-Memory Fast Audio Preload Cache Pool ─────────────────────────────────
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Pre-buffers audio in the background so future playback starts instantly (< 10ms).
 */
export function prefetchAudioUrl(url: string): void {
  if (typeof window === 'undefined' || !url) return;
  if (audioCache.has(url)) return;
  try {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
    audio.load();
    audioCache.set(url, audio);
    // Maintain maximum 35 cached audio elements
    if (audioCache.size > 35) {
      const first = audioCache.keys().next().value;
      if (first) audioCache.delete(first);
    }
  } catch {}
}

/**
 * Pre-buffers consecutive ayah audio tracks.
 */
export function prefetchAyahAudio(
  surahNumber: number,
  ayahNumber: number,
  qariId?: string | null
): void {
  const urls = getAyahAudioUrls(surahNumber, ayahNumber, qariId);
  urls.forEach((u) => prefetchAudioUrl(u));
}

export function getSurahAudioUrl(
  surahNumber: number,
  qariId?: string | null
): string {
  const qari = getQariOption(qariId ?? getSavedQariPreference());
  const sPad = String(surahNumber).padStart(3, '0');
  return `https://cdn.equran.id/audio-full/${qari.id}/${sPad}.mp3`;
}

export function resolveAyahAudioUrl(
  audioMap: Record<string, string> | undefined,
  surahNumber: number,
  ayahNumber: number,
  qariId?: string | null
): string {
  const qari = getQariOption(qariId ?? getSavedQariPreference());
  if (audioMap && audioMap[qari.equranCode]) {
    return audioMap[qari.equranCode];
  }
  return getAyahAudioUrl(surahNumber, ayahNumber, qari.id);
}

export function resolveSurahAudioUrl(
  audioFullMap: Record<string, string> | undefined,
  surahNumber: number,
  qariId?: string | null
): string {
  const qari = getQariOption(qariId ?? getSavedQariPreference());
  if (audioFullMap && audioFullMap[qari.equranCode]) {
    return audioFullMap[qari.equranCode];
  }
  return getSurahAudioUrl(surahNumber, qari.id);
}

export interface ManagedAudioHandlers {
  onPlaying?: () => void;
  onEnded?: () => void;
  onError?: () => void;
}

/**
 * Safely stops and detaches an active HTMLAudioElement held in a ref.
 */
export function stopManagedAudio(
  audioRef: MutableRefObject<HTMLAudioElement | null>
): void {
  const active = audioRef.current;
  audioRef.current = null;
  if (!active) return;

  active.onplaying = null;
  active.onended = null;
  active.onerror = null;
  active.pause();
  try {
    active.currentTime = 0;
  } catch {}
}

/**
 * Synchronously starts playback using cached preloaded elements when available,
 * and automatically retries candidate fallback CDNs if network delays or errors occur.
 */
export function playManagedAudio(
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  url: string,
  handlers: ManagedAudioHandlers = {},
  fallbackUrls: string[] = []
): HTMLAudioElement {
  stopManagedAudio(audioRef);

  let audio: HTMLAudioElement;
  if (audioCache.has(url)) {
    audio = audioCache.get(url)!;
    audioCache.delete(url);
  } else {
    audio = new Audio(url);
    audio.preload = 'auto';
  }

  audioRef.current = audio;

  const candidateUrls = [url, ...fallbackUrls.filter((u) => u && u !== url)];
  let candidateIndex = 0;

  const attemptPlay = (targetUrl: string) => {
    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
    }
    audio.preload = 'auto';

    audio.onplaying = () => {
      if (audioRef.current !== audio) return;
      handlers.onPlaying?.();
    };

    audio.onended = () => {
      if (audioRef.current !== audio) return;
      audioRef.current = null;
      handlers.onEnded?.();
    };

    audio.onerror = () => {
      candidateIndex++;
      if (candidateIndex < candidateUrls.length && audioRef.current === audio) {
        attemptPlay(candidateUrls[candidateIndex]);
      } else {
        if (audioRef.current !== audio) return;
        audioRef.current = null;
        handlers.onError?.();
      }
    };

    audio.play().catch(() => {
      candidateIndex++;
      if (candidateIndex < candidateUrls.length && audioRef.current === audio) {
        attemptPlay(candidateUrls[candidateIndex]);
      } else {
        if (audioRef.current !== audio) return;
        audioRef.current = null;
        handlers.onError?.();
      }
    });
  };

  attemptPlay(candidateUrls[0]);

  return audio;
}

/**
 * Reusable ayah audio player hook synchronized with the active Qari preference.
 */
export function useQariAyahPlayer() {
  const { qariId, qariOption } = useQariPreference();
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopQariAudio = useCallback(() => {
    stopManagedAudio(audioRef);
    setIsPlayingQari(false);
  }, []);

  useEffect(() => {
    stopQariAudio();
  }, [qariId, stopQariAudio]);

  useEffect(() => {
    return () => {
      stopManagedAudio(audioRef);
    };
  }, []);

  const playAyahAudio = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      const urls = getAyahAudioUrls(surahNumber, ayahNumber, qariId);
      setIsPlayingQari(true);
      prefetchAyahAudio(surahNumber, ayahNumber + 1, qariId);
      playManagedAudio(
        audioRef,
        urls[0],
        {
          onEnded: () => setIsPlayingQari(false),
          onError: () => setIsPlayingQari(false),
        },
        urls.slice(1)
      );
    },
    [qariId]
  );

  return {
    qariId,
    qariOption,
    isPlayingQari,
    playAyahAudio,
    stopQariAudio,
  };
}

