import { useState, useEffect } from 'react';
import { Download, RefreshCw, X, ShieldCheck, ArrowUpRight, CheckCircle2, FolderDown, ExternalLink } from 'lucide-react';
import {
  checkForUpdate,
  executeAppUpdate,
  downloadApkWithProgress,
  type UpdateInfo,
  type ApkDownloadProgress,
} from '../../lib/appUpdateService';
import { APP_VERSION, APP_DEVELOPER } from '../../version';
import { isNativePlatform } from '../../lib/capacitorBridge';

export default function AppUpdateBanner() {
  const isNative = isNativePlatform();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<ApkDownloadProgress | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Hanya periksa pembaruan jika aplikasi berjalan di platform native mobile (Android / iOS)
    if (!isNative) return;

    let isMounted = true;
    checkForUpdate().then((info) => {
      if (isMounted && info.hasUpdate) {
        setUpdateInfo(info);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isNative]);

  // Di browser web biasa, jangan pernah tampilkan pop-up / peringatan pembaruan APK
  if (!isNative || !updateInfo || !updateInfo.hasUpdate || isDismissed) {
    return null;
  }

  const handleStartUpdate = () => {
    setIsDownloading(true);
    setProgress({
      percent: 5,
      loadedMB: '0.5',
      totalMB: '...',
      isComplete: false,
    });

    downloadApkWithProgress(updateInfo.downloadUrl, (p) => {
      setProgress(p);
      if (p.isComplete) {
        setIsComplete(true);
      }
    });
  };

  const handleManualInstall = () => {
    executeAppUpdate(updateInfo.downloadUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${
              isComplete
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
            }`}>
              {isComplete ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <Download className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isComplete ? 'Unduhan Selesai' : isDownloading ? 'Mengunduh Pembaruan' : 'Pembaruan Tersedia'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                v{APP_VERSION} → Baru: v{updateInfo.latestVersion}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            title="Tutup pemberitahuan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Release Notes Card (jika belum unduh) */}
        {!isDownloading && !isComplete && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 font-semibold border-b border-slate-200/60 pb-1.5">
              <span>Catatan Rilis ({updateInfo.releaseName || `v${updateInfo.latestVersion}`})</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Resmi
              </span>
            </div>
            <div className="text-slate-600 text-xs leading-relaxed max-h-28 overflow-y-auto whitespace-pre-line pr-1">
              {updateInfo.releaseNotes || 'Pembaruan stabilitas hafalan dan fitur kecerdasan buatan.'}
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Pengembang: {APP_DEVELOPER}
            </div>
          </div>
        )}

        {/* Real In-App Progress Bar */}
        {isDownloading && !isComplete && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                Mengunduh di Latar Belakang...
              </span>
              <span className="font-mono text-emerald-700 font-extrabold">
                {progress ? `${progress.percent}%` : '5%'}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-emerald-100/80 rounded-full h-3 overflow-hidden p-0.5 border border-emerald-200">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300 shadow-xs"
                style={{ width: `${progress ? Math.max(5, progress.percent) : 5}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-800">
              <span>{progress ? `${progress.loadedMB} MB / ${progress.totalMB} MB` : 'Menghubungkan...'}</span>
              <span className="text-[10px] text-emerald-600 font-medium">hifzhly-update.apk</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-emerald-200/60">
              Unduhan berjalan di latar belakang. Anda juga dapat memantaunya langsung di bilah notifikasi status bar HP.
            </p>
          </div>
        )}

        {/* Complete State Screen */}
        {isComplete && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <FolderDown className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-950">
                  Berkas APK Berhasil Tersimpan!
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Berkas <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-900">hifzhly-update.apk</code> telah disimpan ke folder <strong>Download</strong> HP Anda.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleManualInstall}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka & Pasang Sekarang</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="w-full py-2 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-100/60 text-xs font-semibold transition cursor-pointer"
              >
                Selesai / Pasang Nanti
              </button>
            </div>
          </div>
        )}

        {/* Initial Action Buttons */}
        {!isDownloading && !isComplete && (
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              Nanti Saja
            </button>
            <button
              type="button"
              onClick={handleStartUpdate}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <span>Perbarui Otomatis</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Fallback Link & Security Badge */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pembaruan resmi Hifzhly</span>
          </div>

          <a
            href={updateInfo.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-emerald-700 hover:underline font-medium"
          >
            <span>Unduh via Browser</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
