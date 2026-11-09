import { useState } from 'react';
import { Calendar, Mic, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

interface Step {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  icon: typeof Calendar;
  mockupTitle: string;
  mockupContent: React.ReactNode;
}

export default function TimelineWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  const STEPS: Step[] = [
    {
      id: 0,
      title: 'Buka Antrean Murojaah Hari Ini',
      subtitle: 'Tidak perlu bingung memilih surah yang harus dibaca.',
      desc: 'Setiap membuka Hifzhly, algoritma Spaced Repetition langsung mengelompokkan ayat-ayat yang jatuh tempo untuk diulang berdasarkan riwayat ingatanmu.',
      icon: Calendar,
      mockupTitle: 'Antrean SRS Murojaah (01 November 2026)',
      mockupContent: (
        <div className="space-y-3 font-sans text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">QS. An-Naba' [78: 1-10]</span>
              <span className="text-slate-500 text-[11px]">Interval terakhir: 3 hari lalu</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded-lg text-[10px]">
              Jatuh Tempo Hari Ini
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-700 block">QS. An-Nazi'at [79: 1-5]</span>
              <span className="text-slate-500 text-[11px]">Interval terakhir: 7 hari lalu</span>
            </div>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-semibold rounded text-[10px]">
              Jadwal Besok
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: 'Lafalkan Bacaan Melalui Mikrofon',
      subtitle: 'Standar audio 16 kHz Mono dengan Voice Activity Detection.',
      desc: 'Cukup tekan tombol mikrofon dan lafalkan ayat. Sistem memangkas jeda hening dan memproses audio dalam memori tanpa menyimpannya secara permanen.',
      icon: Mic,
      mockupTitle: 'Perekaman Suara Mandiri',
      mockupContent: (
        <div className="space-y-4 font-sans text-xs text-center py-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-700 mx-auto animate-pulse">
            <Mic className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-900 block text-sm">Menyimak Pelafalan Ayat 1...</span>
            <span className="text-slate-500 text-xs">Durasi: 00:04 • 16.000 Hz Mono</span>
          </div>
          <p className="font-quran text-xl text-slate-800" dir="rtl">
            عَمَّ يَتَسَآءَلُونَ ۝١
          </p>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Evaluasi Kata demi Kata Seketika',
      subtitle: 'Formula objektif Levenshtein menganalisis ketepatan bacaan.',
      desc: 'Dalam waktu kurang dari 3 detik, sistem menandai kata yang benar, tertukar, atau terlewat lengkap dengan nilai akurasi numerik.',
      icon: Sparkles,
      mockupTitle: 'Hasil Evaluasi Kata demi Kata',
      mockupContent: (
        <div className="space-y-3 font-sans text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center font-quran text-2xl" dir="rtl">
            <span className="text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">عَمَّ</span>{' '}
            <span className="text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">يَتَسَآءَلُونَ</span>{' '}
            <span className="text-amber-600 font-sans text-lg">۝١</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[10px] text-slate-500 block">Skor Ketepatan</span>
              <span className="text-base font-bold text-emerald-800">100%</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Kesalahan Kata</span>
              <span className="text-base font-bold text-slate-800">0 Kata</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Kurva Memori & Streak Bertambah',
      subtitle: 'Hafalan semakin melekat dan terekam dalam mutabaah otomatis.',
      desc: 'Bila bacaan lancar, interval pengulangan otomatis dimajukan ke 7 atau 14 hari berikutnya. Streak harianmu naik dan retensi terpelihara.',
      icon: TrendingUp,
      mockupTitle: 'Pembaruan Kurva Memori Mutqin',
      mockupContent: (
        <div className="space-y-3 font-sans text-xs">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <div>
                <span className="font-bold text-teal-900 block">Interval Diperbarui</span>
                <span className="text-teal-700 text-[11px]">Review berikutnya: +7 Hari</span>
              </div>
            </div>
            <span className="font-bold text-teal-800 text-sm">Rating: 5/5</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Streak Harian Santri:</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">+1 Hari (Total 8 Hari)</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 max-w-6xl mx-auto px-4 w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
          Alur Empat Tahap Murojaah
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Langkah Menuju Hafalan yang Melekat Kuat
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2">
          Rutinitas 15 menit setiap hari yang terbukti lebih efektif daripada menghafal berjam-jam tanpa jadwal review.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Interactive Timeline Steps */}
        <div className="lg:col-span-7 space-y-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start space-x-4 ${
                  isActive
                    ? 'bg-white border-emerald-600 shadow-md ring-1 ring-emerald-600/20'
                    : 'bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-emerald-800">
                      Langkah 0{idx + 1}
                    </span>
                    {isActive && (
                      <span className="text-[11px] font-bold text-emerald-700">
                        Aktif
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{step.subtitle}</p>
                  {isActive && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100 mt-2">
                      {step.desc}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Dynamic Live Screen Mockup wrapped in InteractiveCard */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <InteractiveCard
            InteractiveColor="rgba(16, 185, 129, 0.25)"
            borderRadius="28px"
            rotationFactor={0.2}
            className="p-6 sm:p-7"
            containerClassName="w-full shadow-xl shadow-slate-200/50"
          >
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">
                {STEPS[activeStep].mockupTitle}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Simulasi Layar</span>
            </div>

            {/* Dynamic Screen Content */}
            <div className="min-h-[220px] flex flex-col justify-center">
              {STEPS[activeStep].mockupContent}
            </div>

            <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Langkah {activeStep + 1} dari {STEPS.length}
              </span>
              <Link
                to="/app"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 hover:text-emerald-900 font-bold text-xs border border-emerald-200/60 shadow-xs transition-all active:scale-95"
              >
                <span>Coba Alur Ini</span>
              </Link>
            </div>
          </InteractiveCard>
        </motion.div>
      </div>
    </section>
  );
}
