import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Monitor,
  Smartphone,
  Apple,
  CheckCircle2,
  Bell,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  X,
  QrCode,
  Check,
  Clock,
  Activity,
  Mic,
  BookOpen,
  Eye,
  Volume2,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { playSuccessChime, playClickTone } from '../lib/soundUtils';

interface PlatformDetails {
  id: 'windows' | 'mac' | 'android' | 'ios';
  name: string;
  osFamily: 'Desktop' | 'Mobile';
  osVersion: string;
  arch: string;
  format: string;
  engineSpec: string;
  icon: typeof Monitor;
  highlights: string[];
  systemMetrics: {
    latency: string;
    ramUsage: string;
    binarySize: string;
    engineType: string;
  };
}

const PLATFORMS_DATA: PlatformDetails[] = [
  {
    id: 'windows',
    name: 'Windows Desktop',
    osFamily: 'Desktop',
    osVersion: 'Windows 10 / 11 (64-bit & ARM64)',
    arch: 'x64 & ARM64 Native',
    format: 'Installer (.exe) & Portable (.zip)',
    engineSpec: 'Tauri v2 + Rust Core • Local ONNX Runtime',
    icon: Monitor,
    highlights: [
      'Mesin Speech AI offline mandiri tanpa membutuhkan kuota internet',
      'Latensi pengenalan suara 0 milidetik langsung dari mikrofon PC',
      'Pintasan keyboard global untuk setoran hafalan cepat saat beraktivitas',
      'Database hafalan dan riwayat murojaah tersimpan aman di penyimpanan lokal komputer',
    ],
    systemMetrics: {
      latency: '< 1.2ms',
      ramUsage: '~28 MB RAM',
      binarySize: '14.2 MB',
      engineType: 'Rust + ONNX Native',
    },
  },
  {
    id: 'mac',
    name: 'macOS Desktop',
    osFamily: 'Desktop',
    osVersion: 'macOS 12 Monterey hingga 15 Sequoia',
    arch: 'Apple Silicon (M1–M4) & Intel Universal',
    format: 'Universal Package (.dmg)',
    engineSpec: 'Apple Metal Performance Shaders • Native Cocoa',
    icon: Apple,
    highlights: [
      'Akselerasi Neural Engine Apple Silicon dengan konsumsi daya minimal',
      'Widget Menu Bar status hafalan harian dan pengingat waktu sholat',
      'Antarmuka native macOS yang selaras dengan tema sistem operasi',
      'Performa evaluasi bacaan instan tanpa membebani kipas laptop',
    ],
    systemMetrics: {
      latency: '< 0.9ms',
      ramUsage: '~24 MB RAM',
      binarySize: '16.8 MB',
      engineType: 'Metal + CoreML Engine',
    },
  },
  {
    id: 'android',
    name: 'Android Mobile',
    osFamily: 'Mobile',
    osVersion: 'Android 9.0 (Pie) hingga Android 15',
    arch: 'arm64-v8a & armeabi-v7a',
    format: 'Google Play Store & Berkas APK',
    engineSpec: 'Kotlin Native Modules • Local Neural Network',
    icon: Smartphone,
    highlights: [
      'Getaran haptik responsif saat terdeteksi kekeliruan makhraj huruf',
      'Mode Asrama Pesantren (berfungsi penuh tanpa koneksi seluler)',
      'Widget layar utama untuk jadwal murojaah (SuperMemo-2)',
      'Pemutar murottal 30 juz di latar belakang saat layar ponsel terkunci',
    ],
    systemMetrics: {
      latency: '< 1.8ms',
      ramUsage: '~42 MB RAM',
      binarySize: '21.5 MB',
      engineType: 'Kotlin NDK + TFLite',
    },
  },
  {
    id: 'ios',
    name: 'iOS & iPadOS Mobile',
    osFamily: 'Mobile',
    osVersion: 'iOS 16.0+ (iPhone & iPad)',
    arch: 'Apple Neural Engine CoreML',
    format: 'App Store & Apple TestFlight',
    engineSpec: 'SwiftUI • CoreML Offline Recitation Engine',
    icon: Apple,
    highlights: [
      'Dukungan Dynamic Island dan Live Activities durasi murojaah',
      'Integrasi Siri Shortcuts "Mulai Murojaah Surah Al-Mulk"',
      'Sinkronisasi aman via Apple CloudKit dan akun santri terdaftar',
      'Tata letak split-view di iPad untuk membaca mushaf sembari evaluasi',
    ],
    systemMetrics: {
      latency: '< 1.1ms',
      ramUsage: '~31 MB RAM',
      binarySize: '18.4 MB',
      engineType: 'SwiftUI + CoreML ANE',
    },
  },
];

