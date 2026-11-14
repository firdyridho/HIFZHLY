import { useState, useEffect } from 'react';
import { APP_NAME, APP_VERSION } from '../../version';

export default function CleanSplashScreen() {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      // Hanya muncul satu kali per session tab browser
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
  const [progress, setProgress] = useState(15);

  const dismissSplash = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 450);
  };

  useEffect(() => {
    if (!isVisible) return;

    // Animasi progress bar halus
    const progressTimer = setTimeout(() => {
      setProgress(100);
    }, 120);

    // Tampilkan splash screen selama 1.8 detik lalu dissolve keluar dengan anggun
    const exitTimer = setTimeout(() => {
      dismissSplash();
    }, 1850);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(exitTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      onClick={dismissSplash}
      role="dialog"
      aria-label="Hifzhly Splash"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between py-10 sm:py-14 px-6 bg-[#FCFCF9] text-slate-900 select-none cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
        isFading ? 'opacity-0 scale-[1.015] blur-[2px] pointer-events-none' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      {/* Subtle Central Emerald Ambient Aura */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-gradient-to-tr from-emerald-600/[0.07] via-teal-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating Sacred Calligraphy Watermark in Center Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span className="font-quran text-[120px] sm:text-[200px] text-emerald-950/[0.025] leading-none whitespace-nowrap -rotate-6">
          اقْرَأْ وَارْتَقِ وَرَتِّلْ
        </span>
      </div>

      {/* ── Top Header: Sacred Bismillah Calligraphy (Amiri Quran) ── */}
      <div className="relative z-10 pt-2 sm:pt-4 text-center">
        <p className="font-quran text-2xl sm:text-3xl text-emerald-950/85 tracking-wide leading-relaxed">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </div>

      {/* ── Centerpiece: Official Brand Emblem & Literary Typography ── */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 sm:space-y-7 my-auto">
        {/* Emblem Halo with Fine Concentric Hairline */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-full bg-emerald-500/10 blur-md" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-emerald-900/15 bg-white/90 backdrop-blur-xs p-4 flex items-center justify-center shadow-[0_8px_30px_rgba(5,150,105,0.06)]">
            <img
              src="/logo saja.png"
              alt="Hifzhly"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Literary Scholarly Title & Tagline (Lora Serif + Monospace) */}
        <div className="space-y-2">
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-slate-900">
            {APP_NAME}
            <span className="text-emerald-700 font-sans font-bold">.</span>
          </h1>
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-emerald-800 font-semibold">
            Asistensi Murojaah &amp; Kemutqinan Al-Qur'an
          </p>
        </div>

        {/* Elegant Micro-Hairline Progress Thread */}
        <div className="w-32 sm:w-40 h-[1.5px] bg-slate-200/90 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 rounded-full transition-all duration-1500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Bottom Colophon: Institutional Standards & Founders Tribute ── */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-2 text-slate-400">
        <div className="flex items-center space-x-2.5 text-[9.5px] sm:text-[10px] font-mono tracking-[0.22em] uppercase text-slate-400">
          <span>Standar Kemenag RI</span>
          <span className="text-slate-300 font-quran text-xs">۞</span>
          <span>Rasm Utsmani</span>
          <span className="text-slate-300 font-quran text-xs">۞</span>
          <span>Sanad Hafsh</span>
        </div>

        <p className="text-[11px] text-slate-500 font-sans tracking-wide">
          Karya Khidmah Ilmiah <span className="text-slate-800 font-semibold">Faeyza Ardellein Yaradhitya</span> &amp; <span className="text-slate-800 font-semibold">Firdy Ridho Fillah</span>
        </p>

        <p className="text-[9px] font-mono text-slate-400/80 pt-0.5">
          v{APP_VERSION} • Rilis Perdana
        </p>
      </div>
    </div>
  );
}
