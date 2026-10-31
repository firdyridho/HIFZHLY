import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Award, BarChart3, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, BookOpen, Check } from 'lucide-react';

export default function BentoFeatures() {
  // State for interactive mini-quiz in Bento card
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isHoveredWave, setIsHoveredWave] = useState(false);

  return (
    <section className="py-20 max-w-6xl mx-auto px-4 w-full">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          <span>Bento Grid Fungsional</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Semua yang Kamu Butuhkan untuk Menjaga Hafalan
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2">
          Dirancang khusus untuk santri, pelajar, dan penghafal mandiri yang menginginkan standar talaqqi ilmiah tanpa batas waktu.
        </p>
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
        {/* CARD 1: Large 7-col Bento: Smart Murojaah AI with Live Waveform */}
        <div
          onMouseEnter={() => setIsHoveredWave(true)}
          onMouseLeave={() => setIsHoveredWave(false)}
          className="lg:col-span-7 bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <Mic className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                Word Error Rate &lt; 10%
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Smart Murojaah AI Kata demi Kata
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl mb-6">
              Mengevaluasi rekaman suara pelafalan per ayat dengan pencocokan edit distance Levenshtein. Deteksi kesalahan kata tertukar, terlewat, atau pengulangan berlebih secara seketika (&lt; 3 detik).
            </p>

            {/* Interactive Waveform & Audio Sandbox Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 mb-4 transition-colors group-hover:bg-emerald-50/30">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                <span className="font-semibold text-slate-800">Visualizer Gelombang Suara (16 kHz Mono)</span>
                <span className="text-[11px] font-mono text-emerald-700">
                  {isHoveredWave ? 'Mendeteksi Frekuensi...' : 'Arahkan Kursor untuk Menguji'}
                </span>
              </div>

              {/* Dynamic Waveform Bars */}
              <div className="flex items-center justify-between h-10 px-2 gap-1.5">
                {[30, 60, 45, 90, 75, 40, 85, 95, 60, 50, 70, 80, 55, 65, 40, 85, 70, 50].map((h, i) => (
                  <span
                    key={i}
                    className={`w-full rounded-full transition-all duration-300 ${
                      isHoveredWave ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    style={{
                      height: isHoveredWave
                        ? `${Math.min(100, Math.max(25, h + Math.sin(i + 1) * 20))}%`
                        : `${h * 0.4}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Privasi Suara Memory-Only</span>
            </div>
            <Link
              to="/app"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 group/link"
            >
              <span>Uji Murojaah</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* CARD 2: 5-col Bento: Peringatan Mutasyabihat with Popover Preview */}
        <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                <AlertTriangle className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Tarteel QUL Standard
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Peringatan Dini Ayat Serupa
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
              Hafalan tidak akan melompat ke surah lain. Sistem memetakan ayat-ayat yang berirama serupa di Juz 30 dan menandai perbedaannya secara visual.
            </p>

            {/* Interactive Popover Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 space-y-2 font-sans transition-all group-hover:bg-amber-50">
              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                <span>Contoh Deteksi Mirip</span>
                <span className="font-mono">QS. An-Naba' 78:1</span>
              </div>
              <p className="font-quran text-lg text-right text-slate-900" dir="rtl">
                عَمَّ يَتَسَآءَلُونَ ۝١
              </p>
              <p className="text-[11px] text-slate-600 border-t border-amber-200/60 pt-1.5 leading-snug">
                Pembeda dengan ayat pembuka surah lain: diakhiri mad wajib muttashil 4–5 harakat.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Mencegah Tertukar Hafalan</span>
            <Link
              to="/app/mushaf"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 group/link"
            >
              <span>Buka Mushaf</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* CARD 3: 5-col Bento: Mutabaah Yaumi & Streak Retention */}
        <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-sky-400/50 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                <BarChart3 className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                Streak Otomatis
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Mutabaah Yaumi & Analitik Hafalan
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
              Pencatatan mutabaah digital tanpa perlu mengisi checklist fisik. Pantau streak konsistensi harian dan status retensi ayat secara transparan.
            </p>

            {/* Interactive Streak Days Tracker Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Streak Mingguan Santri</span>
                <span className="font-bold text-sky-700 font-mono">7 Hari Beruntun</span>
              </div>

              {/* 7 Day Status Circles */}
              <div className="flex items-center justify-between">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ahad'].map((day, idx) => (
                  <div key={day} className="text-center space-y-1">
                    <span className="block text-[10px] text-slate-500">{day}</span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        idx <= 5
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Retensi Ayat Mutqin</span>
                  <span className="font-semibold text-slate-900">88%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full transition-all duration-700" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Analitik Adaptif</span>
            <Link
              to="/app/mutabaah"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 group/link"
            >
              <span>Lihat Mutabaah</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* CARD 4: 7-col Bento: Tajwid Academy Interactive Mini-Quiz Sandbox */}
        <div className="lg:col-span-7 bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Award className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                Tajwid Academy & Kuis
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Latihan Kuis Tajwid Interaktif & Pembahasan
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl mb-5">
              Tidak hanya menguji hafalan, santri dibekali pemahaman kaidah makhraj dan hukum bacaan. Setiap butir soal dilengkapi layar review pembahasan ilmiah.
            </p>

            {/* Interactive Mini-Quiz Box */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Uji Interaktif Cepat:</span>
                <span className="text-slate-500 text-[11px]">Hukum Nun Sukun & Tanwin</span>
              </div>

              <p className="text-xs font-medium text-slate-800">
                Pada lafal <span className="font-quran text-lg px-1.5 py-0.5 bg-white rounded border border-slate-200 font-normal">مَن يَقُولُ</span>, apa hukum tajwid yang berlaku?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 0, label: 'A. Idgham Bighunnah', correct: true },
                  { id: 1, label: 'B. Idzhar Halqi', correct: false },
                  { id: 2, label: 'C. Ikhfa Haqiqi', correct: false },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                      selectedOption === opt.id
                        ? opt.correct
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Feedback Explanation */}
              {selectedOption !== null && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed transition-all ${
                    selectedOption === 0
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  {selectedOption === 0 ? (
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Benar!</strong> Terjadi pertemuan Nun Sukun (نْ) dengan huruf Ya (ي). Dibaca melebur disertai dengung 2 harakat.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Kurang Tepat.</strong> Nun Sukun bertemu huruf Ya (ي) adalah Idgham Bighunnah. Klik opsi A untuk penjelasannya.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Silabus Tajwid Lengkap</span>
            <Link
              to="/app/tajwid"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 group/link"
            >
              <span>Buka Tajwid Academy</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
