import { Link } from 'react-router-dom';
import { Mic, Sparkles, Award, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Landing Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo saja.png" alt="Hifzhly Logo" className="w-10 h-10 object-contain drop-shadow-xs" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Hifzhly</span>
              </div>
              <p className="text-[11px] text-slate-500">Platform Pendamping Murojaah Al-Qur'an</p>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              Daftar Santri
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-emerald-50/30 to-slate-50">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-md text-xs font-medium text-emerald-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Inclusive Education and Future Skills • Tim FIFA</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Murojaah Al-Qur'an Lebih Melekat dengan <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Kecerdasan Buatan & Spaced Repetition
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Hifzhly mengevaluasi ketepatan pelafalan ayat hafalanmu secara mandiri kata demi kata, 
            menjadwalkan pengulangan berdasarkan kurva lupa ilmiah, dan memperdalam kaidah tajwid lewat kuis interaktif.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
            >
              <Mic className="w-5 h-5" />
              <span>Mulai Murojaah Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/app/tajwid"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-xs transition-all"
            >
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Pelajari Tajwid Academy</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Kemenag RI (EQuran.id API v2)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tarteel QUL Mutasyabihat</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Privasi Suara 100% Aman</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4 Pillars Feature Section */}
      <section className="py-16 max-w-6xl mx-auto px-4 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest font-extrabold text-emerald-700">Fitur Unggulan</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Empat Pilar Pembelajaran Murojaah Modern
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Smart Murojaah AI</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Evaluasi suara pelafalan per ayat dengan penyorotan kata keliru (tertukar, terlewat, berlebih) menggunakan formula objektif Levenshtein.
              </p>
            </div>
            <Link to="/app" className="mt-4 inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:underline">
              <span>Coba Evaluasi Suara</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Adaptive SRS Engine</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Mesin Spaced Repetition (SuperMemo-2 adaptif). Ayat yang masih lemah diulang lebih cepat, ayat yang mutqin diberi jeda lebih panjang.
              </p>
            </div>
            <Link to="/app" className="mt-4 inline-flex items-center space-x-1 text-xs font-bold text-teal-700 hover:underline">
              <span>Lihat Jadwal Hari Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Tajwid Academy</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Kuasai hukum bacaan tajwid lewat modul ringkas, video YouTube penjelas, kuis interaktif, dan layar review pembahasan mendalam.
              </p>
            </div>
            <Link to="/app/tajwid" className="mt-4 inline-flex items-center space-x-1 text-xs font-bold text-amber-700 hover:underline">
              <span>Buka Modul & Kuis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Mutabaah Digital</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Pencatatan mutabaah otomatis, pelacak streak harian, dan peta retensi surah (heatmap) untuk memantau konsistensi hafalan santri.
              </p>
            </div>
            <Link to="/app/mutabaah" className="mt-4 inline-flex items-center space-x-1 text-xs font-bold text-sky-700 hover:underline">
              <span>Pantau Analitik</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 w-full pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-xl shadow-emerald-950/20 text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold">Siap Menjaga Hafalan Al-Qur'anmu Hari Ini?</h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto">
            Bergabunglah bersama santri dan penghafal mandiri lainnya dalam menjaga kalamullah dengan bimbingan teknologi modern.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Daftar Akun Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-3">
            <img src="/hafizhly_panjang.png" alt="Hifzhly" className="h-6 w-auto object-contain" />
            <span className="text-slate-300">|</span>
            <Link to="/terms" className="hover:text-emerald-700 hover:underline">
              Ketentuan Layanan & Privasi Suara
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/login" className="hover:text-emerald-700 hover:underline">
              Portal Admin / Ustaz
            </Link>
          </div>
          <p>© 2026 Tim FIFA - Universitas Sultan Ageng Tirtayasa.</p>
        </div>
      </footer>
    </div>
  );
}
