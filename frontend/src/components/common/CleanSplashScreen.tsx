import { useState, useEffect } from 'react';
import { APP_NAME } from '../../version';

export default function CleanSplashScreen() {
  const [isVisible, setIsVisible] = useState(() => {
    try {
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

    // Splash screen muncul sejenak (1.1s) lalu fade out halus
    const timer = setTimeout(() => {
      setIsFading(true);
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 400);
      return () => clearTimeout(removeTimer);
    }, 1100);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => setIsFading(true)}
      role="dialog"
      aria-label="Hifzhly Splash"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between py-12 sm:py-16 px-6 bg-white text-slate-900 select-none cursor-pointer transition-opacity duration-400 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full" />

      {/* Pure, Uncluttered Center Identity (Zero Circles, Zero Boxes, Pure Logo & Type) */}
      <div className="flex flex-col items-center text-center space-y-3.5">
        <img
          src="/logo saja.png"
          alt="Hifzhly"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
        />

        <div className="space-y-1">
          <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
            {APP_NAME}
          </h1>
          <p className="text-xs text-slate-400 tracking-wide font-sans">
            Murojaah &amp; Kemutqinan Al-Qur'an
          </p>
        </div>
      </div>

      {/* Single Quiet Line at Bottom */}
      <div className="text-center text-[11px] text-slate-400 font-sans tracking-wide">
        <p>Faeyza Ardellein Yaradhitya &amp; Firdy Ridho Fillah</p>
      </div>
    </div>
  );
}
