import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import QRCode from 'qrcode';
import {
  Monitor,
  Smartphone,
  Apple,
  Sparkles,
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
} from 'lucide-react';
import { playSuccessChime, playClickTone } from '../lib/soundUtils';

// Types
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
    osVersion: 'Windows 10 / 11 (64-bit)',
    arch: 'x64 & ARM64 Native',
    format: '.exe Setup / Portable .zip',
    statusText: 'Tahap Finalisasi Kompilasi',
    statusBadge: 'Coming Soon • v0.9 Pre-Release',
    icon: Monitor,
    releaseQuarter: 'Q1 2026',
    techSpec: 'Tauri v2 + Rust Core • Local ONNX Runtime',
    highlights: [
      'Mesin Speech AI offline mandiri tanpa membutuhkan kuota internet',
      'Latensi pengenalan suara 0 milidetik langsung dari mikrofon PC',
      'Shortcut global untuk setoran hafalan cepat saat beraktivitas',
      'Penyimpanan database hafalan terenkripsi lokal di disk',
    ],
  },
  {
    id: 'mac',
    name: 'macOS Desktop',
    category: 'desktop',
    osVersion: 'macOS Monterey 12 s/d Sequoia 15',
    arch: 'Apple Silicon (M1–M4) & Intel Universal',
    format: 'Universal .dmg Installer',
    statusText: 'Optimalisasi Metal Shaders',
    statusBadge: 'Coming Soon • Private Beta',
    icon: Apple,
    releaseQuarter: 'Q1 2026',
    techSpec: 'Apple Metal Performance Shaders • Native Cocoa',
    highlights: [
      'Akselerasi hardware Neural Engine Apple Silicon super hemat daya',
      'Widget Menu Bar status hafalan harian dan waktu sholat',
      'Desain antarmuka native macOS dengan glassmorphism eksklusif',
      'Zero fan noise & performa evaluasi tilawah instan',
    ],
  },
  {
    id: 'android',
    name: 'Android Mobile',
    category: 'mobile',
    osVersion: 'Android 9.0 (Pie) s/d Android 15',
    arch: 'arm64-v8a & armeabi-v7a',
    format: 'Google Play Store & APK Langsung',
    statusText: 'Uji Coba Closed Alpha Pesantren',
    statusBadge: 'Coming Soon • Closed Alpha',
    icon: Smartphone,
    releaseQuarter: 'Q2 2026',
    techSpec: 'Kotlin Native Modules • TensorFlow Lite / ONNX',
    highlights: [
      'Getaran haptik responsif seketika saat terdeteksi salah makhraj',
      'Mode Asrama Pesantren (100% offline tanpa sinyal seluler)',
      'Widget Homescreen jadwal review hafalan (SuperMemo-2)',
      'Audio player murottal 30 juz berlatar belakang saat layar mati',
    ],
  },
  {
    id: 'ios',
    name: 'iOS & iPadOS Mobile',
    category: 'mobile',
    osVersion: 'iOS 16.0+ (iPhone & iPad)',
    arch: 'Apple Neural Engine CoreML',
    format: 'Apple App Store & TestFlight Beta',
    statusText: 'Persiapan Pengujian TestFlight',
    statusBadge: 'Coming Soon • TestFlight Preview',
    icon: Smartphone,
    releaseQuarter: 'Q2 2026',
    techSpec: 'SwiftUI • CoreML Offline Recitation Engine',
    highlights: [
      'Dukungan Dynamic Island & Live Activities durasi murojaah',
      'Integrasi Siri Shortcuts "Mulai Murojaah Surah Al-Mulk"',
      'Sinkronisasi aman via Apple CloudKit dan akun santri',
      'Antarmuka iPad split-view mushaf digital dan evaluasi suara',
    ],
  },
];

