import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight } from 'lucide-react';

export default function EditorialFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="bg-white border-t border-slate-100 py-16 sm:py-20 px-5 sm:px-8 lg:px-16 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-7xl mx-auto">
        {/* Quranic Verse — Quiet Scholarly Anchor (Zero Badges, Pure Type) */}
        <div className="mb-14 max-w-3xl">
          <p className="font-quran text-2xl sm:text-3xl text-emerald-950 leading-loose">
            وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ
          </p>
          <p className="mt-2 text-xs text-slate-400 italic">
            "Dan sungguh, telah Kami mudahkan Al-Qur'an untuk peringatan, maka adakah orang yang mau mengambil pelajaran?" &mdash; QS. Al-Qamar: 17
          </p>
        </div>

        <hr className="border-0 h-px bg-slate-100 mb-12" />

        {/* 4-Column Typographic Directory — No Badges, No Pill Boxes, No Icon Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 text-sm text-slate-500">
          {/* Col 1: Identity & Scientific Philosophy (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo saja.png"
                alt="Hifzhly"
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-black text-slate-900 tracking-tight text-base">Hifzhly</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Platform asistensi murojaah Al-Qur'an cerdas berbasis Speech Recognition kata-demi-kata dan algoritma FSRS Spaced Repetition untuk menjaga kemutqinan hafalan para huffadz di seluruh Indonesia.
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Standar Mushaf Madinah &amp; Rasm Utsmani Lajnah Pentashihan Kemenag RI.
            </p>
          </div>

          {/* Col 2: Pilar Layanan (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Pilar Layanan
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link to="/app/murojaah" className="hover:text-slate-900 transition-colors block">
                  Murojaah Suara Real-time AI
                </Link>
              </li>
              <li>
                <Link to="/app/mushaf" className="hover:text-slate-900 transition-colors block">
                  Mushaf Madinah 15 Baris
                </Link>
              </li>
              <li>
                <Link to="/app/tajwid" className="hover:text-slate-900 transition-colors block">
                  Tajwid Academy &amp; Audio Rujukan
                </Link>
              </li>
              <li>
                <Link to="/app/mutabaah" className="hover:text-slate-900 transition-colors block">
                  Mutabaah &amp; Heatmap Retensi FSRS
                </Link>
              </li>
              <li>
                <Link to="/app/doa" className="hover:text-slate-900 transition-colors block">
                  Kumpulan Doa &amp; Adab Penghafal
                </Link>
              </li>
              <li>
                <Link to="/app/target" className="hover:text-slate-900 transition-colors block">
                  Target Khatam &amp; Ritme Setoran
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tim Pengembang — Pure Clean Typography (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Tim Pengembang
            </p>
            <ul className="space-y-3 text-xs">
              <li>
                <Link to="/developers" className="group block">
                  <span className="font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors block">
                    Faeyza Ardellein Yaradhitya
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Product Designer &amp; Islamic UX
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/developers" className="group block">
                  <span className="font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors block">
                    Firdy Ridho Fillah
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Fullstack AI &amp; Systems Architect
                  </span>
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  to="/developers"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>Profil Lengkap Pengembang</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Akses & Legal (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Akses &amp; Legal
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link to="/download" className="hover:text-slate-900 transition-colors block">
                  Unduh Aplikasi
                </Link>
              </li>
              <li>
                <Link to="/login?role=admin" className="hover:text-slate-900 transition-colors block">
                  Portal Musyrif
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-slate-900 transition-colors block">
                  Ketentuan Layanan
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-slate-900 transition-colors block">
                  Privasi Suara (Memory-Only)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-0 h-px bg-slate-100 my-12" />

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; 2026 Hifzhly &mdash; Diciptakan dengan khidmah oleh{' '}
            <Link to="/developers" className="text-slate-600 hover:text-slate-900 font-semibold transition-colors">
              Faeyza Ardellein Yaradhitya
            </Link>{' '}
            &amp;{' '}
            <Link to="/developers" className="text-slate-600 hover:text-slate-900 font-semibold transition-colors">
              Firdy Ridho Fillah
            </Link>
            .
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ke atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
