import { useState, useEffect } from 'react';
import { APP_NAME, APP_VERSION, APP_DEVELOPER } from '../../version';

export default function CleanSplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Tampilkan splash screen selama 1.2 detik lalu fade out mulus
    const timer = setTimeout(() => {
      setIsFading(true);
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 400);
      return () => clearTimeout(removeTimer);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-between py-12 px-6 bg-[#022c22] text-white transition-opacity duration-400 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full" />

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-2xl flex items-center justify-center">
            <img
              src="/icon_favicon.png"
              alt="Hifzhly Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full -z-10 pointer-events-none" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            {APP_NAME}
            <span className="text-emerald-400 font-black">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
            Pendamping Hafalan &amp; Murojaah Al-Qur&apos;an Cerdas
          </p>
        </div>
      </div>

      {/* Footer Info & Developer Credit */}
      <div className="flex flex-col items-center text-center space-y-1 text-emerald-300/80 text-[11px] font-mono">
        <p className="font-semibold text-emerald-200">
          v{APP_VERSION} • Lead Dev: {APP_DEVELOPER}
        </p>
        <p className="text-[10px] text-emerald-400/60 font-sans">
          Bismillah, Khusyu&apos; Menghafal Mandiri
        </p>
      </div>
    </div>
  );
}
