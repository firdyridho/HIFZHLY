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
  Sparkles,
  Clock,
  Calendar,
  WifiOff,
} from 'lucide-react';
import { playSuccessChime, playClickTone } from '../lib/soundUtils';

interface PlatformCardData {
  id: 'windows' | 'mac' | 'android' | 'ios';
  name: string;
  category: 'desktop' | 'mobile';
  osVersion: string;
  arch: string;
  format: string;
  statusText: string;
  statusBadge: string;
  icon: typeof Monitor;
  highlights: string[];
  techSpec: string;
  releaseQuarter: string;
}

const PLATFORMS: PlatformCardData[] = [
  {
    id: 'windows',
    name: 'Windows Desktop',
    category: 'desktop',
    osVersion: 'Windows 10 / 11 (64-bit & ARM64)',
    arch: 'x64 & ARM64 Native',
    format: 'Installer (.exe) & Portable (.zip)',
    statusText: 'Kompilasi Rust & Tauri v2',
    statusBadge: 'Akses Awal • v0.9 Pre-Release',
    icon: Monitor,
    releaseQuarter: 'Q1 2026',
    techSpec: 'Tauri v2 + Rust Core • Local ONNX Runtime',
    highlights: [
      'Mesin Speech AI offline mandiri tanpa membutuhkan kuota internet',
      'Latensi pengenalan suara 0 milidetik langsung dari mikrofon PC',
      'Pintasan keyboard global untuk setoran hafalan cepat saat beraktivitas',
      'Database hafalan dan riwayat murojaah tersimpan aman di penyimpanan lokal',
    ],
  },
  {
    id: 'mac',
    name: 'macOS Desktop',
    category: 'desktop',
    osVersion: 'macOS 12 Monterey hingga 15 Sequoia',
    arch: 'Apple Silicon (M1–M4) & Intel Universal',
    format: 'Universal Package (.dmg)',
    statusText: 'Optimalisasi Metal Performance Shaders',
    statusBadge: 'Akses Awal • Private Beta',
    icon: Apple,
    releaseQuarter: 'Q1 2026',
    techSpec: 'Apple Metal Performance Shaders • Native Cocoa',
    highlights: [
      'Akselerasi Neural Engine Apple Silicon dengan konsumsi daya minimal',
      'Widget Menu Bar status hafalan harian dan pengingat waktu sholat',
      'Antarmuka native macOS yang selaras dengan tema sistem operasi',
      'Performa evaluasi bacaan instan tanpa membebani kipas laptop',
    ],
  },
  {
    id: 'android',
    name: 'Android Mobile',
    category: 'mobile',
    osVersion: 'Android 9.0 (Pie) hingga Android 15',
    arch: 'arm64-v8a & armeabi-v7a',
    format: 'Google Play Store & Berkas APK',
    statusText: 'Uji Coba Closed Alpha Pesantren',
    statusBadge: 'Akses Awal • Closed Alpha',
    icon: Smartphone,
    releaseQuarter: 'Q2 2026',
    techSpec: 'Kotlin Native Modules • Local Neural Network',
    highlights: [
      'Getaran haptik responsif saat terdeteksi kekeliruan makhraj huruf',
      'Mode Asrama Pesantren (berfungsi penuh tanpa koneksi seluler)',
      'Widget layar utama untuk jadwal murojaah (SuperMemo-2)',
      'Pemutar murottal 30 juz di latar belakang saat layar ponsel terkunci',
    ],
  },
  {
    id: 'ios',
    name: 'iOS & iPadOS Mobile',
    category: 'mobile',
    osVersion: 'iOS 16.0+ (iPhone & iPad)',
    arch: 'Apple Neural Engine CoreML',
    format: 'App Store & Apple TestFlight',
    statusText: 'Persiapan Pengujian TestFlight',
    statusBadge: 'Akses Awal • TestFlight Preview',
    icon: Apple,
    releaseQuarter: 'Q2 2026',
    techSpec: 'SwiftUI • CoreML Offline Recitation Engine',
    highlights: [
      'Dukungan Dynamic Island dan Live Activities durasi murojaah',
      'Integrasi Siri Shortcuts "Mulai Murojaah Surah Al-Mulk"',
      'Sinkronisasi aman via Apple CloudKit dan akun santri terdaftar',
      'Tata letak split-view di iPad untuk membaca mushaf sembari evaluasi',
    ],
  },
];

