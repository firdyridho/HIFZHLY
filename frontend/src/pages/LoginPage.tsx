import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [roleTab, setRoleTab] = useState<'user' | 'admin'>('user');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: identifier,
          password: password,
          expectedRole: roleTab,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal login, periksa kembali username dan password.');
      }

      // Simpan token JWT dan profil ringkas di LocalStorage
      localStorage.setItem('hifzhly_auth_token', data.token);
      localStorage.setItem('hifzhly_user_profile', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <img src="/logo saja.png" alt="Hifzhly" className="w-12 h-12 object-contain mx-auto" />
        </Link>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
          Masuk ke Akun Hifzhly
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Lanjutkan murojaah terjadwal dan pemantauan hafalanmu
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10 space-y-6">
          {/* Tab Switcher: Santri vs Admin */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRoleTab('user');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                roleTab === 'user'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Santri / Pengguna</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleTab('admin');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                roleTab === 'admin'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Ustaz</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username atau Alamat Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={roleTab === 'admin' ? 'admin_ustaz' : 'ahmad_hifzh'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 space-y-2">
            <p>
              Belum punya akun santri?{' '}
              <Link to="/register" className="font-bold text-emerald-700 hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
            <p>
              Dengan masuk, kamu menyetujui{' '}
              <Link to="/terms" className="text-slate-600 hover:underline">
                Ketentuan & Kebijakan Privasi Suara
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
