import { App } from '@capacitor/app';
import { isNativePlatform } from './capacitorBridge';
import { APP_VERSION, APP_BUILD, APK_DIRECT_URL } from '../version';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName?: string;
  releaseNotes?: string;
  downloadUrl: string;
  isChecking: boolean;
  error?: string;
}

/**
 * Dapatkan informasi versi aplikasi native yang sedang terpasang di HP secara dinamis
 */
export async function getInstalledAppInfo(): Promise<{ version: string; build: string }> {
  if (isNativePlatform()) {
    try {
      const info = await App.getInfo();
      if (info && info.version) {
        return {
          version: info.version,
          build: info.build || '1',
        };
      }
    } catch (err) {
      console.warn('Gagal membaca info native app via @capacitor/app:', err);
    }
  }

  return {
    version: APP_VERSION,
    build: APP_BUILD,
  };
}

/**
 * Normalisasi versi string (contoh: "v1.0.18" -> [1, 0, 18])
 */
function parseVersion(v: string): number[] {
  return v
    .replace(/^v/i, '')
    .split(/[-_+.]/)
    .map((n) => parseInt(n, 10))
    .filter((n) => !isNaN(n));
}

/**
 * Bandingkan apakah remote version lebih baru daripada local version
 */
export function isNewerVersion(remote: string, local: string): boolean {
  const r = parseVersion(remote);
  const l = parseVersion(local);
  const maxLen = Math.max(r.length, l.length);

  for (let i = 0; i < maxLen; i++) {
    const rPart = r[i] || 0;
    const lPart = l[i] || 0;
    if (rPart > lPart) return true;
    if (rPart < lPart) return false;
  }
  return false;
}

/**
 * Cek apakah pembaruan aplikasi tersedia dari GitHub Releases
 */
export async function checkForUpdate(): Promise<UpdateInfo> {
  const installed = await getInstalledAppInfo();

  const defaultRes: UpdateInfo = {
    hasUpdate: false,
    currentVersion: installed.version,
    latestVersion: installed.version,
    downloadUrl: APK_DIRECT_URL,
    isChecking: false,
  };

  // Hanya periksa dan izinkan pembaruan jika berjalan di dalam container aplikasi native (Android / iOS)
  if (!isNativePlatform()) {
    return defaultRes;
  }

  try {
    const res = await fetch('https://api.github.com/repos/firdyridho/HIFZHLY/releases/latest', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      return defaultRes;
    }

    const data = await res.json();
    
    // Ekstraksi versi dari beberapa sumber: release name, tag_name, atau asset filenames
    const versionCandidates: string[] = [];
    const extractVer = (text?: string): string | null => {
      if (!text) return null;
      const m = /(?:v|version\s*)?(\d+\.\d+\.\d+)/i.exec(text);
      return m ? m[1] : null;
    };

    const fromName = extractVer(data.name);
    if (fromName) versionCandidates.push(fromName);

    const fromTag = extractVer(data.tag_name);
    if (fromTag) versionCandidates.push(fromTag);

    if (Array.isArray(data.assets)) {
      for (const asset of data.assets) {
        const fromAsset = extractVer(asset.name);
        if (fromAsset) versionCandidates.push(fromAsset);
      }
    }

    // Ambil versi tertinggi yang ditemukan di remote
    let bestRemoteVersion = installed.version;
    for (const cand of versionCandidates) {
      if (isNewerVersion(cand, bestRemoteVersion)) {
        bestRemoteVersion = cand;
      }
    }

    // Hanya aktifkan update jika versi remote benar-benar LEBIH BARU daripada versi terpasang
    const hasUpdate = isNewerVersion(bestRemoteVersion, installed.version);

    // Cari aset APK langsung jika ada
    let apkDownloadUrl = APK_DIRECT_URL;
    if (Array.isArray(data.assets)) {
      const latestAsset = data.assets.find(
        (a: any) => typeof a.name === 'string' && a.name.includes('latest') && a.name.endsWith('.apk')
      );
      const versionedAsset = data.assets.find(
        (a: any) => typeof a.name === 'string' && a.name.includes(bestRemoteVersion) && a.name.endsWith('.apk')
      );
      const anyApkAsset = data.assets.find(
        (a: any) => typeof a.name === 'string' && a.name.endsWith('.apk')
      );

      const chosenAsset = latestAsset || versionedAsset || anyApkAsset;
      if (chosenAsset && chosenAsset.browser_download_url) {
        apkDownloadUrl = chosenAsset.browser_download_url;
      }
    }

    return {
      hasUpdate,
      currentVersion: installed.version,
      latestVersion: bestRemoteVersion,
      releaseName: data.name || `Hifzhly v${bestRemoteVersion}`,
      releaseNotes: data.body || 'Pembaruan stabilitas hafalan dan fitur kecerdasan buatan.',
      downloadUrl: apkDownloadUrl,
      isChecking: false,
    };
  } catch (err: any) {
    return {
      ...defaultRes,
      error: err?.message || 'Gagal memeriksa koneksi pembaruan',
    };
  }
}

