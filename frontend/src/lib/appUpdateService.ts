import { APP_VERSION, APK_DIRECT_URL } from '../version';

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
    let bestRemoteVersion = APP_VERSION;
    for (const cand of versionCandidates) {
      if (isNewerVersion(cand, bestRemoteVersion)) {
        bestRemoteVersion = cand;
      }
    }

    const hasUpdate = isNewerVersion(bestRemoteVersion, APP_VERSION);

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
      currentVersion: APP_VERSION,
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

/**
 * Eksekusi pengunduhan APK di latar belakang dan memicu paket instalasi native Android
 */
export function executeAppUpdate(downloadUrl: string = APK_DIRECT_URL): void {
  try {
    // Pada Android native atau browser, buka dengan target _system agar Download Manager OS mengambil file APK langsung
    window.open(downloadUrl, '_system');
  } catch {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'hifzhly-latest.apk';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 500);
  }
}

