import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import type { UserProfile } from '../types';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
    if (token) {
      try {
        const cached = localStorage.getItem('hifzhly_user_profile') || localStorage.getItem('user');
        const role = cached ? (JSON.parse(cached).role || '').toLowerCase() : '';
        if (role === 'admin' || role === 'ustadz' || role === 'musyrif') {
          window.location.replace('/admin');
        } else {
          window.location.replace('/app');
        }
      } catch {
        window.location.replace('/app');
      }
    }
  }, []);

  const executeLogin = async (userIdentifier: string, userPass: string) => {
    setErrorMessage('');

    const cleanIdentifier = userIdentifier.trim();
    const cleanPass = userPass.trim();

    if (!cleanIdentifier || !cleanPass) {
      setErrorMessage('Username/email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: cleanIdentifier,
          password: cleanPass,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Username atau kata sandi tidak valid. Silakan periksa kembali.');
      }

      const loggedUser: UserProfile = data.user;
      const tokenStr: string = data.token;

      if (!loggedUser || !tokenStr) {
        throw new Error('Format respon autentikasi tidak valid dari server.');
      }

      // Pastikan role admin konsisten
      if (cleanIdentifier.toLowerCase() === 'admin' || cleanIdentifier.toLowerCase() === 'admin@hifzhly.id') {
        loggedUser.role = 'admin';
      }

      localStorage.setItem('hifzhly_auth_token', tokenStr);
      localStorage.setItem('token', tokenStr);
      localStorage.setItem('hifzhly_user_profile', JSON.stringify(loggedUser));
      localStorage.setItem('user', JSON.stringify(loggedUser));

      const role = (loggedUser.role || '').toLowerCase();
      if (role === 'admin' || role === 'ustadz' || role === 'musyrif') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/app';
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorMessage('Koneksi ke server waktu habis (timeout). Harap periksa jaringan internet Anda.');
      } else {
        setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menghubungi server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(identifier, password);
  };

  const handleQuickLoginAdmin = () => {
    setIdentifier('admin');
    setPassword('admin123');
    executeLogin('admin', 'admin123');
  };

  const handleQuickLoginSantri = () => {
    setIdentifier('ahmad_hifzh');
    setPassword('santri123');
    executeLogin('ahmad_hifzh', 'santri123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-screen">
        {/* Left Column: Scholarly Islamic Brand & Ayat Showcase (Hidden on small mobile, visible lg) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-emerald-900/50">
          {/* Subtle Watermark Islamic Calligraphy */}
          <div
            className="absolute -right-16 -bottom-16 font-quran text-[14rem] text-emerald-500/5 select-none pointer-events-none leading-none"
            dir="rtl"
            aria-hidden="true"
          >
            قرآن
          </div>

          {/* Top Brand Link */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <img
                src="/logo saja.png"
                alt="Hifzhly Logo"
                className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-105"
              />
              <span className="text-xl font-black tracking-tight text-white">Hifzhly</span>
            </Link>
          </div>

          {/* Center: Inspirational Quranic Ayat with High-Contrast Typography */}
          <div className="relative z-10 space-y-6 my-auto max-w-md">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kalamullah Penyejuk Jiwa</span>
            </div>

            <blockquote className="space-y-4">
              <p className="font-quran text-3xl leading-relaxed text-right text-emerald-200" dir="rtl">
                وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
              </p>
              <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/50 pl-4 font-serif">
                "Dan sungguh, telah Kami mudahkan Al-Qur'an untuk peringatan, maka adakah orang yang mau mengambil pelajaran?"
              </p>
              <footer className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                QS. Al-Qamar [54: 17]
              </footer>
            </blockquote>

            {/* Feature Highlights List */}
            <div className="pt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Evaluasi suara pelafalan per kata secara instan</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Jadwal pengulangan otomatis berbasis kurva lupa ilmiah</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Privasi rekaman suara memory-only tanpa penyimpanan audio permanen</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-6 border-t border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300/80">
            <span>Standar Mushaf Madinah &amp; Kemenag RI</span>
            <span className="font-semibold text-emerald-400">Tim FIFA © 2026</span>
          </div>
        </div>

        {/* Right Column: Clean, Polished Authentication Form */}
        <div className="flex-1 lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-12">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Top Navigation & Mobile Brand */}
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </Link>
              <div className="lg:hidden flex items-center space-x-2">
                <img src="/logo saja.png" alt="Hifzhly" className="w-7 h-7 object-contain" />
                <span className="font-extrabold text-slate-900 text-sm">Hifzhly</span>
              </div>
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Masuk ke Hifzhly
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Akses ruang murojaah hafalan mandiri santri maupun portal monitoring asatidz
              </p>
            </div>

            {/* Error Alert Box */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Direct Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Username / Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Username atau Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: ahmad_hifzh atau admin"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors focus:outline-hidden cursor-pointer"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 1-Click Demo Buttons for Fast Verification */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>Akses Cepat Pengujian Juri:</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleQuickLoginAdmin}
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    title="Masuk langsung sebagai Admin"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Demo Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickLoginSantri}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    title="Masuk langsung sebagai Santri"
                  >
                    <GraduationCap className="w-4 h-4 text-slate-500" />
                    <span>Demo Santri</span>
                  </button>
                </div>
              </div>

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Kredensial...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Hifzhly</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Links */}
            <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
              <p>
                Belum memiliki akun Hifzhly?{' '}
                <Link to="/register" className="font-bold text-emerald-700 hover:underline">
                  Daftar Akun Baru
                </Link>
              </p>
              <p className="text-[11px] text-slate-400">
                Dengan masuk, Anda menyetujui{' '}
                <Link to="/terms" className="text-slate-600 hover:underline">
                  Ketentuan Layanan &amp; Kebijakan Privasi Suara
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
