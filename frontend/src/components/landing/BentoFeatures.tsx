import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Award, BarChart3, ShieldCheck, CheckCircle2, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

export default function BentoFeatures() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isHoveredWave, setIsHoveredWave] = useState(false);

  return (
    <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 w-full relative">
      {/* Subtle Background Calligraphic Watermark */}
      <div
        aria-hidden="true"
        className="absolute -right-16 top-10 font-quran text-9xl sm:text-[160px] text-emerald-950/[0.025] pointer-events-none select-none whitespace-nowrap z-0"
      >
        اقْرَأْ بِاسْمِ رَبِّكَ
      </div>

      {/* Section Header: Editorial Typographic Direction */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 relative z-10 space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Pilar Teknologi &amp; Metodologi</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-tight">
          Semua yang Dibutuhkan untuk Menjaga Kemutqinan
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
          Integrasi cerdas antara speech recognition on-device, mushaf standar Kemenag RI, dan kurva memori FSRS dalam satu alur talaqqi mandiri.
        </p>
      </div>

      {/* Asymmetrical Bento Grid with Interactive Micro-Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* CARD 1: 7-col Bento — Smart Murojaah AI with Live Audio Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex"
        >
          <InteractiveCard
            InteractiveColor="rgba(16, 185, 129, 0.22)"
            borderRadius="28px"
            rotationFactor={0.2}
            className="p-6 sm:p-8 flex flex-col justify-between group h-full bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300"
            containerClassName="h-full w-full"
          >
            <div
              onMouseEnter={() => setIsHoveredWave(true)}
              onMouseLeave={() => setIsHoveredWave(false)}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                  <Mic className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 tracking-wider">
                  [ WER &lt; 5.75% ]
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Evaluasi Tilawah Suara Kata demi Kata
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2">
                  Penyejajaran Levenshtein presisi tinggi mendeteksi kesalahan substitusi huruf, harakat tertukar, atau kata terlewat secara instan (&lt; 3 detik).
                </p>
              </div>

              {/* Interactive Audio Waveform Simulation */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 transition-colors group-hover:bg-emerald-50/25 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Visualizer Gelombang Suara (16 kHz Mono)</span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">
                    {isHoveredWave ? 'Mendeteksi Frekuensi...' : 'Arahkan Kursor untuk Menguji'}
                  </span>
                </div>

                <div className="flex items-center justify-between h-10 px-1 gap-1 sm:gap-1.5">
                  {[28, 55, 40, 85, 70, 35, 80, 95, 55, 45, 65, 75, 50, 60, 38, 80, 65, 48].map((h, i) => (
                    <span
                      key={i}
                      className={`w-full rounded-full transition-all duration-300 ${isHoveredWave ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      style={{
                        height: isHoveredWave
                          ? `${Math.min(100, Math.max(25, h + Math.sin(i + 1) * 22))}%`
                          : `${h * 0.42}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-4">
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero Audio Server Recording</span>
              </div>
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <span>Uji Murojaah</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>

        {/* CARD 2: 5-col Bento — Mutasyabihat Early Warning */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 flex"
        >
          <InteractiveCard
            InteractiveColor="rgba(245, 158, 11, 0.2)"
            borderRadius="28px"
            rotationFactor={0.2}
            className="p-6 sm:p-8 flex flex-col justify-between group h-full bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300"
            containerClassName="h-full w-full"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                  <AlertTriangle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-800 tracking-wider">
                  [ TARTEEL QUL ]
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Peringatan Ayat Mutasyabihat
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2">
                  Mencegah tertukarnya ayat serupa berirama kembar dengan penanda visual rujukan sebelum santri terlanjur melompat surah.
                </p>
              </div>

              {/* Side-by-Side Verse Inspection Box */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5 font-sans">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 font-mono">
                  <span>QS. An-Naba' 78:1</span>
                  <span>vs</span>
                  <span>QS. Al-Mursalat 77:1</span>
                </div>
                <p className="font-quran text-lg text-right text-slate-900 leading-relaxed" dir="rtl">
                  عَمَّ يَتَسَآءَلُونَ ۝١ <span className="text-slate-400 font-sans text-xs">|</span> وَالْمُرْسَلَٰتِ عُرْفًا ۝١
                </p>
                <p className="text-[11px] text-slate-600 border-t border-amber-200/60 pt-2 leading-relaxed">
                  Pembeda wazan awal juz ditandai otomatis agar lisan tetap teguh pada surah target.
                </p>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500 font-medium">Standar Sanad &amp; Rasm</span>
              <Link
                to="/app/mushaf"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
              >
                <span>Buka Mushaf</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>

        {/* CARD 3: 5-col Bento — Mutabaah Yaumi & Streak */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 flex"
        >
          <InteractiveCard
            InteractiveColor="rgba(14, 165, 233, 0.2)"
            borderRadius="28px"
            rotationFactor={0.2}
            className="p-6 sm:p-8 flex flex-col justify-between group h-full bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300"
            containerClassName="h-full w-full"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                  <BarChart3 className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-mono font-bold text-sky-800 tracking-wider">
                  [ STREAK MUTQIN ]
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Mutabaah Digital Otomatis
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2">
                  Setiap setoran langsung terekam tanpa manual checklist. Memetakan konsistensi dawam dan status kemutqinan per ayat.
                </p>
              </div>

              {/* 7-Day Visual Streak Tracker */}
              <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Konsistensi Santri</span>
                  <span className="font-bold text-sky-800 font-mono">7 Hari Beruntun</span>
                </div>

                <div className="flex items-center justify-between">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ahd'].map((day, idx) => (
                    <div key={day} className="text-center space-y-1">
                      <span className="block text-[10px] text-slate-400 font-mono">{day}</span>
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${idx <= 5
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Retensi Rata-Rata</span>
                    <span className="font-mono font-bold text-slate-900">88%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full rounded-full transition-all duration-700" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500 font-medium">Buku Mutabaah Yaumi</span>
              <Link
                to="/app/mutabaah"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
              >
                <span>Lihat Mutabaah</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>

        {/* CARD 4: 7-col Bento — Tajwid Academy Interactive Practice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex"
        >
          <InteractiveCard
            InteractiveColor="rgba(20, 184, 166, 0.22)"
            borderRadius="28px"
            rotationFactor={0.2}
            className="p-6 sm:p-8 flex flex-col justify-between group h-full bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300"
            containerClassName="h-full w-full"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800">
                  <Award className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-mono font-bold text-teal-800 tracking-wider">
                  [ TAJWID ACADEMY ]
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Kuis Kaidah Tajwid &amp; Uji Lisan
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2">
                  Tidak hanya menguji hafalan, santri dibekali pemahaman hukum makharijul huruf dan shifatul huruf dengan pembahasan ilmiah.
                </p>
              </div>

              {/* Interactive Mini-Quiz Box */}
              <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Simulasi Kaidah Hukum:</span>
                  <span className="text-slate-500 text-[11px] font-mono">Nun Sukun &amp; Tanwin</span>
                </div>

                <p className="text-xs font-semibold text-slate-800">
                  Pada lafal <span className="font-quran text-lg px-2 py-0.5 bg-white rounded-lg border border-slate-200 font-normal">مَن يَقُولُ</span>, apa hukum tajwid yang berlaku?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 0, label: 'Idgham Bighunnah', correct: true },
                    { id: 1, label: 'Idzhar Halqi', correct: false },
                    { id: 2, label: 'Ikhfa Haqiqi', correct: false },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOption(opt.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${selectedOption === opt.id
                        ? opt.correct
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {selectedOption !== null && (
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed transition-all ${selectedOption === 0
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                  >
                    {selectedOption === 0 ? (
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Tepat!</strong> Nun Sukun (نْ) bertemu huruf Ya (ي). Cara bacanya melebur disertai ghunnah (dengung 2 harakat).
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Kurang Tepat.</strong> Nun Sukun bertemu Ya (ي) adalah Idgham Bighunnah.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500 font-medium">Silabus Tajwid Lengkap</span>
              <Link
                to="/app/tajwid"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <span>Buka Tajwid Academy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>
      </div>
    </section>
  );
}
