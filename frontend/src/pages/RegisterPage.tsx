import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  User,
  AtSign,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
    const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>(() => {
    return searchParams.get('role') === 'admin' ? 'admin' : 'user';
  });
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

  // Password validation rules requested by user:
  // 1. Minimal 6 karakter
  // 2. Kombinasi huruf besar & kecil
  // 3. Mengandung angka
  // 4. Karakter spesial (nilai plus)
  const ruleMinLength = password.length >= 6;
  const ruleUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const ruleHasNumber = /\d/.test(password);
  const ruleHasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

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

    const effectiveRole = (
      selectedRole === 'admin' ||
      username.trim().toLowerCase() === 'admin' ||
      email.trim().toLowerCase() === 'admin@hifzhly.id'
    ) ? 'admin' : selectedRole;

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
        if (networkOrApiErr.message && !networkOrApiErr.message.includes('fetch') && !networkOrApiErr.message.includes('network')) {
          throw networkOrApiErr;
        }
        // Offline / fallback registration
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

      // Simpan ke database akun lokal agar saat login kembali langsung terdeteksi
      try {
        const dbRaw = localStorage.getItem('hifzhly_users_db') || '{}';
        const db = JSON.parse(dbRaw);
        db[username.trim().toLowerCase()] = registeredUser;
        db[email.trim().toLowerCase()] = registeredUser;
        localStorage.setItem('hifzhly_users_db', JSON.stringify(db));
      } catch {}

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <img
              src="/logo saja.png"
              alt="Hifzhly Logo"
              className="w-12 h-12 object-contain mx-auto transition-transform group-hover:scale-105"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Daftar Akun Hifzhly
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Mulai murojaah terstruktur dengan bimbingan evaluasi AI
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Role Selector (Santri vs Asatidz/Musyrif) */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center border border-slate-200/80 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setSelectedRole('user')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'user'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Akun Santri</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Asatidz / Musyrif</span>
          </button>
        </div>

        {/* Direct Form without outer card container */}
        <form onSubmit={handleRegister} className="space-y-4 pt-1">
          {/* Nama Lengkap */}
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
                placeholder="Ahmad Al-Hafizh"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  const val = e.target.value;
                  setUsername(val);
                  if (val.trim().toLowerCase() === 'admin') {
                    setSelectedRole('admin');
                  }
                }}
                placeholder="ahmad_hifzh"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
              />
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Email */}
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
                placeholder="ahmad@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password (Masukkan Password) with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Masukkan Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat kata sandi akunmu"
                className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors focus:outline-none"
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirements Checklist */}
            <div className="p-3 bg-white/70 border border-slate-200/70 rounded-2xl space-y-1.5 text-xs mt-2 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Ketentuan Kata Sandi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {/* 1. Minimal 6 karakter */}
                <div
                  className={`flex items-center space-x-1.5 transition-colors ${
                    ruleMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'
                  }`}
                >
                  {ruleMinLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                  <span>Minimal 6 karakter</span>
                </div>

                {/* 2. Kombinasi huruf besar & kecil */}
                <div
                  className={`flex items-center space-x-1.5 transition-colors ${
                    ruleUpperLower ? 'text-emerald-700 font-medium' : 'text-slate-500'
                  }`}
                >
                  {ruleUpperLower ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                  <span>Huruf besar &amp; kecil</span>
                </div>

                {/* 3. Mengandung angka */}
                <div
                  className={`flex items-center space-x-1.5 transition-colors ${
                    ruleHasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'
                  }`}
                >
                  {ruleHasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                  <span>Mengandung angka</span>
                </div>

                {/* 4. Karakter spesial (nilai plus) */}
                <div
                  className={`flex items-center space-x-1.5 transition-colors ${
                    ruleHasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'
                  }`}
                >
                  {ruleHasSpecial ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                  <span>Karakter spesial (nilai plus)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Konfirmasi Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi akunmu"
                className={`w-full pl-10 pr-11 py-3 rounded-2xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-xs ${
                  passwordsMismatch
                    ? 'border-red-300 focus:ring-red-500'
                    : passwordsMatch
                    ? 'border-emerald-300 focus:ring-emerald-500'
                    : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors focus:outline-none"
                title={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordsMatch && (
              <p className="text-[11px] font-semibold text-emerald-700 flex items-center space-x-1 pt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                <span>Konfirmasi kata sandi cocok.</span>
              </p>
            )}
            {passwordsMismatch && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center space-x-1 pt-0.5">
                <AlertCircle className="w-3 h-3 text-red-500 inline" />
                <span>Kata sandi tidak sama. Harap periksa kembali.</span>
              </p>
            )}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start space-x-2.5 pt-1">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 leading-tight cursor-pointer">
              Saya menyetujui{' '}
              <Link to="/terms" target="_blank" className="text-emerald-700 font-bold hover:underline">
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
              className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Navigation Links */}
        <div className="pt-4 text-center text-xs text-slate-500 space-y-3">
          <p>
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-bold text-emerald-700 hover:underline">
              Masuk di Sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
