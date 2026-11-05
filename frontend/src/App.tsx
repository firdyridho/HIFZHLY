import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Lenis from 'lenis';
import AppRoutes from './routes';
import { initNativeAppShell } from './lib/capacitorBridge';
import AppUpdateBanner from './components/common/AppUpdateBanner';
import CleanSplashScreen from './components/common/CleanSplashScreen';

export default function App() {
  useEffect(() => {
    // Initialize Capacitor Native App Shell (Status Bar, Splash Screen)
    initNativeAppShell();

    // Initialize Lenis for smooth inertial scrolling
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    // Global Auth Navigation Guard: Mencegah back-navigation ke dashboard setelah logout
    const checkAuthOnNavigation = () => {
      const path = window.location.pathname;
      const isProtected =
        path.startsWith('/app') ||
        path.startsWith('/admin') ||
        ['/murojaah', '/mushaf', '/tajwid', '/mutabaah'].includes(path);

      const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      if (isProtected && !token) {
        window.location.replace('/login');
      }
    };

    window.addEventListener('popstate', checkAuthOnNavigation);
    window.addEventListener('pageshow', checkAuthOnNavigation);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener('popstate', checkAuthOnNavigation);
      window.removeEventListener('pageshow', checkAuthOnNavigation);
    };
  }, []);

  return (
    <BrowserRouter>
      <CleanSplashScreen />
      <AppRoutes />
      <AppUpdateBanner />
    </BrowserRouter>
  );
}
