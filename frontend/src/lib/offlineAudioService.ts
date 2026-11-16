/**
 * offlineAudioService.ts
 *
 * Production-grade offline audio storage engine for Hifzhly.
 * Utilizes the W3C CacheStorage API supported across modern browsers, PWAs,
 * and native iOS/Android WebViews (Capacitor).
 *
 * Enables downloading per-surah audio tracks (both verse-by-verse and full-surah MP3s)
 * so huffadz and santri can listen and murojaah completely offline on mobile.
 */

import { getAyahAudioUrls, getSurahAudioUrl } from './qariPreferences';

export const OFFLINE_AUDIO_CACHE_NAME = 'hifzhly-offline-audio-v1';
export const OFFLINE_SURAHS_KEY = 'hifzhly_offline_surahs_registry';
export const OFFLINE_AUDIO_UPDATED_EVENT = 'hifzhly_offline_audio_updated';

export interface OfflineSurahRecord {
  surahNumber: number;
  surahName: string;
  qariId: string;
  qariName: string;
  totalAyahs: number;
  totalBytes: number;
  downloadedAt: number;
}

export type DownloadProgressCallback = (
  percent: number,
  currentAyah: number,
  totalAyahs: number
) => void;

// Active download abort controllers map (keyed by `${surahNumber}:${qariId}`)
const activeDownloads = new Map<string, AbortController>();

/**
 * Returns all downloaded surah records from registry.
 */
export function getAllOfflineSurahs(): OfflineSurahRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_SURAHS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Checks if a specific surah is completely downloaded for a given Qari.
 */
export function isSurahOffline(surahNumber: number, qariId: string): boolean {
  const records = getAllOfflineSurahs();
  return records.some(
    (r) => r.surahNumber === surahNumber && r.qariId === qariId
  );
}

/**
 * Gets offline record for a specific surah and Qari.
 */
export function getOfflineSurahRecord(
  surahNumber: number,
  qariId: string
): OfflineSurahRecord | null {
  const records = getAllOfflineSurahs();
  return (
    records.find(
      (r) => r.surahNumber === surahNumber && r.qariId === qariId
    ) || null
  );
}

/**
 * Saves or updates a surah record in the offline registry.
 */
function saveOfflineRecord(record: OfflineSurahRecord): void {
  const records = getAllOfflineSurahs();
  const index = records.findIndex(
    (r) => r.surahNumber === record.surahNumber && r.qariId === record.qariId
  );
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  try {
    localStorage.setItem(OFFLINE_SURAHS_KEY, JSON.stringify(records));
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OFFLINE_AUDIO_UPDATED_EVENT));
  }
}

/**
 * Removes a surah record from the offline registry.
 */
function removeOfflineRecord(surahNumber: number, qariId: string): void {
  const records = getAllOfflineSurahs();
  const filtered = records.filter(
    (r) => !(r.surahNumber === surahNumber && r.qariId === qariId)
  );
  try {
    localStorage.setItem(OFFLINE_SURAHS_KEY, JSON.stringify(filtered));
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OFFLINE_AUDIO_UPDATED_EVENT));
  }
}

/**
 * Checks if a download is currently in progress for a surah and Qari.
 */
export function isSurahDownloading(surahNumber: number, qariId: string): boolean {
  return activeDownloads.has(`${surahNumber}:${qariId}`);
}

/**
 * Cancels an ongoing download for a surah.
 */
export function cancelSurahDownload(surahNumber: number, qariId: string): void {
  const key = `${surahNumber}:${qariId}`;
  const controller = activeDownloads.get(key);
  if (controller) {
    controller.abort();
    activeDownloads.delete(key);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(OFFLINE_AUDIO_UPDATED_EVENT));
    }
  }
}

/**
 * Downloads all audio files (every ayah + full surah file) for a surah into CacheStorage.
 * Reports real-time percentage progress.
 */