export default function DownloadPage() {
  const [selectedPlatformId, setSelectedPlatformId] = useState<'windows' | 'mac' | 'android' | 'ios'>('windows');
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['windows']);
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Interactive 3D Gyro Tilt for Device Centerpiece
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0 });

  // Live Countdown Clock (Target 45 Days)
  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 14,
    minutes: 32,
    seconds: 48,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // QR Code generator
  useEffect(() => {
    QRCode.toDataURL(window.location.href, {
      width: 200,
      margin: 1,
      color: {
        dark: '#022c22',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.warn('QR Code generation notice:', err));
  }, []);

  // GTA 6 Weighted Momentum Scroll Integration
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Soft physics spring for buttery inertia
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 42,
    damping: 18,
    mass: 0.8,
  });

  const phoneY = useTransform(smoothProgress, [0, 0.45], [0, 110]);
  const phoneScale = useTransform(smoothProgress, [0, 0.35], [1, 0.93]);
  const phoneRotateX = useTransform(smoothProgress, [0, 0.45], [0, 10]);

  const handleDeviceMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setDeviceTilt({ x: x * 10, y: y * -10 });
  };

  const handleDeviceMouseLeave = () => {
    setDeviceTilt({ x: 0, y: 0 });
  };

  const currentPlatform = PLATFORMS_DATA.find((p) => p.id === selectedPlatformId) || PLATFORMS_DATA[0];

  const handleOpenWaitlistModal = (platformId?: 'windows' | 'mac' | 'android' | 'ios') => {
    playClickTone();
    if (platformId) {
      setSelectedPlatformId(platformId);
      setSelectedPlatforms([platformId]);
    }
    setIsSuccessSubmitted(false);
    setIsWaitlistModalOpen(true);
  };

  const handleTogglePlatformChoice = (id: string) => {
    playClickTone();
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmitWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      alert('Mohon masukkan alamat email yang valid.');
      return;
    }

    setIsSubmittingWaitlist(true);

    setTimeout(() => {
      try {
        const existingRaw = localStorage.getItem('hifzhly_app_waitlist');
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        const entry = {
          email: emailInput,
          name: userNameInput || 'Santri Hifzhly',
          platforms: selectedPlatforms,
          timestamp: new Date().toISOString(),
        };
        existingList.push(entry);
        localStorage.setItem('hifzhly_app_waitlist', JSON.stringify(existingList));
      } catch (err) {
        console.warn('Storage save notice:', err);
      }

      setIsSubmittingWaitlist(false);
      setIsSuccessSubmitted(true);
      playSuccessChime();
    }, 450);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col overflow-x-hidden relative"
    >
      {/* Inertia Scroll Progress Bar (GTA 6 subtle momentum indicator) */}
      <motion.div
        style={{ scaleX: smoothProgress }}
        className="fixed top-0 left-0 right-0 h-0.5 bg-emerald-500 origin-left z-50 pointer-events-none shadow-xs shadow-emerald-500/30"
      />

      {/* ======================================================== */}
      {/* 1. LUSH ISLAMIC ATMOSPHERIC HERO (EMERALD & SLATE) */}
      {/* ======================================================== */}
      <section className="relative pt-6 sm:pt-8 pb-28 sm:pb-36 px-4 sm:px-6 bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#0f172a] text-white overflow-hidden">
        {/* Soft Ambient Radial Lights (Strictly Islamic Emerald / Forest Tones) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-emerald-500/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-48 left-12 w-80 h-80 bg-teal-600/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-48 right-12 w-80 h-80 bg-emerald-700/10 blur-3xl pointer-events-none rounded-full" />

        {/* Floating Top Nav (Clean Shadcn Styling, Zero Badges) */}
        <div className="relative z-20 max-w-5xl mx-auto flex items-center justify-between py-2 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm mb-12 sm:mb-16">
          <Link
            to="/"
            onClick={() => playClickTone()}
            className="flex items-center space-x-2.5 text-white hover:text-emerald-300 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <img
                src="/logo saja.png"
                alt="Hifzhly Logo"
                className="w-5 h-5 object-contain brightness-0 invert"
              />
              <span className="font-extrabold text-sm tracking-tight text-white">
                Hifzhly
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setIsQrModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Buka di HP</span>
            </button>

            <Link
              to="/app"
              onClick={() => playClickTone()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <span>Buka Web App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Hero Title & Direct Early Access Input (Clean Typography, No Badges) */}
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono"
          >
            Aplikasi Mandiri • Desktop &amp; Mobile
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-white"
          >
            Dapatkan Akses Awal.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto font-sans"
          >
            Aplikasi mandiri Hifzhly untuk Windows, macOS, Android, dan iOS sedang kami siapkan. Ditenagai pemrosesan suara AI lokal 0ms tanpa kuota internet.
          </motion.p>

          {/* Quick Floating Email Form Pill (Clean Shadcn Input Style) */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmitWaitlist}
            className="pt-2 max-w-md mx-auto flex items-center p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
          >
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Masukkan alamat email Anda..."
              className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden font-medium"
            />
            <button
              type="submit"
              disabled={isSubmittingWaitlist}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all active:scale-95 shadow-sm cursor-pointer shrink-0"
            >
              {isSubmittingWaitlist ? 'Mendaftarkan...' : 'Gabung Waitlist'}
            </button>
          </motion.form>
        </div>

        {/* ======================================================== */}
        {/* CENTERPIECE: AUTHENTIC HIFZHLY PHONE & FROSTED COUNTDOWN */}
        {/* ======================================================== */}
        <motion.div
          style={{ y: phoneY, scale: phoneScale, rotateX: phoneRotateX }}
          onMouseMove={handleDeviceMouseMove}
          onMouseLeave={handleDeviceMouseLeave}
          className="relative z-20 max-w-sm mx-auto mt-12 sm:mt-16 perspective-1000"
        >
          {/* Realistic iPhone Mockup Frame */}
          <div
            style={{
              transform: `rotateY(${deviceTilt.x}deg) rotateX(${deviceTilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="relative mx-auto w-[295px] sm:w-[325px] aspect-[9/18.5] rounded-[48px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-700/60 ring-1 ring-white/20 overflow-hidden"
          >
            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>

            {/* REAL HIFZHLY APP INTERFACE ON MOBILE */}
            <div className="w-full h-full rounded-[38px] bg-[#022c22] text-white p-3.5 pt-9 flex flex-col justify-between overflow-hidden relative font-sans">
              {/* Inner ambient pattern */}
              <div className="absolute inset-0 bg-radial from-emerald-800/25 via-transparent to-transparent pointer-events-none" />

              {/* Hifzhly App Header */}
              <div className="space-y-1 text-left relative z-10">
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
                  <span>Juz 29 • Hal 562</span>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Eye className="w-3 h-3" />
                    <span>Mode Ghaib</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-white">
                    Surah Al-Mulk
                  </h4>
                  <span className="text-[10px] text-slate-400">Makkiyyah (30 Ayat)</span>
                </div>
              </div>

              {/* Bismillah Text */}
              <div className="text-center font-quran text-xs text-emerald-300/80 -my-1 relative z-10">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>

              {/* Real Quran Recitation Box with Word-by-Word Mutqin Highlight */}
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-right relative z-10 shadow-inner space-y-2">
                <div className="font-quran text-base sm:text-lg font-bold text-white leading-loose flex flex-wrap justify-end gap-1.5">
                  <span className="bg-emerald-600/40 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/50">
                    تَبَارَكَ
                  </span>
                  <span className="bg-emerald-600/40 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/50">
                    الَّذِي
                  </span>
                  <span className="bg-emerald-600/40 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/50">
                    بِيَدِهِ
                  </span>
                  <span className="bg-emerald-600/40 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/50">
                    الْمُلْكُ
                  </span>
                  <span className="border-b-2 border-emerald-400 text-white px-1">
                    وَهُوَ
                  </span>
                  <span className="blur-[2px] opacity-40 text-slate-300 select-none">
                    عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿١﴾
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-emerald-300">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>4 Kata Mutqin</span>
                  </span>
                  <span className="text-slate-300">0 Kesalahan</span>
                </div>
              </div>

              {/* Real-time Voice Audio Equalizer Waveform */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-white block leading-none">Menyimak Suara...</span>
                    <span className="text-[9px] text-emerald-400 font-mono">ONNX Local Neural Engine</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 h-5">
                  {[8, 16, 12, 20, 14, 18, 10, 14].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Authentic Hifzhly Bottom Navigation Bar */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-around text-slate-400 relative z-10 text-[9px]">
                <div className="flex flex-col items-center space-y-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Beranda</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5 text-emerald-400 font-semibold">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Murojaah</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Mushaf</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Mutaba'ah</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Frosted Glass Countdown Timer (Clean Numeric Cells, Zero Badges) */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[340px] p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-2xl z-30 text-white">
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-lg sm:text-xl font-black text-white block leading-none">
                  {timeLeft.days}
                </span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                  Hari
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-lg sm:text-xl font-black text-white block leading-none">
                  {timeLeft.hours}
                </span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                  Jam
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-lg sm:text-xl font-black text-white block leading-none">
                  {timeLeft.minutes}
                </span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                  Menit
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-lg sm:text-xl font-black text-emerald-400 block leading-none">
                  {timeLeft.seconds}
                </span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                  Detik
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 2. EDITORIAL FEATURE SHOWCASE (ORGANIC FLOW, NO BOX SPAM) */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700 font-mono">
            KAPABILITAS UTAMA APLIKASI MANDIRI
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Dirancang untuk Ketajaman Hafalan Anda.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Menghadirkan pemrosesan suara AI langsung ke sistem operasi laptop dan ponsel Anda tanpa kompromi kuota data.
          </p>
        </div>

        {/* 3 Editorial Fluid Columns with Shadcn Minimalist Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="space-y-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                0ms Latensi Pemrosesan
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Evaluasi pengucapan ayat langsung diproses oleh GPU dan CPU lokal perangkat Anda tanpa jeda transmisi jaringan server.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-slate-500">
              <Cpu className="w-4 h-4 text-slate-400" />
              <span>Local ONNX Runtime Core</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="space-y-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center space-x-3">
              <WifiOff className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                100% Mode Offline Pesantren
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Dirancang khusus untuk asrama santri yang memiliki aturan ketat tanpa internet. Seluruh mushaf dan modul suara tersimpan aman di penyimpanan lokal.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-slate-500">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Bebas Kuota Seluler</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="space-y-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Spaced Repetition SM-2
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Pemberitahuan otomatis jadwal murojaah tepat pada titik kurva lupa memori jangka panjang agar hafalan senantiasa mutqin.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Algoritma Kurva Ingatan</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. DEDICATED PLATFORM STUDIO (INTERACTIVE TABBED SWITCHER) */}
        {/* ======================================================== */}
        <div className="space-y-6 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700 font-mono">
                DUKUNGAN SISTEM OPERASI
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                Studio Platform Mandiri Hifzhly
              </h2>
            </div>

            {/* Clean Segmented Tab Controller (Shadcn Style) */}
            <div className="inline-flex p-1 rounded-xl bg-slate-200/80 self-start sm:self-auto">
              {PLATFORMS_DATA.map((plat) => {
                const Icon = plat.icon;
                const isActive = plat.id === selectedPlatformId;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => {
                      playClickTone();
                      setSelectedPlatformId(plat.id);
                    }}
                    className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{plat.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Platform Detail Showcase (Asymmetric Two-Column Spread) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Platform Specs & Highlights */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                  <span>{currentPlatform.osFamily} Application</span>
                  <span>•</span>
                  <span>{currentPlatform.arch}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentPlatform.name}
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Format berkas: <strong className="text-slate-800 font-semibold">{currentPlatform.format}</strong>
                </p>
              </div>

              {/* Highlights Bullet List with Shadcn Icons */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-slate-700 block">
                  Keunggulan Implementasi Native:
                </span>
                <ul className="space-y-2 text-xs text-slate-600 font-sans">
                  {currentPlatform.highlights.map((h, i) => (
                    <li key={i} className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button (Shadcn Primary) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenWaitlistModal(currentPlatform.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Daftar Akses Awal {currentPlatform.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickTone();
                    setIsQrModalOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Buka di HP</span>
                </button>
              </div>
            </div>

            {/* Right Column: Architectural Benchmark Card */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Benchmark Arsitektur Sistem
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {currentPlatform.engineSpec}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white border border-slate-200/60 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Latensi Suara</span>
                  <span className="text-base font-extrabold text-emerald-700 block">
                    {currentPlatform.systemMetrics.latency}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/60 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Konsumsi RAM</span>
                  <span className="text-base font-extrabold text-slate-800 block">
                    {currentPlatform.systemMetrics.ramUsage}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/60 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Ukuran Berkas</span>
                  <span className="text-base font-extrabold text-slate-800 block">
                    {currentPlatform.systemMetrics.binarySize}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200/60 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Status Offline</span>
                  <span className="text-base font-extrabold text-emerald-700 block">
                    100% Mandiri
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-900 font-sans leading-relaxed">
                Platform ini dioptimalkan khusus untuk arsitektur prosesor target tanpa memerlukan runtime pihak ketiga.
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. COMPARISON TABLE (SHADCN MINIMALIST TABLE) */}
        {/* ======================================================== */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700 font-mono">
              PERBANDINGAN ARSITEKTUR
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kapabilitas Versi Web vs Aplikasi Native
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">
              Anda tidak perlu menunggu aplikasi native untuk mulai menghafal. Versi web Hifzhly sudah dapat digunakan secara penuh hari ini.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-3 px-4 font-semibold">Fitur &amp; Kemampuan</th>
                  <th className="py-3 px-4 font-semibold text-slate-800">Web App (Aktif Saat Ini)</th>
                  <th className="py-3 px-4 font-semibold text-emerald-700">Aplikasi Native (Dalam Rilis)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Evaluasi Suara Real-Time</td>
                  <td className="py-3.5 px-4 text-slate-600">Aktif (Web Browser Audio API)</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>0 Latensi (Local Neural Engine)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Penggunaan Offline di Pesantren</td>
                  <td className="py-3.5 px-4 text-slate-600">Memerlukan Koneksi Internet</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Offline (Tanpa Kuota / Sinyal)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Penggunaan Memori &amp; Baterai</td>
                  <td className="py-3.5 px-4 text-slate-600">Standar Browser Tab</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700 flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sangat Ringan (Binary Rust &amp; Kotlin)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Pemberitahuan Waktu Sholat &amp; Murojaah</td>
                  <td className="py-3.5 px-4 text-slate-600">Web Notification</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Alarm Sistem, Widget Layar, &amp; Haptic</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Penyimpanan Database Hafalan</td>
                  <td className="py-3.5 px-4 text-slate-600">Cloud Database</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Enkripsi Disk Lokal + Sinkronisasi Opsional</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. BOTTOM WEB APP FALLBACK BANNER */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#022c22] text-white p-8 sm:p-10 rounded-3xl shadow-sm text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono">
            Mulai Hari Ini
          </p>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mulai Menghafal di Peramban Web Anda Sekarang.
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-sans">
            Seluruh fitur evaluasi suara AI, mushaf 30 juz, materi tajwid, dan mutaba'ah santri sudah dapat Anda akses langsung tanpa instalasi apapun.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app"
              onClick={() => playClickTone()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs shadow-xs transition-colors"
            >
              <span>Buka Aplikasi Web</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/app/tajwid"
              onClick={() => playClickTone()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              <span>Pelajari Tajwid Academy</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 Hifzhly • Tim FIFA Universitas Sultan Ageng Tirtayasa</p>
      </footer>

      {/* ======================================================== */}
      {/* SHADCN MODAL 1: WAITLIST & EARLY ACCESS SIGNUP */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isWaitlistModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWaitlistModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 z-10 text-slate-800 font-sans"
            >
              <button
                type="button"
                onClick={() => setIsWaitlistModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {!isSuccessSubmitted ? (
                <form onSubmit={handleSubmitWaitlist} className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 font-mono">
                      Program Akses Awal
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Daftar Akses Awal {currentPlatform.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Dapatkan tautan unduhan berkas resmi dan panduan instalasi saat aplikasi siap diuji coba.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Nama Lengkap / Santri
                      </label>
                      <input
                        type="text"
                        value={userNameInput}
                        onChange={(e) => setUserNameInput(e.target.value)}
                        placeholder="Contoh: Ahmad Rayhan"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Alamat Email Aktif <span className="text-emerald-700">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="nama@santri.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1.5">
                        Pilih Platform yang Anda Gunakan:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'windows', label: 'Windows PC' },
                          { id: 'mac', label: 'macOS (Mac)' },
                          { id: 'android', label: 'Android Phone' },
                          { id: 'ios', label: 'iPhone / iPad' },
                        ].map((p) => {
                          const isChecked = selectedPlatforms.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleTogglePlatformChoice(p.id)}
                              className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <span>{p.label}</span>
                              {isChecked && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setIsWaitlistModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingWaitlist}
                      className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {isSubmittingWaitlist ? (
                        <span>Mendaftarkan...</span>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5" />
                          <span>Kirim Pendaftaran</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                      Pendaftaran Akses Awal Diterima
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Terima kasih! Kami akan memberi tahu Anda via email <span className="text-slate-800 font-semibold">{emailInput}</span> saat berkas rilis resmi {currentPlatform.name} siap diunduh.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWaitlistModalOpen(false)}
                      className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* SHADCN MODAL 2: QR CODE SCANNER MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQrModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 text-center space-y-4 z-10 shadow-2xl font-sans"
            >
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 font-mono">
                  Akses Cepat Smartphone
                </p>
                <h4 className="text-base font-bold text-slate-900 tracking-tight">
                  Pindai Melalui Kamera Ponsel
                </h4>
              </div>

              {qrCodeDataUrl ? (
                <div className="p-3 bg-white rounded-xl inline-block border border-slate-200 shadow-2xs mx-auto">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Download"
                    className="w-40 h-40 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 bg-slate-100 rounded-xl mx-auto flex items-center justify-center text-xs text-slate-400">
                  Membuat QR Code...
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                Arahkan kamera smartphone Anda ke kode di atas untuk membuka halaman pendaftaran akses awal ini di ponsel.
              </p>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