// React Bits style Interactive Spotlight Card Component
function SpotlightCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 transition-all duration-300 hover:border-slate-700 hover:shadow-2xl ${className}`}
    >
      {/* Radial Spotlight Overlay following mouse cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.12), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

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

  // GSAP Entrance Stagger Animation
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate QR Code for Mobile quick share / waitlist
    QRCode.toDataURL(window.location.href, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#022c22',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.warn('QR code gen warning:', err));

    // GSAP Stagger Entrance
    if (heroRef.current && cardsContainerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.gsap-hero-item', {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
        });
        gsap.from('.gsap-card-item', {
          y: 35,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.25,
          ease: 'power3.out',
        });
      });
      return () => ctx.revert();
    }
  }, []);

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
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-x-hidden">
      {/* Subtle Matrix Dot Grid Background (Clean & High-tech) */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

      {/* Top Ambient Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
        <Link
          to="/"
          className="flex items-center space-x-3 group"
          onClick={() => playClickTone()}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500 transition-colors shadow-xs">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase block">
              Hifzhly Cross-Platform Suite
            </span>
            <span className="text-base font-extrabold text-white tracking-tight">
              Aplikasi Mandiri
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              playClickTone();
              setIsQrModalOpen(true);
            }}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan QR Ponsel</span>
          </button>

          <Link
            to="/app"
            onClick={() => playClickTone()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <span>Buka Web App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* HERO SECTION */}
        <div ref={heroRef} className="text-center max-w-3xl mx-auto space-y-5">
          <div className="gsap-hero-item inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-emerald-400 text-xs font-semibold font-mono tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tahap Pengembangan Akhir • Multi-Platform Native</span>
          </div>

          <h1 className="gsap-hero-item text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Bawa Hifzhly ke Seluruh{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Perangkat Anda.
            </span>
          </h1>

          <p className="gsap-hero-item text-sm sm:text-base text-slate-400 leading-relaxed font-sans max-w-2xl mx-auto">
            Aplikasi mandiri desktop dan mobile dengan performa native instan, model evaluasi tilawah offline tanpa kuota, dan sinkronisasi cloud mutaba'ah santri.
          </p>

          {/* Category Filter Pills */}
          <div className="gsap-hero-item pt-4 flex items-center justify-center space-x-2">
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeCategory === tab.id
                    ? 'bg-slate-100 text-slate-950 border-white shadow-sm font-extrabold'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 PLATFORMS GRID */}
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <SpotlightCard key={platform.id} className="gsap-card-item p-7 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Platform Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-13 h-13 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            {platform.category === 'desktop' ? 'Desktop App' : 'Mobile App'}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold">
                            • {platform.releaseQuarter}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                          {platform.name}
                        </h3>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold font-mono shrink-0">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{platform.statusBadge.split('•')[0].trim()}</span>
                    </span>
                  </div>

                  {/* Architecture & Format Specs */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Dukungan Sistem:</span>
                      <span className="text-slate-200 font-medium">{platform.osVersion}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Arsitektur &amp; Format:</span>
                      <span className="text-slate-300 font-medium">{platform.format}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Mesin Komputasi:</span>
                      <span className="text-emerald-400 font-medium">{platform.techSpec.split('•')[0].trim()}</span>
                    </div>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Keunggulan Versi Native:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {platform.highlights.map((h, i) => (
                        <li key={i} className="flex items-start space-x-2.5 leading-relaxed">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Status: <span className="text-slate-300 font-semibold">{platform.statusText}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenWaitlistModal(platform)}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer group"
                  >
                    <Bell className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                    <span>Dapatkan Akses Awal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* COMPARISON TABLE: WEB APP VS NATIVE APP */}
        <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div className="max-w-2xl space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Arsitektur &amp; Performa
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Mengapa Aplikasi Native Jauh Lebih Tangguh?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Perbandingan kemampuan antarmuka Web App (yang saat ini berjalan di browser) dengan versi Native Desktop dan Mobile yang sedang kami rampungkan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-3 px-4 font-bold">Kapabilitas Fitur</th>
                  <th className="py-3 px-4 font-bold">Web App (Live Sekarang)</th>
                  <th className="py-3 px-4 font-bold text-emerald-400">Aplikasi Native (Desktop / Mobile)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300 font-sans">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Evaluasi Recitation Suara</td>
                  <td className="py-3.5 px-4 text-slate-400">Real-Time (Streaming Web Audio)</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>0 Latensi Murni (Local Neural Inference)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Akses Offline di Pesantren</td>
                  <td className="py-3.5 px-4 text-slate-400">Memerlukan Koneksi Server</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>100% Offline (Tanpa Kuota / Sinyal)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Konsumsi Memori &amp; Baterai</td>
                  <td className="py-3.5 px-4 text-slate-400">Standar Browser Tab Chromium</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Super Ringan (~35 MB RAM Rust/Kotlin)</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Notifikasi Murojaah &amp; Sholat</td>
                  <td className="py-3.5 px-4 text-slate-400">Web Push (Saat Browser Terbuka)</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Native OS Alarms, Widget, &amp; Haptic</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Keamanan &amp; Enkripsi</td>
                  <td className="py-3.5 px-4 text-slate-400">HTTPS &amp; Cookie / Token Web</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>OS Keychain / Keystore Enkripsi Lokal</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION: WEB APP FALLBACK */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 text-center space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tidak Perlu Menunggu Versi Native</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gunakan Versi Web App Hifzhly Sekarang Juga.
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Seluruh fitur AI voice alignment, mushaf 30 juz, materi tajwid, dan mutaba'ah santri sudah dapat diakses langsung lewat peramban web di laptop maupun smartphone Anda.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app"
              onClick={() => playClickTone()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <span>Mulai di Browser Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/app/tajwid"
              onClick={() => playClickTone()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all"
            >
              <span>Pelajari Tajwid Academy</span>
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 font-mono">
        <p>Hifzhly Cross-Platform Suite • Tim FIFA Universitas Sultan Ageng Tirtayasa</p>
      </footer>

      {/* ======================================================== */}
      {/* MODAL 1: WAITLIST & EARLY ACCESS SIGNUP */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedPlatformForWaitlist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlatformForWaitlist(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 z-10 text-slate-100"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedPlatformForWaitlist(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {!isSuccessSubmitted ? (
                <form onSubmit={handleSubmitWaitlist} className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                      Program Early Access Santri
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Daftar Akses Awal {selectedPlatformForWaitlist.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Jadilah yang pertama mencoba berkas installer resmi saat rilis. Kami akan mengirimkan tautan download dan instruksi pemasangan langsung ke email Anda.
                    </p>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Nama Lengkap / Panggilan
                      </label>
                      <input
                        type="text"
                        value={userNameInput}
                        onChange={(e) => setUserNameInput(e.target.value)}
                        placeholder="Contoh: Ahmad Rayhan"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Alamat Email Aktif <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="nama@santri.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                      />
                    </div>

                    {/* Platform Checkbox Selection */}
                    <div className="pt-1">
                      <label className="text-xs font-semibold text-slate-300 block mb-2">
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
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <span>{p.label}</span>
                              {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatformForWaitlist(null)}
                      className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingWaitlist}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmittingWaitlist ? (
                        <span>Mendaftarkan...</span>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5" />
                          <span>Kirim &amp; Dapatkan Undangan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* SUCCESS STATE */
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xl font-black text-white tracking-tight">
                      Pendaftaran Berhasil!
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
                      Terima kasih! Kami telah mencatat email <span className="text-emerald-300 font-semibold">{emailInput}</span> untuk notifikasi berkas rilis resmi {selectedPlatformForWaitlist.name}.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPlatformForWaitlist(null)}
                      className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      Tutup
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 text-center space-y-5 z-10"
            >
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Scan Lewat Smartphone
                </span>
                <h4 className="text-lg font-black text-white tracking-tight">
                  Akses Halaman Download di HP
                </h4>
              </div>

              {qrCodeDataUrl ? (
                <div className="p-4 bg-white rounded-2xl inline-block shadow-xl mx-auto border-4 border-slate-800">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Download"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center text-xs text-slate-400">
                  Membuat QR Code...
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Arahkan kamera ponsel Anda ke QR code di atas untuk mendaftar beta tester Android / iOS secara langsung.
              </p>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
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
