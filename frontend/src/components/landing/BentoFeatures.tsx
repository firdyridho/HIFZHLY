import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Award, BarChart3, ShieldCheck, CheckCircle2, AlertTriangle, BookOpen, Check } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

export default function BentoFeatures() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isHoveredWave, setIsHoveredWave] = useState(false);

  return (
    <section className="py-24 max-w-6xl mx-auto px-4 w-full">
      {/* Section Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          <span>Bento Grid Interaktif</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Semua yang Kamu Butuhkan untuk Menjaga Hafalan
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2">
          Dirancang khusus untuk santri, pelajar, dan penghafal mandiri yang menginginkan standar talaqqi ilmiah tanpa batas waktu.
        </p>
      </motion.div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CARD 1: 7-col Bento: Smart Murojaah AI with Live Waveform */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex"
        >
          <InteractiveCard
            InteractiveColor="rgba(16, 185, 129, 0.28)"
            borderRadius="28px"
            rotationFactor={0.25}
            className="p-7 sm:p-8 flex flex-col justify-between group h-full"
            containerClassName="h-full"
          >
            <div
              onMouseEnter={() => setIsHoveredWave(true)}
              onMouseLeave={() => setIsHoveredWave(false)}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <Mic className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                  WER &lt; 10%
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Smart Murojaah AI Kata demi Kata
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl mb-6">
                Mengevaluasi suara pelafalan per ayat dengan penyejajaran Levenshtein. Deteksi kesalahan kata tertukar, terlewat, atau pengulangan berlebih secara seketika (&lt; 3 detik).
              </p>

              {/* Interactive Waveform Bar */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/70 mb-5 transition-colors group-hover:bg-emerald-50/30">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                  <span className="font-semibold text-slate-800">Visualizer Gelombang Suara (16 kHz Mono)</span>
                  <span className="text-[11px] font-mono text-emerald-700">
                    {isHoveredWave ? 'Mendeteksi Frekuensi...' : 'Arahkan Kursor untuk Menguji'}
                  </span>
                </div>

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

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Privasi Suara Memory-Only</span>
              </div>
              <Link
                to="/app"
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200/60 transition-all active:scale-95"
              >
                <span>Uji Murojaah</span>
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>

        {/* CARD 2: 5-col Bento: Peringatan Mutasyabihat */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 flex"
        >
          <InteractiveCard
            InteractiveColor="rgba(245, 158, 11, 0.25)"
            borderRadius="28px"
            rotationFactor={0.25}
            className="p-7 sm:p-8 flex flex-col justify-between group h-full"
            containerClassName="h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
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
                Hafalan tidak akan melompat ke surah lain. Sistem memetakan ayat-ayat berirama serupa di Juz 30 dan menandai perbedaannya secara visual.
              </p>

              {/* Popover Preview Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-800 space-y-2 font-sans transition-all group-hover:bg-amber-50">
                <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                  <span>Deteksi Mirip:</span>
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

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500">Mencegah Tertukar Hafalan</span>
              <Link
                to="/app/mushaf"
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200/60 transition-all active:scale-95"
              >
                <span>Buka Mushaf</span>
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>

        {/* CARD 3: 5-col Bento: Mutabaah Yaumi & Streak */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 flex"
        >
          <InteractiveCard
            InteractiveColor="rgba(14, 165, 233, 0.25)"
            borderRadius="28px"
            rotationFactor={0.25}
            className="p-7 sm:p-8 flex flex-col justify-between group h-full"
            containerClassName="h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
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
                Pencatatan mutabaah digital otomatis. Pantau streak konsistensi harian dan status retensi ayat secara transparan.
              </p>

              {/* Streak Tracker Bar */}
              <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Streak Mingguan Santri</span>
                  <span className="font-bold text-sky-700 font-mono">7 Hari Beruntun</span>
                </div>

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

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500">Analitik Adaptif</span>
              <Link
                to="/app/mutabaah"
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200/60 transition-all active:scale-95"
              >
                <span>Lihat Mutabaah</span>
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>

        {/* CARD 4: 7-col Bento: Tajwid Academy Interactive Mini-Quiz */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex"
        >
          <InteractiveCard
            InteractiveColor="rgba(20, 184, 166, 0.28)"
            borderRadius="28px"
            rotationFactor={0.25}
            className="p-7 sm:p-8 flex flex-col justify-between group h-full"
            containerClassName="h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                  <Award className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  Tajwid Academy &amp; Kuis
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Latihan Kuis Tajwid Interaktif &amp; Pembahasan
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl mb-5">
                Tidak hanya menguji hafalan, santri dibekali pemahaman kaidah makhraj dan hukum bacaan dengan layar review pembahasan ilmiah.
              </p>

              {/* Interactive Mini-Quiz Box */}
              <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Uji Interaktif Cepat:</span>
                  <span className="text-slate-500 text-[11px]">Hukum Nun Sukun &amp; Tanwin</span>
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

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500">Silabus Tajwid Lengkap</span>
              <Link
                to="/app/tajwid"
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200/60 transition-all active:scale-95"
              >
                <span>Buka Tajwid Academy</span>
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>
      </div>
    </section>
  );
}
