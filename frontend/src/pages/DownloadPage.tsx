import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
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
  Sparkles,
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
    statusText: 'Tahap Finalisasi Kompilasi',
    statusBadge: 'Dalam Pengembangan • v0.9 Pre-Release',
    icon: Monitor,
    releaseQuarter: 'Q1 2026',
    techSpec: 'Tauri v2 + Rust Core • Local ONNX Runtime',
    highlights: [
      'Mesin Speech AI offline mandiri tanpa membutuhkan kuota internet',
      'Latensi pengenalan suara 0 milidetik langsung dari mikrofon PC',
      'Pintasan keyboard global untuk setoran hafalan cepat saat beraktivitas',
      'Database hafalan dan riwayat murojaah tersimpan lokal di komputer',
    ],
  },
  {
    id: 'mac',
    name: 'macOS Desktop',
    category: 'desktop',
    osVersion: 'macOS 12 Monterey hingga 15 Sequoia',
    arch: 'Apple Silicon (M1–M4) & Intel Universal',
    format: 'Universal Package (.dmg)',
    statusText: 'Optimalisasi Metal Shaders',
    statusBadge: 'Dalam Pengembangan • Private Beta',
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
    statusBadge: 'Dalam Pengembangan • Closed Alpha',
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
    statusBadge: 'Dalam Pengembangan • TestFlight Preview',
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

  const heroRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

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

    if (heroRef.current && cardsContainerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.gsap-hero-elem', {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        });
        gsap.from('.gsap-card-elem', {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          delay: 0.2,
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
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => playClickTone()}
            className="flex items-center space-x-3 group"
          >
            <div className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 group-hover:text-emerald-700 group-hover:border-emerald-300 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <div className="flex items-center space-x-2">
              <img
                src="/logo saja.png"
                alt="Hifzhly Logo"
                className="w-6 h-6 object-contain"
              />
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Hifzhly<span className="text-emerald-600">.</span>
              </span>
              <span className="text-slate-300 mx-1 hidden sm:inline">|</span>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Aplikasi Desktop &amp; Mobile
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
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span>Buka di HP</span>
            </button>

            <Link
              to="/app"
              onClick={() => playClickTone()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <span>Gunakan Versi Web</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* HERO SECTION */}
        <div ref={heroRef} className="text-center max-w-3xl mx-auto space-y-4">
          <div className="gsap-hero-elem inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold font-mono tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Multi-Platform Native Suite • Dalam Tahap Akhir</span>
          </div>

          <h1 className="gsap-hero-elem text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Hafalan Lebih Kuat di Seluruh Perangkat Anda.
          </h1>

          <p className="gsap-hero-elem text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Kami sedang merampungkan aplikasi native mandiri untuk Windows, macOS, Android, dan iOS. Ditenagai pemrosesan suara lokal tanpa internet dan performa yang ringan.
          </p>

          {/* Clean Segmented Filter Bar */}
          <div className="gsap-hero-elem pt-3 flex items-center justify-center space-x-1.5">
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
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
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
              <div
                key={platform.id}
                className="gsap-card-elem bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Card Header */}
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

                  {/* Architecture Specification Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs font-sans">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Dukungan Sistem:</span>
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

                  {/* Highlights Bullet List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Karakteristik &amp; Keunggulan:
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

                {/* Card Action Button */}
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

        {/* COMPARISON TABLE: WEB APP VS NATIVE APP */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
              Perbandingan Arsitektur
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

        {/* BOTTOM CALL TO ACTION: WEB APP FALLBACK */}
        <div className="bg-emerald-900 text-white p-8 sm:p-10 rounded-3xl shadow-sm text-center space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Siap Digunakan Kapan Saja</span>
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mulai Menghafal di Peramban Web Anda Sekarang.
          </h3>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed font-sans">
            Seluruh fitur evaluasi suara AI, mushaf 30 juz, materi tajwid, dan mutaba'ah santri sudah dapat Anda akses langsung tanpa perlu instalasi tambahan.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app"
              onClick={() => playClickTone()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <span>Buka Aplikasi Web</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/app/tajwid"
              onClick={() => playClickTone()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <span>Pelajari Tajwid Academy</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Clean Scholarly Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12 text-center text-xs text-slate-500 font-mono">
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
