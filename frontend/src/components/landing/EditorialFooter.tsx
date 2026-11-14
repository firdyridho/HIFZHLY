import { Link } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  Smartphone,
  ArrowUp,
  Cpu,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function EditorialFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="border-t border-slate-200/90 bg-white text-slate-700 selection:bg-emerald-100 selection:text-emerald-900 mt-auto">
      {/* 1. Holy Quranic Calligraphic Inscription Ribbon */}
      <div className="border-b border-emerald-900/10 bg-gradient-to-b from-emerald-50/60 via-slate-50/30 to-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-[11px] font-bold text-emerald-800 tracking-wider uppercase font-sans">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ayat Peringatan &amp; Kemudahan Al-Qur'an</span>
          </div>

          <p className="font-quran text-2xl sm:text-3xl lg:text-4xl text-emerald-950 font-normal leading-loose tracking-wide pt-1">
            وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
          </p>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed italic">
            "Dan sungguh, telah Kami mudahkan Al-Qur'an untuk peringatan, maka adakah orang yang mau mengambil pelajaran?"
          </p>
          <p className="text-[11px] text-emerald-800 font-semibold tracking-widest uppercase">
            Surah Al-Qamar: 17 • Rujukan Standar Mushaf Kemenag RI
          </p>
        </div>
      </div>

      {/* 2. Main Editorial 4-Column Directory */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Identity & Scientific Vision (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <img
                src="/logo saja.png"
                alt="Logo Hifzhly"
                className="w-10 h-10 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
                  Hifzhly
                </span>
                <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">
                  AI Tahfizh &amp; Murojaah Ecosystem
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Platform asistensi murojaah Al-Qur'an cerdas berbasis Speech Recognition kata-demi-kata dan algoritma FSRS Spaced Repetition untuk menjaga kemutqinan hafalan para huffadz di seluruh Indonesia.
            </p>

            <div className="pt-2 flex flex-col space-y-2">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span>Audio Engine Memory-Only • Zero Data Leak</span>
              </div>
              <div className="inline-flex items-center space-x-2 text-xs font-medium text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Standar Sanad Riwayat Hafsh 'an 'Ashim</span>
              </div>
            </div>
          </div>

          {/* Column 2: Ekosistem Fitur (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Pilar Layanan</span>
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link to="/app/murojaah" className="hover:text-emerald-700 hover:underline transition-colors block py-0.5">
                  Murojaah Suara Real-time AI
                </Link>
              </li>
              <li>
                <Link to="/app/mushaf" className="hover:text-emerald-700 hover:underline transition-colors block py-0.5">
                  Mushaf Madinah &amp; Standar Kemenag
                </Link>
              </li>
              <li>
                <Link to="/app/tajwid" className="hover:text-emerald-700 hover:underline transition-colors block py-0.5">
                  Tajwid Academy &amp; Audio Rujukan
                </Link>
              </li>
              <li>
                <Link to="/app/mutabaah" className="hover:text-emerald-700 hover:underline transition-colors block py-0.5">
                  Mutabaah &amp; Heatmap Retensi FSRS
                </Link>
              </li>
              <li>
                <Link to="/app/doa" className="hover:text-emerald-700 hover:underline transition-colors block py-0.5">
                  Kumpulan Doa &amp; Adab Penghafal
                </Link>
              </li>
              <li>
                <Link to="/app/target" className="hover:text-emerald-700 hover:underline transition-colors block py-0.5">
                  Target Khatam &amp; Ritme Setoran
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tim Pengembang & Manifesto (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Tim Pengembang</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Karya khidmah ilmiah santri &amp; insinyur teknologi nusantara:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/developers"
                  className="group flex items-start space-x-2.5 p-2 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    FR
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors block">
                      Firdy Ridho Fillah
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Fullstack AI &amp; Systems Architect
                    </span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/developers"
                  className="group flex items-start space-x-2.5 p-2 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    FA
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors block">
                      Faeyza Ardellein Yaradhitya
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Product Designer &amp; Islamic UX
                    </span>
                  </div>
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  to="/developers"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  <span>Selami Profil Lengkap Pengembang</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Akses, Unduh & Legal (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>Akses &amp; Legal</span>
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link
                  to="/download"
                  className="hover:text-emerald-700 hover:underline transition-colors flex items-center space-x-1.5 py-0.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Unduh Aplikasi</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/login?role=admin"
                  className="hover:text-emerald-700 hover:underline transition-colors flex items-center space-x-1.5 py-0.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>Portal Musyrif</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-emerald-700 hover:underline transition-colors flex items-center space-x-1.5 py-0.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privasi &amp; Syarat</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar: Institutional Credits & Scroll-to-Top */}
      <div className="border-t border-slate-200/80 bg-slate-50/70 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="font-medium text-slate-600">
              &copy; 2026 <strong className="text-slate-800">Hifzhly</strong> &bull; Diciptakan dengan khidmah oleh{' '}
              <Link to="/developers" className="text-emerald-700 hover:underline font-semibold">
                Faeyza Ardellein Yaradhitya
              </Link>{' '}
              &amp;{' '}
              <Link to="/developers" className="text-emerald-700 hover:underline font-semibold">
                Firdy Ridho Fillah
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/developers" className="hover:text-emerald-700 hover:underline transition-colors">
              Halaman Pengembang
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/download" className="hover:text-emerald-700 hover:underline transition-colors">
              Unduh Versi Desktop
            </Link>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 hover:text-emerald-800 text-slate-700 transition-all font-medium cursor-pointer shadow-2xs"
              aria-label="Kembali ke bagian atas halaman"
            >
              <span>Ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