export interface ApkDownloadProgress {
  percent: number;
  loadedMB: string;
  totalMB: string;
  isComplete: boolean;
  error?: string;
}

/**
 * Eksekusi pengunduhan APK secara 100% di dalam aplikasi (In-App Downloader)
 * Tanpa keluar ke browser luar, dengan progress bar live dan pembukaan otomatis paket installer
 */
export async function downloadApkWithProgress(
  downloadUrl: string = APK_DIRECT_URL,
  onProgress: (p: ApkDownloadProgress) => void
): Promise<void> {
  const win = window as any;

  // 1. Prioritas Native Android Bridge (100% In-App Thread Downloader)
  if (win.AndroidAppUpdater && typeof win.AndroidAppUpdater.startInAppDownload === 'function') {
    return new Promise((resolve) => {
      const handleProgressEvent = (e: any) => {
        const detail = e.detail;
        if (!detail) return;

        onProgress({
          percent: detail.percent,
          loadedMB: detail.loadedMB,
          totalMB: detail.totalMB,
          isComplete: detail.isComplete,
          error: detail.error || undefined,
        });

        if (detail.isComplete || detail.error) {
          window.removeEventListener('hifzhly_in_app_update_progress', handleProgressEvent);
          resolve();
        }
      };

      window.addEventListener('hifzhly_in_app_update_progress', handleProgressEvent);
      win.AndroidAppUpdater.startInAppDownload(downloadUrl);
    });
  }

  // 2. Web Streaming Fallback (Fetch ReadableStream dengan progress persentase nyata)
  try {
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const contentLength = res.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 19 * 1024 * 1024;
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('Streaming response tidak didukung');
    }

    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        const percent = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
        const loadedMB = (receivedBytes / (1024 * 1024)).toFixed(1);

        onProgress({
          percent,
          loadedMB,
          totalMB,
          isComplete: false,
        });
      }
    }

    const blob = new Blob(chunks, { type: 'application/vnd.android.package-archive' });
    const blobUrl = URL.createObjectURL(blob);
    const finalMB = (receivedBytes / (1024 * 1024)).toFixed(1);

    onProgress({
      percent: 100,
      loadedMB: finalMB,
      totalMB: finalMB,
      isComplete: true,
    });

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'hifzhly-latest.apk';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (err: any) {
    onProgress({
      percent: 100,
      loadedMB: '19.0',
      totalMB: '19.0',
      isComplete: true,
      error: err.message,
    });
    executeAppUpdate(downloadUrl);
  }
}

/**
 * Eksekusi pengunduhan APK di latar belakang dan memicu paket instalasi native Android
 */
export function executeAppUpdate(downloadUrl: string = APK_DIRECT_URL): void {
  const win = window as any;
  if (win.AndroidAppUpdater && typeof win.AndroidAppUpdater.startInAppDownload === 'function') {
    win.AndroidAppUpdater.startInAppDownload(downloadUrl);
    return;
  }

  try {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'hifzhly-update.apk';
    a.target = '_self';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 500);
  } catch {
    try {
      window.open(downloadUrl, '_system');
    } catch {
      window.location.href = downloadUrl;
    }
  }
}
