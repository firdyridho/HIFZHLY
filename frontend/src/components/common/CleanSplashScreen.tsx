import { useState, useEffect } from 'react';
import { APP_NAME, APP_VERSION, APP_DEVELOPER } from '../../version';

export default function CleanSplashScreen() {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      // Hanya muncul satu kali saat aplikasi pertama kali dibuka (tidak muncul lagi saat refresh)
      if (sessionStorage.getItem('hifzhly_splash_shown')) {
        return false;
      }
      sessionStorage.setItem('hifzhly_splash_shown', 'true');
      return true;
    } catch {
      return false;
    }
  });

  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    // Tampilkan splash selama 1.0 detik lalu fade out mulus
    const timer = setTimeout(() => {
      setIsFading(true);
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 350);
      return () => clearTimeout(removeTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-between py-12 px-6 bg-white text-slate-900 transition-opacity duration-350 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full" />

      {/* Center Brand Identity (Logo Murni Tanpa Kotak / Box) */}
      <div className="flex flex-col items-center text-center space-y-3.5 animate-in fade-in zoom-in-95 duration-500">
        <img
          src="/logo saja.png"
          alt="Hifzhly Logo"
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain transition-transform"
        />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            {APP_NAME}
            <span className="text-emerald-600 font-black">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Pendamping Hafalan &amp; Murojaah Al-Qur&apos;an
          </p>
        </div>
      </div>

      {/* Footer Info & Developer Credit */}
      <div className="flex flex-col items-center text-center space-y-1 text-slate-400 text-[11px] font-mono">
        <p className="font-semibold text-slate-500">
          v{APP_VERSION} • Lead Dev: {APP_DEVELOPER}
        </p>
        <p className="text-[10px] text-slate-400 font-sans">
          Bismillah, Khusyu&apos; Menghafal Mandiri
        </p>
      </div>
    </div>
  );
}
