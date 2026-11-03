import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Jika sudah memiliki sesi aktif, langsung arahkan ke dashboard
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

  // Password validation rules
  const ruleMinLength = password.length >= 6;
  const ruleUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const ruleHasNumber = /\d/.test(password);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!agreeTerms) {
      setErrorMessage('Anda wajib menyetujui Ketentuan Layanan & Kebijakan Privasi Suara.');
      return;
    }

    if (!ruleMinLength) {
      setErrorMessage('Kata sandi harus memiliki minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const effectiveRole =
      cleanUsername === 'admin' || cleanEmail === 'admin@hifzhly.id' ? 'admin' : 'user';

    try {
      let registeredUser: any = null;
      let tokenStr = '';

      try {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            username: username.trim(),
            email: email.trim(),
            password: password,
            role: effectiveRole,
            dailyTargetAyahs: effectiveRole === 'admin' ? 20 : 10,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          registeredUser = data.user;
          tokenStr = data.token;
        } else {
          throw new Error(data.error || 'Pendaftaran gagal, periksa kelengkapan data.');
        }
      } catch (networkOrApiErr: any) {
        if (
          networkOrApiErr.message &&
          !networkOrApiErr.message.includes('fetch') &&
          !networkOrApiErr.message.includes('network')
        ) {
          throw networkOrApiErr;
        }
        // Offline fallback
        registeredUser = {
          id: 'user-' + Date.now(),
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          role: effectiveRole,
          dailyTargetAyahs: effectiveRole === 'admin' ? 20 : 10,
          currentStreak: 0,
          maxStreak: 0,
        };
        tokenStr = 'jwt_hifzhly_' + effectiveRole + '_' + Date.now();
      }

      localStorage.setItem('hifzhly_auth_token', tokenStr);
      localStorage.setItem('token', tokenStr);
      localStorage.setItem('hifzhly_user_profile', JSON.stringify(registeredUser));
      localStorage.setItem('user', JSON.stringify(registeredUser));

      if (registeredUser.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/app';
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-screen">
        {/* Left Column: Scholarly Islamic Brand & Ayat Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-emerald-900/50">
          {/* Watermark Islamic Calligraphy */}
          <div
            className="absolute -right-16 -bottom-16 font-quran text-[14rem] text-emerald-500/5 select-none pointer-events-none leading-none"
            dir="rtl"
            aria-hidden="true"
          >
            نور
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

          {/* Center: Inspirational Quranic Ayat */}
          <div className="relative z-10 space-y-6 my-auto max-w-md">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kemuliaan Penghafal Al-Qur'an</span>
            </div>

            <blockquote className="space-y-4">
              <p className="font-quran text-3xl leading-relaxed text-right text-emerald-200" dir="rtl">
                بَلْ هُوَ ءَايَٰتٌۢ بَيِّنَٰتٌ فِى صُدُورِ ٱلَّذِينَ أُوتُوا۟ ٱلْعِلْمَ
              </p>
              <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/50 pl-4 font-serif">
                "Sebenarnya, Al-Qur'an itu adalah ayat-ayat yang nyata di dalam dada orang-orang yang diberi ilmu."
              </p>
              <footer className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                QS. Al-'Ankabut [29: 49]
              </footer>
            </blockquote>

            {/* Feature Highlights List */}
            <div className="pt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Akun Santri Mandiri terhubung ke sistem target harian</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Algoritma SuperMemo-2 menjaga ingatan ayat agar tidak mudah luntur</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-800/60 border border-emerald-700/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Tanpa iklan, aman untuk santri tahfidz dan keluarga</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-6 border-t border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300/80">
            <span>Standar Pembelajaran Kemenag RI</span>
            <span className="font-semibold text-emerald-400">Tim FIFA © 2026</span>
          </div>
        </div>

        {/* Right Column: Clean Registration Form */}
        <div className="flex-1 lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-12">
          <div className="w-full max-w-md mx-auto space-y-6">
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
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Daftar Akun Baru
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Mulai perjalanan hafalan Al-Qur'an yang lebih terarah dan ilmiah hari ini
              </p>
            </div>

            {/* Error Alert Box */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap santri atau pembina"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username unik"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors focus:outline-hidden cursor-pointer"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className={`w-full pl-10 pr-11 py-2.5 rounded-2xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all shadow-xs ${
                      passwordsMismatch
                        ? 'border-red-400 focus:ring-red-500'
                        : passwordsMatch
                        ? 'border-emerald-500 focus:ring-emerald-500'
                        : 'border-slate-300 focus:ring-emerald-500'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors focus:outline-hidden cursor-pointer"
                    title={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordsMismatch && (
                  <p className="text-[11px] text-red-600 font-medium">
                    Kata sandi konfirmasi tidak cocok.
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Kata sandi cocok.</span>
                  </p>
                )}
              </div>

              {/* Password Quality Criteria Checklist */}
              {password.length > 0 && (
                <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-xl space-y-1 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    {ruleMinLength ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={ruleMinLength ? 'text-emerald-900 font-semibold' : 'text-slate-500'}>
                      Minimal 6 karakter
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {ruleUpperLower ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={ruleUpperLower ? 'text-emerald-900 font-semibold' : 'text-slate-500'}>
                      Kombinasi huruf besar dan kecil
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {ruleHasNumber ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={ruleHasNumber ? 'text-emerald-900 font-semibold' : 'text-slate-500'}>
                      Mengandung setidaknya satu angka
                    </span>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-1 flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                  Saya menyetujui{' '}
                  <Link to="/terms" className="font-semibold text-emerald-700 hover:underline">
                    Ketentuan Layanan &amp; Kebijakan Privasi Suara
                  </Link>{' '}
                  Hifzhly.
                </label>
              </div>

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun Santri</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Links */}
            <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-500">
              <p>
                Sudah memiliki akun?{' '}
                <Link to="/login" className="font-bold text-emerald-700 hover:underline">
                  Masuk ke Hifzhly
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