export default function DownloadPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [selectedPlatformForWaitlist, setSelectedPlatformForWaitlist] = useState<PlatformCardData | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['windows']);
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Interactive 3D Card Hover Tilt State
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  // Live Countdown Timer (Target: 45 days from now)
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

  // Generate QR Code for Mobile Scanning
  useEffect(() => {
    QRCode.toDataURL(window.location.href, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.warn('QR code gen warning:', err));
  }, []);

  // Inertial Parallax Momentum (GTA 6 Scroll Style via Lenis + Framer Motion Spring)
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001,
  });

  const phoneY = useTransform(smoothProgress, [0, 0.4], [0, 60]);
  const phoneScale = useTransform(smoothProgress, [0, 0.35], [1, 0.94]);
  const phoneRotateX = useTransform(smoothProgress, [0, 0.4], [0, 8]);

  const handlePhoneMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 12, y: y * -12 });
  };

  const handlePhoneMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  const filteredPlatforms = PLATFORMS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const handleOpenWaitlistModal = (platform: PlatformCardData) => {
    playClickTone();
    setSelectedPlatformForWaitlist(platform);
    setSelectedPlatforms([platform.id]);
    setIsSuccessSubmitted(false);
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
        console.warn('Storage save warning:', err);
      }

      setIsSubmittingWaitlist(false);
      setIsSuccessSubmitted(true);
      playSuccessChime();
    }, 500);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-cyan-100 selection:text-cyan-900 flex flex-col overflow-x-hidden"
    >
      {/* ======================================================== */}
      {/* 1. LUSH ATMOSPHERIC HERO SECTION (NEARO / GTA 6 STYLE) */}
      {/* ======================================================== */}
      <section className="relative pt-6 sm:pt-8 pb-28 sm:pb-36 px-4 sm:px-6 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#f8fafc] overflow-hidden">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-white/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-40 left-10 w-96 h-96 bg-cyan-300/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-sky-200/20 blur-3xl pointer-events-none rounded-full" />

        {/* Floating Top Nav Pill (Nearo Style) */}
        <div className="relative z-20 max-w-5xl mx-auto flex items-center justify-between py-2.5 px-4 sm:px-5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 shadow-lg text-white mb-12 sm:mb-16">
          <Link
            to="/"
            onClick={() => playClickTone()}
            className="flex items-center space-x-2.5 group"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/40 shadow-xs">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <div className="flex items-center space-x-2">
              <img
                src="/logo saja.png"
                alt="Hifzhly Logo"
                className="w-6 h-6 object-contain brightness-0 invert"
              />
              <span className="font-extrabold text-base tracking-tight text-white">
                Hifzhly
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => {
                playClickTone();
                setIsQrModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all cursor-pointer border border-white/20"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Buka di HP</span>
            </button>

            <Link
              to="/app"
              onClick={() => playClickTone()}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <span>Buka Web App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Hero Title & Direct Early Access Input */}
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-[11px] font-bold font-mono uppercase tracking-wider text-white shadow-xs"
          >
            <span>COMING SOON • DESKTOP &amp; MOBILE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-xs"
          >
            Get early access
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl mx-auto font-sans font-medium"
          >
            Aplikasi mandiri Hifzhly untuk Windows, macOS, Android, dan iOS sedang kami siapkan. Daftarkan email Anda untuk mencoba rilis beta pertama.
          </motion.p>

          {/* Quick Floating Email Form Pill (Nearo Style) */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmitWaitlist}
            className="pt-2 max-w-md mx-auto flex items-center p-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-xl"
          >
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Masukkan alamat email Anda..."
              className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-white placeholder-white/70 focus:outline-hidden font-medium"
            />
            <button
              type="submit"
              disabled={isSubmittingWaitlist}
              className="px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md cursor-pointer shrink-0"
            >
              {isSubmittingWaitlist ? 'Mendaftarkan...' : 'JOIN WAITLIST'}
            </button>
          </motion.form>
        </div>

        {/* ======================================================== */}
        {/* HERO DEVICE MOCKUP WITH COUNTDOWN TIMER (NEARO STYLE) */}
        {/* ======================================================== */}
        <motion.div
          style={{ y: phoneY, scale: phoneScale, rotateX: phoneRotateX }}
          onMouseMove={handlePhoneMouseMove}
          onMouseLeave={handlePhoneMouseLeave}
          className="relative z-20 max-w-sm mx-auto mt-12 sm:mt-16 perspective-1000"
        >
          {/* Realistic iPhone Mockup Frame */}
          <div
            style={{
              transform: `rotateY(${mouseTilt.x}deg) rotateX(${mouseTilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="relative mx-auto w-[290px] sm:w-[320px] aspect-[9/18.5] rounded-[48px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-700/60 ring-1 ring-white/30 overflow-hidden"
          >
            {/* Dynamic Island Pill */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>

            {/* Glass Mobile Screen View */}
            <div className="w-full h-full rounded-[38px] bg-[#022c22] text-white p-4 pt-10 flex flex-col justify-between overflow-hidden relative font-sans">
              {/* Inner ambient pattern */}
              <div className="absolute inset-0 bg-radial from-emerald-800/30 via-transparent to-transparent pointer-events-none" />

              {/* Screen Header */}
              <div className="space-y-1 text-left relative z-10">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  Murojaah Mandiri • Real-Time AI
                </span>
                <h4 className="text-sm font-extrabold text-white">
                  Surah Al-Mulk: Ayat 1
                </h4>
              </div>

              {/* Arabic Verse Display */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-right relative z-10 shadow-inner">
                <div className="font-quran text-lg sm:text-xl font-bold text-white leading-loose">
                  تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ
                </div>
                <div className="flex items-center justify-end space-x-1 mt-2 text-[10px] font-mono text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Mutqin 100% Cocok</span>
                </div>
              </div>

              {/* Accuracy Wave Indicator */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-emerald-500/30 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-300">Skor Presisi Suara</span>
                  <span className="text-emerald-400 font-bold font-mono">98.7%</span>
                </div>
                <div className="flex items-center space-x-1 h-6 justify-center">
                  {[12, 22, 16, 28, 14, 26, 18, 30, 24, 16, 20, 10].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-emerald-400 rounded-full"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Spaced Repetition Card */}
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-left text-[10px] space-y-0.5 relative z-10">
                <span className="text-slate-300 block">Jadwal Review (SuperMemo-2):</span>
                <span className="text-white font-bold block">Surah Al-Waqi'ah • Interval 3 Hari</span>
              </div>
            </div>
          </div>

          {/* Floating Frosted Glass Countdown Timer Bar (Matching Image 2 Nearo Reference) */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[350px] p-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xl z-30">
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/50">
                <span className="text-lg sm:text-xl font-black text-slate-900 block leading-none">
                  {timeLeft.days}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Hari
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/50">
                <span className="text-lg sm:text-xl font-black text-slate-900 block leading-none">
                  {timeLeft.hours}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Jam
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/50">
                <span className="text-lg sm:text-xl font-black text-slate-900 block leading-none">
                  {timeLeft.minutes}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Menit
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200/50">
                <span className="text-lg sm:text-xl font-black text-emerald-600 block leading-none">
                  {timeLeft.seconds}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Detik
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* 2. FEATURES DESIGNED FOR YOUR SUCCESS (NEARO STYLE) */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 block">
            KAPABILITAS UTAMA APLIKASI MANDIRI
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Features designed for your success.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Explore the features designed to keep you organized and on track. Seluruh kapabilitas bertenaga AI lokal langsung aktif di laptop dan ponsel Anda tanpa ketergantungan internet.
          </p>
        </div>

        {/* Feature Cards Grid with Mockup Previews (Nearo Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Task / Murojaah Management */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-4">
              {/* Mini UI Mockup inside card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 group-hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono font-semibold text-slate-500">Murojaah Terjadwal</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs space-y-1 text-left">
                  <span className="text-xs font-bold text-slate-900 block">Surah Al-Kahfi • Halaman 293</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>10 Ayat Pertama</span>
                    <span className="text-emerald-700 font-bold">Prioritas Harian</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Task &amp; Murojaah Management
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                  Atur daftar target hafalan harian, mingguan, dan evaluasi bulanan santri secara terstruktur.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-emerald-800">
              <Calendar className="w-3.5 h-3.5" />
              <span>Target Terjadwal</span>
            </div>
          </div>

          {/* Card 2: Time Tracking */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-4">
              {/* Mini UI Mockup inside card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 group-hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Sesi Setoran Mandiri</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Durasi Fokus</span>
                    <span className="text-sm font-black text-slate-900 font-mono">12:09:07</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono">
                    Aktif
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Time Tracking &amp; Focus
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                  Pantau alokasi waktu murojaah harian dengan stopwatch presisi dan pengingat waktu istirahat.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-emerald-800">
              <Clock className="w-3.5 h-3.5" />
              <span>Pencatatan Otomatis</span>
            </div>
          </div>

          {/* Card 3: 0ms Latensi Mesin Suara AI */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-4">
              {/* Mini UI Mockup inside card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 group-hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Neural Speech Wave</span>
                  <span className="text-emerald-700 font-bold">0ms</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs flex items-center justify-center space-x-1 h-10">
                  {[8, 18, 12, 24, 16, 28, 14, 22, 18, 10].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-500 rounded-full"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  0ms Latensi Pemrosesan
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                  Evaluasi bacaan langsung dianalisis di chip prosesor lokal tanpa latensi pengiriman data cloud.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-emerald-800">
              <Zap className="w-3.5 h-3.5" />
              <span>Local ONNX Core</span>
            </div>
          </div>

          {/* Card 4: Mode Asrama Pesantren (100% Offline) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-4">
              {/* Mini UI Mockup inside card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 group-hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Status Jaringan</span>
                  <span className="text-slate-400 font-semibold">Mode Mandiri</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <WifiOff className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">100% Mode Offline</span>
                    <span className="text-[10px] text-slate-500">Aman Tanpa Paket Data</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Mode Pesantren Bebas Kuota
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                  Didesain khusus untuk lingkungan pondok pesantren dengan aturan ketat tanpa koneksi internet umum.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Internet Reqd</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. PLATFORMS MATRIX SECTION */}
        {/* ======================================================== */}
        <div className="space-y-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                DUKUNGAN SISTEM OPERASI
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                Pilih Platform Perangkat Anda
              </h2>
            </div>

            {/* Segmented Filter */}
            <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-slate-200/80 p-1 rounded-2xl">
              {[
                { id: 'all', label: 'Semua Platform (4)' },
                { id: 'desktop', label: 'Desktop (Windows & Mac)' },
                { id: 'mobile', label: 'Mobile (Android & iOS)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playClickTone();
                    setActiveCategory(tab.id as any);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.id}
                  className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-800 shrink-0">
                          <Icon className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                            {platform.category === 'desktop' ? 'Desktop App' : 'Mobile App'} • {platform.releaseQuarter}
                          </span>
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                            {platform.name}
                          </h3>
                        </div>
                      </div>

                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold shrink-0 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{platform.statusBadge.split('•')[0].trim()}</span>
                      </span>
                    </div>

                    {/* Architecture Specs */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs font-sans">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Dukungan OS:</span>
                        <span className="text-slate-800 font-semibold">{platform.osVersion}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Format Berkas:</span>
                        <span className="text-slate-800 font-semibold">{platform.format}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Mesin Komputasi:</span>
                        <span className="text-emerald-800 font-semibold">{platform.techSpec.split('•')[0].trim()}</span>
                      </div>
                    </div>

                    {/* Bullet List */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        Keunggulan Versi Ini:
                      </span>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {platform.highlights.map((h, i) => (
                          <li key={i} className="flex items-start space-x-2.5 leading-relaxed">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400 font-sans">
                      Status: <span className="text-slate-700 font-semibold">{platform.statusText}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenWaitlistModal(platform)}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-slate-300" />
                      <span>Daftar Akses Awal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. COMPARISON TABLE */}
        {/* ======================================================== */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
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
                  <th className="py-3 px-4 font-bold">Fitur &amp; Kemampuan</th>
                  <th className="py-3 px-4 font-bold text-slate-800">Web App (Aktif Saat Ini)</th>
                  <th className="py-3 px-4 font-bold text-emerald-800">Aplikasi Native (Dalam Pengembangan)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Evaluasi Suara Real-Time</td>
                  <td className="py-3.5 px-4 text-slate-600">Aktif (Melalui Browser Microphone)</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>0 Latensi (Local Neural Engine)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Penggunaan Offline di Pesantren</td>
                  <td className="py-3.5 px-4 text-slate-600">Perlu Koneksi Internet</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% Offline (Tanpa Kuota / Sinyal)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Penggunaan Memori &amp; Daya</td>
                  <td className="py-3.5 px-4 text-slate-600">Standar Tab Web Browser</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sangat Ringan (Binary Rust &amp; Kotlin)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Notifikasi Sholat &amp; Murojaah</td>
                  <td className="py-3.5 px-4 text-slate-600">Web Push Notification</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 flex items-center space-x-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Alarm Sistem, Widget Layar, &amp; Haptic</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Keamanan Data Hafalan</td>
                  <td className="py-3.5 px-4 text-slate-600">Tersimpan di Cloud Database</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Enkripsi Disk Lokal + Auto Cloud Backup</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. BOTTOM WEB APP FALLBACK BANNER */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 sm:p-10 rounded-3xl shadow-sm text-center space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mulai Hari Ini</span>
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mulai Menghafal di Peramban Web Anda Sekarang.
          </h3>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed font-sans">
            Seluruh fitur evaluasi suara AI, mushaf 30 juz, materi tajwid, dan mutaba'ah santri sudah dapat Anda akses langsung tanpa instalasi apapun.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app"
              onClick={() => playClickTone()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <span>Buka Aplikasi Web</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/app/tajwid"
              onClick={() => playClickTone()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs border border-white/20 transition-all"
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
      {/* MODAL 1: WAITLIST & EARLY ACCESS SIGNUP */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedPlatformForWaitlist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlatformForWaitlist(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 z-10 text-slate-800"
            >
              <button
                type="button"
                onClick={() => setSelectedPlatformForWaitlist(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {!isSuccessSubmitted ? (
                <form onSubmit={handleSubmitWaitlist} className="space-y-5">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                      Program Akses Awal
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Daftar Akses Awal {selectedPlatformForWaitlist.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Dapatkan tautan unduhan berkas resmi dan panduan instalasi saat aplikasi siap diuji coba.
                    </p>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Nama Lengkap / Santri
                      </label>
                      <input
                        type="text"
                        value={userNameInput}
                        onChange={(e) => setUserNameInput(e.target.value)}
                        placeholder="Contoh: Ahmad Rayhan"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Alamat Email Aktif <span className="text-emerald-700">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="nama@santri.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all font-sans"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="text-xs font-semibold text-slate-700 block mb-2">
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
                              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs'
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

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatformForWaitlist(null)}
                      className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingWaitlist}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
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
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">
                      Pendaftaran Diterima
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-sans">
                      Terima kasih! Kami akan memberi tahu Anda via email <span className="text-slate-800 font-semibold">{emailInput}</span> saat berkas rilis resmi {selectedPlatformForWaitlist.name} siap diunduh.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatformForWaitlist(null)}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
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
      {/* MODAL 2: QR CODE SCANNER MODAL */}
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
              className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 text-center space-y-4 z-10 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  Akses Cepat Smartphone
                </span>
                <h4 className="text-base font-black text-slate-900 tracking-tight">
                  Pindai Melalui Kamera Ponsel
                </h4>
              </div>

              {qrCodeDataUrl ? (
                <div className="p-3 bg-white rounded-2xl inline-block border border-slate-200 shadow-xs mx-auto">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Download"
                    className="w-44 h-44 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-xs text-slate-400">
                  Membuat QR Code...
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Arahkan kamera ponsel Anda ke QR code di atas untuk membuka halaman pendaftaran akses awal ini di smartphone.
              </p>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
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
