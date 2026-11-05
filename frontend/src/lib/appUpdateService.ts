import { isNativePlatform } from './capacitorBridge';
import { APP_VERSION, APK_DIRECT_URL, APP_RELEASE_URL } from '../version';

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
 * Normalisasi versi string (contoh: "v1.0.2" -> [1, 0, 2])
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
  const defaultRes: UpdateInfo = {
    hasUpdate: false,
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    downloadUrl: APK_DIRECT_URL,
    isChecking: false,
  };

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
    const tag = (data.tag_name || '').replace(/-apk$/i, '');
    const releaseVersion = tag.replace(/^v/i, '') || APP_VERSION;
    const hasUpdate = isNewerVersion(releaseVersion, APP_VERSION);

    // Cari aset APK langsung jika ada
    let apkDownloadUrl = APK_DIRECT_URL;
    if (Array.isArray(data.assets)) {
      const apkAsset = data.assets.find(
        (a: any) => typeof a.name === 'string' && a.name.endsWith('.apk')
      );
      if (apkAsset && apkAsset.browser_download_url) {
        apkDownloadUrl = apkAsset.browser_download_url;
      }
    }

    return {
      hasUpdate,
      currentVersion: APP_VERSION,
      latestVersion: releaseVersion,
      releaseName: data.name || `Hifzhly v${releaseVersion}`,
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

/**
 * Eksekusi pengunduhan APK di latar belakang dan memicu paket instalasi native Android
 */
export function executeAppUpdate(downloadUrl: string = APK_DIRECT_URL): void {
  if (isNativePlatform()) {
    // Pada Android native, membuka link APK langsung akan mengaktifkan Android DownloadManager di status bar
    // dan setelah selesai sistem Android langsung menawarkan prompt Update In-Place tanpa buka web
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'hifzhly-update.apk';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 500);
  } else {
    // Di web, buka halaman download atau link rilis resmi
    window.open(downloadUrl || APP_RELEASE_URL, '_blank');
  }
}