export async function downloadSurahAudio(
  surahNumber: number,
  surahName: string,
  totalAyahs: number,
  qariId: string,
  qariName: string,
  onProgress?: DownloadProgressCallback
): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    throw new Error('CacheStorage API tidak didukung pada perangkat ini.');
  }

  const key = `${surahNumber}:${qariId}`;
  if (activeDownloads.has(key)) {
    return false; // Already downloading
  }

  const controller = new AbortController();
  activeDownloads.set(key, controller);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OFFLINE_AUDIO_UPDATED_EVENT));
  }

  try {
    const cache = await window.caches.open(OFFLINE_AUDIO_CACHE_NAME);
    let totalBytes = 0;

    // 1. Download and cache full surah MP3
    const fullSurahUrl = getSurahAudioUrl(surahNumber, qariId);
    try {
      const fullRes = await fetch(fullSurahUrl, { signal: controller.signal });
      if (fullRes.ok) {
        const fullClone = fullRes.clone();
        await cache.put(fullSurahUrl, fullClone);
        const b = await fullRes.blob();
        totalBytes += b.size;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      // Continue even if full surah audio CDN has issues; verse tracks are primary
    }

    // 2. Download and cache each ayah audio file
    for (let ayah = 1; ayah <= totalAyahs; ayah++) {
      if (controller.signal.aborted) {
        throw new Error('Download dibatalkan oleh pengguna.');
      }

      const urls = getAyahAudioUrls(surahNumber, ayah, qariId);

      // Try candidate URLs in order of priority (Edge CDN first, fallback second)
      for (const url of urls) {
        try {
          const res = await fetch(url, { signal: controller.signal });
          if (res.ok) {
            const clone = res.clone();
            await cache.put(url, clone);
            const b = await res.blob();
            totalBytes += b.size;
            break;
          }
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          // Try next candidate CDN
        }
      }

      const percent = Math.round((ayah / totalAyahs) * 100);
      onProgress?.(percent, ayah, totalAyahs);
    }

    // 3. Save to registry upon successful completion
    const record: OfflineSurahRecord = {
      surahNumber,
      surahName,
      qariId,
      qariName,
      totalAyahs,
      totalBytes,
      downloadedAt: Date.now(),
    };

    saveOfflineRecord(record);
    activeDownloads.delete(key);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(OFFLINE_AUDIO_UPDATED_EVENT));
    }

    return true;
  } catch (err: any) {
    activeDownloads.delete(key);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(OFFLINE_AUDIO_UPDATED_EVENT));
    }
    if (err.name === 'AbortError') {
      return false;
    }
    throw err;
  }
}

/**
 * Deletes all cached audio files for a surah and removes it from the registry.
 */
export async function deleteOfflineSurahAudio(
  surahNumber: number,
  totalAyahs: number,
  qariId: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;

  try {
    cancelSurahDownload(surahNumber, qariId);
    const cache = await window.caches.open(OFFLINE_AUDIO_CACHE_NAME);

    // Delete full surah MP3
    const fullSurahUrl = getSurahAudioUrl(surahNumber, qariId);
    await cache.delete(fullSurahUrl);

    // Delete all ayah audio files
    for (let ayah = 1; ayah <= totalAyahs; ayah++) {
      const urls = getAyahAudioUrls(surahNumber, ayah, qariId);
      for (const url of urls) {
        await cache.delete(url);
      }
    }

    removeOfflineRecord(surahNumber, qariId);
    return true;
  } catch {
    return false;
  }
}

// Active blob URLs created from cache, to prevent memory leaks
const activeBlobUrls = new Map<string, string>();

/**
 * Resolves an audio URL to a local offline blob: URL if cached in CacheStorage.
 * If not cached or if offline API is unavailable, returns the original URL.
 */
export async function resolvePlayableAudioUrl(url: string): Promise<string> {
  if (typeof window === 'undefined' || !('caches' in window) || !url) {
    return url;
  }

  // Check if we already have an active blob URL for this request
  if (activeBlobUrls.has(url)) {
    return activeBlobUrls.get(url)!;
  }

  try {
    const cache = await window.caches.open(OFFLINE_AUDIO_CACHE_NAME);
    const matched = await cache.match(url);
    if (matched) {
      const blob = await matched.blob();
      const blobUrl = URL.createObjectURL(blob);
      activeBlobUrls.set(url, blobUrl);

      // Clean up previous blob URL after 5 minutes
      setTimeout(() => {
        if (activeBlobUrls.get(url) === blobUrl) {
          URL.revokeObjectURL(blobUrl);
          activeBlobUrls.delete(url);
        }
      }, 300000);

      return blobUrl;
    }
  } catch {}

  return url;
}

/**
 * Helper to format bytes into readable KB / MB format (e.g. "4.2 MB").
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
