import { useState, useEffect } from 'react';
import { Download, RefreshCw, X, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { checkForUpdate, executeAppUpdate, type UpdateInfo } from '../../lib/appUpdateService';
import { APP_VERSION, APP_DEVELOPER } from '../../version';
import { isNativePlatform } from '../../lib/capacitorBridge';

export default function AppUpdateBanner() {
  const isNative = isNativePlatform();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
    executeAppUpdate(updateInfo.downloadUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pembaruan Tersedia</h3>
              <p className="text-xs text-slate-500 font-mono">
                Versi Saat Ini: v{APP_VERSION} → Baru: v{updateInfo.latestVersion}
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

        {/* Release Notes Card */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-semibold border-b border-slate-200/60 pb-1.5">
            <span>Catatan Rilis ({updateInfo.releaseName || `v${updateInfo.latestVersion}`})</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
              Resmi
            </span>
          </div>
          <div className="text-slate-600 text-xs leading-relaxed max-h-32 overflow-y-auto whitespace-pre-line pr-1">
            {updateInfo.releaseNotes || 'Pembaruan stabilitas hafalan dan fitur kecerdasan buatan.'}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            Pengembang: {APP_DEVELOPER}
          </div>
        </div>

        {isDownloading ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-center animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-900">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
              <span>Mengunduh Pembaruan di Latar Belakang...</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Berkas APK sedang diunduh oleh sistem. Konfirmasi pemasangan akan otomatis muncul saat berkas siap.
            </p>
          </div>
        ) : (
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

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pembaruan resmi terverifikasi dan aman tanpa menghapus riwayat hafalan</span>
        </div>
      </div>
    </div>
  );
}

