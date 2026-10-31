import { Link } from 'react-router-dom';
import { Home, Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
          <Compass className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <span className="text-5xl font-extrabold text-slate-900 tracking-tight">404</span>
          <h1 className="text-xl font-bold text-slate-800 mt-2">Halaman Tidak Ditemukan</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Sepertinya halaman ayat atau modul yang kamu tuju belum tersedia atau tautannya telah berpindah.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Ke Beranda Murojaah</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>
      </div>
    </div>
  );
}

